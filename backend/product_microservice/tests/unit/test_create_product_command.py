import pytest
from unittest.mock import MagicMock, patch
from botocore.exceptions import ClientError
from datetime import datetime, timedelta
from src.commands.create_product import CreateProduct
from src.errors.errors import ParamError, ApiError


class TestCreateProductCommand:

    # ✅ Caso exitoso: producto nuevo creado correctamente
    @patch("boto3.resource")
    def test_execute_crea_producto_exitosamente(self, mock_dynamodb):
        """✅ Debe crear un nuevo producto en DynamoDB"""
        mock_table = MagicMock()
        mock_dynamodb.return_value.Table.return_value = mock_table
        mock_table.scan.return_value = {"Items": []}
        mock_table.put_item.return_value = {"ResponseMetadata": {"HTTPStatusCode": 200}}

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
            storage_conditions="Lugar fresco y seco"
        )

        result = producto.execute()
        assert "sku" in result
        assert "registrado exitosamente" in result["message"]
        mock_table.put_item.assert_called_once()

    # ✅ Caso exitoso: producto existente → actualiza stock
    @patch("boto3.resource")
    def test_execute_actualiza_stock_si_existe(self, mock_dynamodb):
        """✅ Si el producto existe, debe actualizar el stock"""
        mock_table = MagicMock()
        mock_dynamodb.return_value.Table.return_value = mock_table

        mock_table.scan.return_value = {
            "Items": [{"sku": "sku-123", "stock": 5, "provider_nit": "1234567890", "name": "Paracetamol 500mg", "batch": "L001"}]
        }

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
            storage_conditions="Seco"
        )

        result = producto.execute()
        assert "actualizado" in result["message"]
        mock_table.update_item.assert_called_once()

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
            storage_conditions="Seco"
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
            storage_conditions="Lugar seco"
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
            storage_conditions=""
        )
        with pytest.raises(ParamError, match="obligatorios"):
            producto.validate()

    # ⚡ Error al guardar en DynamoDB (PutItem)
    @patch("boto3.resource")
    def test_put_item_error(self, mock_dynamodb):
        """❌ Si DynamoDB lanza ClientError al guardar"""
        mock_table = MagicMock()
        mock_dynamodb.return_value.Table.return_value = mock_table
        mock_table.scan.return_value = {"Items": []}
        mock_table.put_item.side_effect = ClientError(
            {"Error": {"Message": "Fallo de red"}}, "PutItem"
        )

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
            storage_conditions="Seco"
        )

        with pytest.raises(ApiError, match="Error al crear producto"):
            producto.execute()
