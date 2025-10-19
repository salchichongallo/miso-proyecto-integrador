import pytest
from unittest.mock import MagicMock, patch
from botocore.exceptions import ClientError
from src.commands.view_all import GetAllProducts
from src.errors.errors import ApiError


class TestGetAllProductsCommand:

    # ✅ Caso exitoso básico
    @patch("boto3.resource")
    def test_fetch_all_exitoso(self, mock_dynamodb):
        """✅ Retorna lista de productos exitosamente"""
        mock_table = MagicMock()
        mock_dynamodb.return_value.Table.return_value = mock_table

        mock_table.scan.return_value = {
            "Items": [
                {"name": "Paracetamol", "stock": 100},
                {"name": "Aspirina", "stock": 50},
            ]
        }

        command = GetAllProducts()
        result = command.fetch_all()

        assert isinstance(result, list)
        assert len(result) == 2
        assert result[0]["name"] == "Aspirina"  # Verifica orden alfabético
        assert result[1]["stock"] == 100
        mock_table.scan.assert_called_once()

    # 🔁 Paginación (más de 1 página de resultados)
    @patch("boto3.resource")
    def test_fetch_all_con_paginacion(self, mock_dynamodb):
        """🔁 Maneja correctamente la paginación"""
        mock_table = MagicMock()
        mock_dynamodb.return_value.Table.return_value = mock_table

        # Simula 2 páginas
        mock_table.scan.side_effect = [
            {"Items": [{"name": "Producto 1"}], "LastEvaluatedKey": "next"},
            {"Items": [{"name": "Producto 2"}]},
        ]

        command = GetAllProducts()
        result = command.fetch_all()

        assert isinstance(result, list)
        assert len(result) == 2
        assert {"name": "Producto 1"} in result
        assert {"name": "Producto 2"} in result
        assert mock_table.scan.call_count == 2

    # ⚠️ Sin productos
    @patch("boto3.resource")
    def test_fetch_all_sin_productos(self, mock_dynamodb):
        """⚠️ Retorna lista vacía cuando no hay productos"""
        mock_table = MagicMock()
        mock_dynamodb.return_value.Table.return_value = mock_table
        mock_table.scan.return_value = {"Items": []}

        command = GetAllProducts()
        result = command.fetch_all()

        assert isinstance(result, list)
        assert result == []

    # ❌ Error en DynamoDB
    @patch("boto3.resource")
    def test_fetch_all_error_dynamodb(self, mock_dynamodb):
        """❌ Lanza ApiError si DynamoDB falla"""
        mock_table = MagicMock()
        mock_dynamodb.return_value.Table.return_value = mock_table
        mock_table.scan.side_effect = ClientError(
            {"Error": {"Message": "AccessDenied"}}, "Scan"
        )

        command = GetAllProducts()

        with pytest.raises(ApiError, match="Error al obtener la lista de productos"):
            command.fetch_all()

    # 🧱 Verifica que execute() llama a fetch_all()
    @patch("boto3.resource")
    def test_execute_invoca_fetch_all(self, mock_dynamodb):
        """🧱 execute() debe llamar internamente a fetch_all"""
        mock_table = MagicMock()
        mock_dynamodb.return_value.Table.return_value = mock_table
        mock_table.scan.return_value = {"Items": [{"name": "Ibuprofeno"}]}

        command = GetAllProducts()
        result = command.execute()

        assert isinstance(result, list)
        assert len(result) == 1
        assert result[0]["name"] == "Ibuprofeno"

    # 🧩 Verifica que se ordena correctamente alfabéticamente
    @patch("boto3.resource")
    def test_fetch_all_orden_alfabetico(self, mock_dynamodb):
        """🧩 Los productos deben ordenarse alfabéticamente por nombre"""
        mock_table = MagicMock()
        mock_dynamodb.return_value.Table.return_value = mock_table
        mock_table.scan.return_value = {
            "Items": [
                {"name": "Carlos"},
                {"name": "Ana"},
                {"name": "Beatriz"},
            ]
        }

        command = GetAllProducts()
        result = command.fetch_all()

        nombres = [p["name"] for p in result]
        assert nombres == ["Ana", "Beatriz", "Carlos"]
