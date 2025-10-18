import pytest
import pandas as pd
from unittest.mock import MagicMock, patch
from botocore.exceptions import ClientError
from src.commands.create_products_bulk import CreateProductsBulk
from src.errors.errors import ApiError


class TestCreateProductsBulkCommand:

    # ✅ Caso exitoso con archivo CSV válido
    @patch("boto3.resource")
    def test_execute_carga_masiva_exitosa(self, mock_dynamodb):
        """✅ Carga masiva exitosa con productos válidos"""
        mock_table = MagicMock()
        mock_dynamodb.return_value.Table.return_value = mock_table
        mock_batch = MagicMock()
        mock_table.batch_writer.return_value.__enter__.return_value = mock_batch

        # DataFrame con productos válidos
        df = pd.DataFrame([
            {
                "provider_nit": "1234567890",
                "name": "Acetaminofén",
                "product_type": "Medicamento",
                "stock": 100,
                "expiration_date": "2030-12-31",
                "temperature_required": 25,
                "batch": "L001",
                "status": "Disponible",
                "unit_value": 2.5,
                "storage_conditions": "Lugar fresco"
            },
            {
                "provider_nit": "9876543210",
                "name": "Ibuprofeno",
                "product_type": "Medicamento",
                "stock": 50,
                "expiration_date": "2030-10-10",
                "temperature_required": 22,
                "batch": "L002",
                "status": "Disponible",
                "unit_value": 3.0,
                "storage_conditions": "Seco y fresco"
            }
        ])

        with patch.object(CreateProductsBulk, "_read_file", return_value=df):
            cmd = CreateProductsBulk(b"fake_bytes", "productos.csv")
            cmd.table = mock_table
            mock_table.scan.return_value = {"Items": []}  # 🔧 <--- Agrega esto
            result = cmd.execute()

        assert result["exitosos"] == 2
        assert result["rechazados"] == 0
        assert "Carga completada" in result["mensaje"]

    # ⚙️ Test: formato no soportado
    def test_read_file_formato_no_soportado(self):
        """⚙️ Lanza ApiError si el formato no es CSV ni XLSX"""
        cmd = CreateProductsBulk(b"contenido", "productos.txt")
        with pytest.raises(ApiError, match="Formato no soportado"):
            cmd._read_file()

    # ⚙️ Test: faltan columnas obligatorias
    def test_read_file_faltan_columnas(self):
        """⚙️ Lanza ApiError si faltan columnas requeridas"""
        data = "name,stock\nProducto,10"
        cmd = CreateProductsBulk(data.encode(), "productos.csv")
        with patch("pandas.read_csv", return_value=pd.DataFrame({"name": ["A"], "stock": [10]})):
            with pytest.raises(ApiError, match="Faltan columnas"):
                cmd._read_file()

    # 🚫 Test: stock negativo
    @patch("boto3.resource")
    def test_process_stock_negativo(self, mock_dynamodb):
        """🚫 No debe aceptar stock negativo"""
        mock_table = MagicMock()
        mock_dynamodb.return_value.Table.return_value = mock_table

        df = pd.DataFrame([{
            "provider_nit": "123", "name": "Producto", "product_type": "Tipo",
            "stock": -5, "expiration_date": "2030-01-01", "temperature_required": 10,
            "batch": "B001", "status": "Disponible", "unit_value": 2.5, "storage_conditions": "Seco"
        }])

        cmd = CreateProductsBulk(b"", "productos.csv")
        cmd.table = mock_table
        result = cmd._process(df)

        assert result["rechazados"] == 1
        assert "Stock debe ser positivo" in result["rechazados_detalle"][0]["error"]

    # 🚫 Test: valor unitario inválido
    @patch("boto3.resource")
    def test_process_unit_value_invalido(self, mock_dynamodb):
        """🚫 Valor unitario debe ser mayor que 0"""
        mock_table = MagicMock()
        mock_dynamodb.return_value.Table.return_value = mock_table

        df = pd.DataFrame([{
            "provider_nit": "123", "name": "Prod", "product_type": "Tipo",
            "stock": 5, "expiration_date": "2030-01-01", "temperature_required": 10,
            "batch": "B001", "status": "Disponible", "unit_value": 0, "storage_conditions": "Seco"
        }])

        cmd = CreateProductsBulk(b"", "productos.csv")
        cmd.table = mock_table
        result = cmd._process(df)

        assert result["rechazados"] == 1
        assert "Valor unitario debe ser mayor que 0" in result["rechazados_detalle"][0]["error"]

    # 🚫 Test: fecha inválida
    @patch("boto3.resource")
    def test_process_fecha_invalida(self, mock_dynamodb):
        """🚫 Fecha con formato incorrecto"""
        mock_table = MagicMock()
        mock_dynamodb.return_value.Table.return_value = mock_table

        df = pd.DataFrame([{
            "provider_nit": "123", "name": "Prod", "product_type": "Tipo",
            "stock": 5, "expiration_date": "31-12-2030", "temperature_required": 10,
            "batch": "B001", "status": "Disponible", "unit_value": 10, "storage_conditions": "Seco"
        }])

        cmd = CreateProductsBulk(b"", "productos.csv")
        cmd.table = mock_table
        result = cmd._process(df)

        assert result["rechazados"] == 1
        assert "Formato de fecha inválido" in result["rechazados_detalle"][0]["error"]

    # 🚫 Test: fecha vencida
    @patch("boto3.resource")
    def test_process_fecha_vencida(self, mock_dynamodb):
        """🚫 No debe aceptar fecha de vencimiento anterior"""
        mock_table = MagicMock()
        mock_dynamodb.return_value.Table.return_value = mock_table

        df = pd.DataFrame([{
            "provider_nit": "123", "name": "Prod", "product_type": "Tipo",
            "stock": 5, "expiration_date": "2020-01-01", "temperature_required": 10,
            "batch": "B001", "status": "Disponible", "unit_value": 10, "storage_conditions": "Seco"
        }])

        cmd = CreateProductsBulk(b"", "productos.csv")
        cmd.table = mock_table
        result = cmd._process(df)

        assert result["rechazados"] == 1
        assert "Fecha de vencimiento inválida" in result["rechazados_detalle"][0]["error"]

    # ⚠️ Test: duplicado existente en DynamoDB
    @patch("boto3.resource")
    def test_process_duplicado_existente(self, mock_dynamodb):
        """⚠️ Detecta duplicado existente en la base de datos"""
        mock_table = MagicMock()
        mock_dynamodb.return_value.Table.return_value = mock_table
        mock_table.scan.return_value = {"Items": [{"name": "Prod"}]}

        df = pd.DataFrame([{
            "provider_nit": "123", "name": "Prod", "product_type": "Tipo",
            "stock": 5, "expiration_date": "2030-01-01", "temperature_required": 10,
            "batch": "B001", "status": "Disponible", "unit_value": 10, "storage_conditions": "Seco"
        }])

        cmd = CreateProductsBulk(b"", "productos.csv")
        cmd.table = mock_table
        result = cmd._process(df)

        assert result["rechazados"] == 1
        assert "Duplicado" in result["rechazados_detalle"][0]["error"]

    # ⚡ Test: error DynamoDB
    @patch("boto3.resource")
    def test_process_error_dynamodb(self, mock_dynamodb):
        """⚡ Maneja error de DynamoDB correctamente"""
        mock_table = MagicMock()
        mock_dynamodb.return_value.Table.return_value = mock_table
        mock_table.scan.side_effect = ClientError({"Error": {"Message": "Falla de red"}}, "Scan")

        df = pd.DataFrame([{
            "provider_nit": "123", "name": "Prod", "product_type": "Tipo",
            "stock": 5, "expiration_date": "2030-01-01", "temperature_required": 10,
            "batch": "B001", "status": "Disponible", "unit_value": 10, "storage_conditions": "Seco"
        }])

        cmd = CreateProductsBulk(b"", "productos.csv")
        cmd.table = mock_table
        result = cmd._process(df)

        assert result["rechazados"] == 1
        assert "Error DynamoDB" in result["rechazados_detalle"][0]["error"]

    # ✅ Test: carga parcial (<100%)
    @patch("boto3.resource")
    def test_process_carga_parcial(self, mock_dynamodb):
        """✅ Carga parcial con 1 producto válido y 1 rechazado"""
        mock_table = MagicMock()
        mock_dynamodb.return_value.Table.return_value = mock_table

        df = pd.DataFrame([
            {
                "provider_nit": "1234567890", "name": "Valido", "product_type": "Tipo",
                "stock": 10, "expiration_date": "2030-01-01", "temperature_required": 20,
                "batch": "B001", "status": "Disponible", "unit_value": 5, "storage_conditions": "Seco"
            },
            {
                "provider_nit": "", "name": "Invalido", "product_type": "Tipo",
                "stock": 10, "expiration_date": "2030-01-01", "temperature_required": 20,
                "batch": "B002", "status": "Disponible", "unit_value": 5, "storage_conditions": "Seco"
            },
        ])

        cmd = CreateProductsBulk(b"", "productos.csv")
        cmd.table = mock_table
        mock_table.scan.return_value = {"Items": []}
        result = cmd._process(df)

        assert "Carga parcial" in result["mensaje"]
        assert result["rechazados"] == 1
        assert result["exitosos"] == 1
