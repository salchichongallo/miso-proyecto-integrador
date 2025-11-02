import pytest
import pandas as pd
from unittest.mock import MagicMock, patch
from src.commands.create_products_bulk import CreateProductsBulk
from src.errors.errors import ApiError


class TestCreateProductsBulkCommand:

    # ✅ Caso exitoso con archivo CSV válido
    @patch("src.commands.create_products_bulk.ProductModel")
    def test_execute_carga_masiva_exitosa(self, mock_product_model):
        """✅ Carga masiva exitosa con productos válidos"""
        # Mock del método find_existing_product para simular que no hay duplicados
        mock_product_model.find_existing_product.return_value = None

        # Mock de las instancias de ProductModel para save()
        mock_product_instance = MagicMock()
        mock_product_model.return_value = mock_product_instance

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
            result = cmd.execute()

        assert result["exitosos"] == 2
        assert result["rechazados"] == 0
        assert "Carga completada" in result["mensaje"]

        # Verificar que se llamó find_existing_product para cada producto
        assert mock_product_model.find_existing_product.call_count == 2

        # Verificar que se crearon 2 instancias del modelo
        assert mock_product_model.call_count == 2

        # Verificar que se llamó save() en cada instancia
        assert mock_product_instance.save.call_count == 2

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
    @patch("src.commands.create_products_bulk.ProductModel")
    def test_process_stock_negativo(self, mock_product_model):
        """🚫 No debe aceptar stock negativo"""
        # No necesitamos mock de tabla para esta validación

        df = pd.DataFrame([{
            "provider_nit": "123", "name": "Producto", "product_type": "Tipo",
            "stock": -5, "expiration_date": "2030-01-01", "temperature_required": 10,
            "batch": "B001", "status": "Disponible", "unit_value": 2.5, "storage_conditions": "Seco"
        }])

        cmd = CreateProductsBulk(b"", "productos.csv")
        result = cmd._process(df)

        assert result["rechazados"] == 1
        assert "Stock debe ser positivo" in result["rechazados_detalle"][0]["error"]

    # 🚫 Test: valor unitario inválido
    @patch("src.commands.create_products_bulk.ProductModel")
    def test_process_unit_value_invalido(self, mock_product_model):
        """🚫 Valor unitario debe ser mayor que 0"""
        # No necesitamos mock para esta validación de lógica de negocio

        df = pd.DataFrame([{
            "provider_nit": "123", "name": "Prod", "product_type": "Tipo",
            "stock": 5, "expiration_date": "2030-01-01", "temperature_required": 10,
            "batch": "B001", "status": "Disponible", "unit_value": 0, "storage_conditions": "Seco"
        }])

        cmd = CreateProductsBulk(b"", "productos.csv")
        result = cmd._process(df)

        assert result["rechazados"] == 1
        assert "Valor unitario debe ser mayor que 0" in result["rechazados_detalle"][0]["error"]

    # 🚫 Test: fecha inválida
    @patch("src.commands.create_products_bulk.ProductModel")
    def test_process_fecha_invalida(self, mock_product_model):
        """🚫 Fecha con formato incorrecto"""
        # No necesitamos mock para esta validación

        df = pd.DataFrame([{
            "provider_nit": "123", "name": "Prod", "product_type": "Tipo",
            "stock": 5, "expiration_date": "31-12-2030", "temperature_required": 10,
            "batch": "B001", "status": "Disponible", "unit_value": 10, "storage_conditions": "Seco"
        }])

        cmd = CreateProductsBulk(b"", "productos.csv")
        result = cmd._process(df)

        assert result["rechazados"] == 1
        assert "Formato de fecha inválido" in result["rechazados_detalle"][0]["error"]

    # 🚫 Test: fecha vencida
    @patch("src.commands.create_products_bulk.ProductModel")
    def test_process_fecha_vencida(self, mock_product_model):
        """🚫 No debe aceptar fecha de vencimiento anterior"""
        # No necesitamos mock para esta validación

        df = pd.DataFrame([{
            "provider_nit": "123", "name": "Prod", "product_type": "Tipo",
            "stock": 5, "expiration_date": "2020-01-01", "temperature_required": 10,
            "batch": "B001", "status": "Disponible", "unit_value": 10, "storage_conditions": "Seco"
        }])

        cmd = CreateProductsBulk(b"", "productos.csv")
        result = cmd._process(df)

        assert result["rechazados"] == 1
        assert "Fecha de vencimiento inválida" in result["rechazados_detalle"][0]["error"]

    # ⚠️ Test: duplicado existente en DynamoDB
    @patch("src.commands.create_products_bulk.ProductModel")
    def test_process_duplicado_existente(self, mock_product_model):
        """⚠️ Detecta duplicado existente en la base de datos"""
        # Mock para simular que existe un producto duplicado
        mock_existing_product = MagicMock()
        mock_product_model.find_existing_product.return_value = mock_existing_product

        df = pd.DataFrame([{
            "provider_nit": "123", "name": "Prod", "product_type": "Tipo",
            "stock": 5, "expiration_date": "2030-01-01", "temperature_required": 10,
            "batch": "B001", "status": "Disponible", "unit_value": 10, "storage_conditions": "Seco"
        }])

        cmd = CreateProductsBulk(b"", "productos.csv")
        result = cmd._process(df)

        assert result["rechazados"] == 1
        assert "Duplicado" in result["rechazados_detalle"][0]["error"]

        # Verificar que se llamó find_existing_product con warehouse y sku generado
        # El sku se genera como uuid, así que solo verificamos que fue llamado
        mock_product_model.find_existing_product.assert_called_once()
        call_args = mock_product_model.find_existing_product.call_args[0]
        assert call_args[0] == "DEFAULT_WH"  # warehouse por defecto
        assert len(call_args[1]) == 32  # sku generado como uuid hex

    # ⚡ Test: error ProductModel
    @patch("src.commands.create_products_bulk.ProductModel")
    def test_process_error_modelo(self, mock_product_model):
        """⚡ Maneja error del modelo correctamente"""
        # Mock para simular error al buscar duplicados
        mock_product_model.find_existing_product.side_effect = Exception("Falla de red")

        df = pd.DataFrame([{
            "provider_nit": "123", "name": "Prod", "product_type": "Tipo",
            "stock": 5, "expiration_date": "2030-01-01", "temperature_required": 10,
            "batch": "B001", "status": "Disponible", "unit_value": 10, "storage_conditions": "Seco"
        }])

        cmd = CreateProductsBulk(b"", "productos.csv")
        result = cmd._process(df)

        assert result["rechazados"] == 1
        assert "Error al verificar duplicados" in result["rechazados_detalle"][0]["error"]

    # ✅ Test: carga parcial (<100%)
    @patch("src.commands.create_products_bulk.ProductModel")
    def test_process_carga_parcial(self, mock_product_model):
        """✅ Carga parcial con 1 producto válido y 1 rechazado"""
        # Mock para simular que no hay duplicados
        mock_product_model.find_existing_product.return_value = None

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
        result = cmd._process(df)

        assert "Carga parcial" in result["mensaje"]
        assert result["rechazados"] == 1
        assert result["exitosos"] == 1
