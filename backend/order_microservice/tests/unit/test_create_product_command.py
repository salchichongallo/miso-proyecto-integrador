import pytest
from unittest.mock import MagicMock, patch
from datetime import datetime, timedelta
from backend.order_microservice.src.commands.create_order import CreateProduct
from src.errors.errors import ParamError, ApiError


class TestCreateProductCommand:

    # ✅ Caso exitoso: producto nuevo creado correctamente
    @patch("src.commands.create_product.ProductModel")
    def test_execute_crea_producto_exitosamente(self, mock_product_model):
        """✅ Debe crear un nuevo producto usando ProductModel"""
        # Mock del método find_existing_product para simular que no existe
        mock_product_model.find_existing_product.return_value = None

        # Mock de la instancia del producto para save()
        mock_product_instance = MagicMock()
        mock_product_model.return_value = mock_product_instance

        producto = CreateProduct(
            provider_nit="1234567890",
            name="Paracetamol 500mg",
            product_type="Medicamento",
            stock=10,
            expiration_date=(datetime.now() + timedelta(days=365)).date(),
            temperature_required=25.0,
            batch="L001",
            status="Disponible",
            unit_value=2.5,
            storage_conditions="Lugar fresco y seco",
            warehouse="WH123",
            sku="SKU12345"
        )

        result = producto.execute()
        assert "sku" in result
        assert "registrado exitosamente" in result["message"]

        # Verificar que se llamó find_existing_product
        mock_product_model.find_existing_product.assert_called_once_with("1234567890", "Paracetamol 500mg", "L001")

        # Verificar que se creó una nueva instancia del modelo
        mock_product_model.assert_called_once()

        # Verificar que se llamó save() en la instancia
        mock_product_instance.save.assert_called_once()

    # ✅ Caso exitoso: producto existente → actualiza stock
    @patch("src.commands.create_product.ProductModel")
    def test_execute_actualiza_stock_si_existe(self, mock_product_model):
        """✅ Si el producto existe, debe actualizar el stock"""
        # Mock del producto existente
        mock_existing_product = MagicMock()
        mock_existing_product.stock = 5
        mock_product_model.find_existing_product.return_value = mock_existing_product

        producto = CreateProduct(
            provider_nit="1234567890",
            name="Paracetamol 500mg",
            product_type="Medicamento",
            stock=5,
            expiration_date=(datetime.now() + timedelta(days=100)).date(),
            temperature_required=22.0,
            batch="L001",
            status="Disponible",
            unit_value=3.0,
            storage_conditions="Seco",
            warehouse="WH123",
            sku="SKU12345"
        )

        result = producto.execute()
        assert "actualizado" in result["message"]

        # Verificar que se llamó find_existing_product
        mock_product_model.find_existing_product.assert_called_once_with("1234567890", "Paracetamol 500mg", "L001")

        # Verificar que se llamó update_stock en el producto existente
        mock_existing_product.update_stock.assert_called_once_with(5)

    # 🚫 Fecha inválida (anterior o igual a hoy)
    def test_validate_fecha_invalida(self):
        """❌ La fecha de vencimiento no puede ser anterior o igual a hoy"""
        producto = CreateProduct(
            provider_nit="1234567890",
            name="Ibuprofeno",
            product_type="Medicamento",
            stock=5,
            expiration_date=datetime.now().date(),
            temperature_required=25.0,
            batch="L002",
            status="Disponible",
            unit_value=1.5,
            storage_conditions="Seco",
            warehouse="WH123",
            sku="SKU12346"
        )

        with pytest.raises(ParamError, match="posterior a la actual"):
            producto.validate()

    # 🚫 Stock negativo
    def test_validate_stock_invalido(self):
        """❌ El stock no puede ser menor que 1"""
        producto = CreateProduct(
            provider_nit="1234567890",
            name="Aspirina",
            product_type="Medicamento",
            stock=0,
            expiration_date=(datetime.now() + timedelta(days=30)).date(),
            temperature_required=20.0,
            batch="L003",
            status="Disponible",
            unit_value=2.0,
            storage_conditions="Lugar seco",
            warehouse="WH123",
            sku="SKU12347"
        )

        with pytest.raises(ParamError, match="mayor o igual a 1"):
            producto.validate()

    # 🚫 Campos obligatorios faltantes
    def test_validate_campos_obligatorios(self):
        """❌ No debe permitir campos obligatorios vacíos"""
        producto = CreateProduct(
            provider_nit="",
            name="",
            product_type="",
            stock=10,
            expiration_date=(datetime.now() + timedelta(days=30)).date(),
            temperature_required=25.0,
            batch="",
            status="",
            unit_value=1.0,
            storage_conditions="",
            warehouse="WH123",
            sku="SKU12347"
        )
        with pytest.raises(ParamError, match="obligatorios"):
            producto.validate()

    # ⚡ Error al guardar en ProductModel
    @patch("src.commands.create_product.ProductModel")
    def test_save_error(self, mock_product_model):
        """❌ Si ProductModel lanza excepción al guardar"""
        # Mock del método find_existing_product para simular que no existe
        mock_product_model.find_existing_product.return_value = None

        # Mock de la instancia del producto que lanza excepción al guardar
        mock_product_instance = MagicMock()
        mock_product_instance.save.side_effect = Exception("Fallo de red")
        mock_product_model.return_value = mock_product_instance

        producto = CreateProduct(
            provider_nit="1234567890",
            name="Ibuprofeno 400mg",
            product_type="Medicamento",
            stock=10,
            expiration_date=(datetime.now() + timedelta(days=120)).date(),
            temperature_required=20.0,
            batch="L004",
            status="Disponible",
            unit_value=2.0,
            storage_conditions="Seco",
            warehouse="WH123",
            sku="SKU12347"
        )

        with pytest.raises(ApiError, match="Error al crear producto"):
            producto.execute()
