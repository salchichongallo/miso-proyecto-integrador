import pytest
from unittest.mock import MagicMock, patch
from botocore.exceptions import ClientError
from src.commands.view_all import GetAllProviders
from src.errors.errors import ApiError


class TestGetAllProvidersCommand:

    # ✅ Test: ejecución exitosa con lista de proveedores
    @patch("boto3.resource")
    def test_execute_retorna_lista_de_proveedores(self, mock_dynamodb):
        # Mock tabla DynamoDB
        mock_table = MagicMock()
        mock_dynamodb.return_value.Table.return_value = mock_table

        # Simular respuesta del escaneo
        mock_table.scan.return_value = {
            "Items": [
                {"name": "Proveedor Z"},
                {"name": "Proveedor A"},
            ]
        }

        command = GetAllProviders()
        result = command.execute()

        # ✅ Validaciones
        assert isinstance(result, list)
        assert len(result) == 2
        assert result[0]["name"] == "Proveedor A"  # ordenado alfabéticamente
        mock_table.scan.assert_called_once()

    # ✅ Test: manejo de paginación
    @patch("boto3.resource")
    def test_fetch_all_con_paginacion(self, mock_dynamodb):
        mock_table = MagicMock()
        mock_dynamodb.return_value.Table.return_value = mock_table

        # Simular dos páginas
        mock_table.scan.side_effect = [
            {
                "Items": [{"name": "B"}, {"name": "A"}],
                "LastEvaluatedKey": {"id": "next"},
            },
            {
                "Items": [{"name": "C"}],
            },
        ]

        command = GetAllProviders()
        result = command.fetch_all()

        # ✅ Validaciones
        assert len(result) == 3
        assert result == sorted(result, key=lambda c: c["name"].lower())
        assert mock_table.scan.call_count == 2

    # ⚙️ Test: sin items en la tabla
    @patch("boto3.resource")
    def test_fetch_all_sin_items_retorna_lista_vacia(self, mock_dynamodb):
        mock_table = MagicMock()
        mock_dynamodb.return_value.Table.return_value = mock_table
        mock_table.scan.return_value = {}  # sin Items

        command = GetAllProviders()
        result = command.fetch_all()

        # ✅ Validación
        assert result == []
        mock_table.scan.assert_called_once()

    # ⚡ Test: ClientError -> ApiError
    @patch("boto3.resource")
    def test_fetch_all_lanza_apierror_en_falla(self, mock_dynamodb):
        mock_table = MagicMock()
        mock_dynamodb.return_value.Table.return_value = mock_table

        # Simular error en DynamoDB
        mock_table.scan.side_effect = ClientError(
            {"Error": {"Message": "Acceso denegado"}}, "Scan"
        )

        command = GetAllProviders()

        with pytest.raises(ApiError, match="Error al obtener la lista de proveedores"):
            command.fetch_all()
