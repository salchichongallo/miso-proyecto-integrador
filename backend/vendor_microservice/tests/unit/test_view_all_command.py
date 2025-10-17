import pytest
from unittest.mock import MagicMock, patch
from botocore.exceptions import ClientError
from src.commands.view_all import GetAllVendors
from src.errors.errors import ApiError


class TestGetAllVendorsCommand:

    # ✅ Caso exitoso básico
    @patch("boto3.resource")
    def test_fetch_all_exitoso(self, mock_dynamodb):
        """✅ Retorna lista de vendedores exitosamente"""
        mock_table = MagicMock()
        mock_dynamodb.return_value.Table.return_value = mock_table

        mock_table.scan.return_value = {
            "Items": [
                {"name": "Vendor Z", "email": "z@example.com"},
                {"name": "Vendor A", "email": "a@example.com"},
            ]
        }

        command = GetAllVendors()
        result = command.fetch_all()

        assert isinstance(result, list)
        assert len(result) == 2
        assert result[0]["name"] == "Vendor A"  # Verifica que está ordenado
        assert result[1]["email"] == "z@example.com"
        mock_table.scan.assert_called_once()

    # 🔁 Paginación (cuando hay más de 1 página de resultados)
    @patch("boto3.resource")
    def test_fetch_all_con_paginacion(self, mock_dynamodb):
        """🔁 Maneja correctamente la paginación"""
        mock_table = MagicMock()
        mock_dynamodb.return_value.Table.return_value = mock_table

        mock_table.scan.side_effect = [
            {"Items": [{"name": "Vendor 1"}], "LastEvaluatedKey": "next"},
            {"Items": [{"name": "Vendor 2"}]},
        ]

        command = GetAllVendors()
        result = command.fetch_all()

        assert isinstance(result, list)
        assert len(result) == 2
        assert {"name": "Vendor 1"} in result
        assert {"name": "Vendor 2"} in result
        assert mock_table.scan.call_count == 2

    # ⚠️ Sin vendedores
    @patch("boto3.resource")
    def test_fetch_all_sin_vendedores(self, mock_dynamodb):
        """⚠️ Retorna lista vacía cuando no hay vendedores"""
        mock_table = MagicMock()
        mock_dynamodb.return_value.Table.return_value = mock_table
        mock_table.scan.return_value = {"Items": []}

        command = GetAllVendors()
        result = command.fetch_all()

        assert isinstance(result, list)
        assert result == []

    # ❌ Error en DynamoDB (ClientError)
    @patch("boto3.resource")
    def test_fetch_all_error_dynamodb(self, mock_dynamodb):
        """❌ Lanza ApiError si DynamoDB falla"""
        mock_table = MagicMock()
        mock_dynamodb.return_value.Table.return_value = mock_table
        mock_table.scan.side_effect = ClientError(
            {"Error": {"Message": "AccessDenied"}}, "Scan"
        )

        command = GetAllVendors()

        with pytest.raises(ApiError, match="Error al obtener la lista de vendedores"):
            command.fetch_all()

    # 🧱 Verifica que execute() llama a fetch_all()
    @patch("boto3.resource")
    def test_execute_invoca_fetch_all(self, mock_dynamodb):
        """🧱 execute() debe llamar internamente a fetch_all"""
        mock_table = MagicMock()
        mock_dynamodb.return_value.Table.return_value = mock_table
        mock_table.scan.return_value = {"Items": [{"name": "Vendor X"}]}

        command = GetAllVendors()
        result = command.execute()

        assert isinstance(result, list)
        assert len(result) == 1
        assert result[0]["name"] == "Vendor X"

    # 🧩 Verifica que se ordena correctamente alfabéticamente
    @patch("boto3.resource")
    def test_fetch_all_orden_alfabetico(self, mock_dynamodb):
        """🧩 Los vendedores deben ordenarse alfabéticamente por nombre"""
        mock_table = MagicMock()
        mock_dynamodb.return_value.Table.return_value = mock_table
        mock_table.scan.return_value = {
            "Items": [
                {"name": "Carlos"},
                {"name": "Ana"},
                {"name": "Beatriz"},
            ]
        }

        command = GetAllVendors()
        result = command.fetch_all()

        nombres = [v["name"] for v in result]
        assert nombres == ["Ana", "Beatriz", "Carlos"]
