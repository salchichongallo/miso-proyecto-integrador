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
        mock_product_model.find_existing_product.return_value = None
        mock_instance = MagicMock()
        mock_product_model.return_value = mock_instance

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

        assert result["successful_records"] == 2
        assert result["rejected_records"] == 0
        assert "completed" in result["message"].lower()

        assert mock_product_model.find_existing_product.call_count == 2
        assert mock_product_model.call_count == 2
        assert mock_instance.save.call_count == 2

    # ⚙️ Test: formato no soportado
    def test_read_file_formato_no_soportado(self):
        cmd = CreateProductsBulk(b"contenido", "productos.txt")
        with pytest.raises(ApiError, match="Formato no soportado"):
            cmd._read_file()

    # ⚙️ Test: faltan columnas obligatorias
    def test_read_file_faltan_columnas(self):
        data = "name,stock\nProducto,10"
        cmd = CreateProductsBulk(data.encode(), "productos.csv")

        with patch("pandas.read_csv", return_value=pd.DataFrame({"name": ["A"], "stock": [10]})):
            with pytest.raises(ApiError, match="Faltan columnas"):
                cmd._read_file()

    # 🚫 Test: stock negativo
    @patch("src.commands.create_products_bulk.ProductModel")
    def test_process_stock_negativo(self, mock_model):
        df = pd.DataFrame([{
            "provider_nit": "123", "name": "Producto", "product_type": "Tipo",
            "stock": -5, "expiration_date": "2030-01-01", "temperature_required": 10,
            "batch": "B001", "status": "Disponible", "unit_value": 2.5, "storage_conditions": "Seco"
        }])

        cmd = CreateProductsBulk(b"", "productos.csv")
        result = cmd._process(df)

        assert result["rejected_records"] == 1
        assert "Stock debe ser positivo" in result["rejected"][0]["error"]

    # 🚫 Test: valor unitario inválido
    @patch("src.commands.create_products_bulk.ProductModel")
    def test_process_unit_value_invalido(self, mock_model):
        df = pd.DataFrame([{
            "provider_nit": "123", "name": "Prod", "product_type": "Tipo",
            "stock": 5, "expiration_date": "2030-01-01", "temperature_required": 10,
            "batch": "B001", "status": "Disponible", "unit_value": 0, "storage_conditions": "Seco"
        }])

        cmd = CreateProductsBulk(b"", "productos.csv")
        result = cmd._process(df)

        assert result["rejected_records"] == 1
        assert "Valor unitario" in result["rejected"][0]["error"]

    # 🚫 Test: fecha inválida
    @patch("src.commands.create_products_bulk.ProductModel")
    def test_process_fecha_invalida(self, mock_model):
        df = pd.DataFrame([{
            "provider_nit": "123", "name": "Prod", "product_type": "Tipo",
            "stock": 5, "expiration_date": "31-12-2030", "temperature_required": 10,
            "batch": "B001", "status": "Disponible", "unit_value": 10, "storage_conditions": "Seco"
        }])

        cmd = CreateProductsBulk(b"", "productos.csv")
        result = cmd._process(df)

        assert result["rejected_records"] == 1
        assert "Formato de fecha inválido" in result["rejected"][0]["error"]

    # 🚫 Test: fecha vencida
    @patch("src.commands.create_products_bulk.ProductModel")
    def test_process_fecha_vencida(self, mock_model):
        df = pd.DataFrame([{
            "provider_nit": "123", "name": "Prod", "product_type": "Tipo",
            "stock": 5, "expiration_date": "2020-01-01", "temperature_required": 10,
            "batch": "B001", "status": "Disponible", "unit_value": 10, "storage_conditions": "Seco"
        }])

        cmd = CreateProductsBulk(b"", "productos.csv")
        result = cmd._process(df)

        assert result["rejected_records"] == 1
        assert "Fecha de vencimiento inválida" in result["rejected"][0]["error"]

    # ⚠️ Test: duplicado existente en DB
    @patch("src.commands.create_products_bulk.ProductModel")
    def test_process_duplicado_existente(self, mock_model):
        mock_existing = MagicMock()
        mock_model.find_existing_product.return_value = mock_existing

        df = pd.DataFrame([{
            "provider_nit": "123", "name": "Prod", "product_type": "Tipo",
            "stock": 5, "expiration_date": "2030-01-01", "temperature_required": 10,
            "batch": "B001", "status": "Disponible", "unit_value": 10, "storage_conditions": "Seco"
        }])

        cmd = CreateProductsBulk(b"", "productos.csv")
        result = cmd._process(df)

        assert result["rejected_records"] == 1
        assert "Duplicado" in result["rejected"][0]["error"]

        mock_model.find_existing_product.assert_called_once()
        call_args = mock_model.find_existing_product.call_args[0]
        assert call_args[0] == "1"
        assert len(call_args[1]) == 32

    # ⚡ Test: error modelo
    @patch("src.commands.create_products_bulk.ProductModel")
    def test_process_error_modelo(self, mock_model):
        mock_model.find_existing_product.side_effect = Exception("Falla de red")

        df = pd.DataFrame([{
            "provider_nit": "123", "name": "Prod", "product_type": "Tipo",
            "stock": 5, "expiration_date": "2030-01-01", "temperature_required": 10,
            "batch": "B001", "status": "Disponible", "unit_value": 10, "storage_conditions": "Seco"
        }])

        cmd = CreateProductsBulk(b"", "productos.csv")
        result = cmd._process(df)

        assert result["rejected_records"] == 1
        assert "Error al verificar duplicados" in result["rejected"][0]["error"]

    # ✅ Test: carga parcial
    @patch("src.commands.create_products_bulk.ProductModel")
    def test_process_carga_parcial(self, mock_model):
        mock_model.find_existing_product.return_value = None

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

        assert result["rejected_records"] == 1
        assert result["successful_records"] == 1
        assert "partial" in result["message"].lower()
