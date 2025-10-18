import pytest
from unittest.mock import MagicMock, patch
from botocore.exceptions import ClientError
from src.commands.view_all import GetAllClients
from src.errors.errors import ApiError


class TestGetAllClientsCommand:

    # ✅ Test: ejecución exitosa con lista de clientes
    @patch("boto3.resource")
    def test_execute_retorna_lista_de_clientes(self, mock_dynamodb):
        # Mock tabla
        mock_table = MagicMock()
        mock_dynamodb.return_value.Table.return_value = mock_table

        # Simular respuesta de DynamoDB
        mock_table.scan.return_value = {
            "Items": [
                {"name": "Clinica Norte"},
                {"name": "Hospital Central"},
            ]
        }

        command = GetAllClients()
        result = command.execute()

        # Debe retornar lista ordenada alfabéticamente
        assert isinstance(result, list)
        assert len(result) == 2
        assert result[0]["name"] == "Clinica Norte"
        mock_table.scan.assert_called_once()

    # ✅ Test: maneja paginación correctamente
    @patch("boto3.resource")
    def test_fetch_all_con_paginacion(self, mock_dynamodb):
        mock_table = MagicMock()
        mock_dynamodb.return_value.Table.return_value = mock_table

        # Primera página con "LastEvaluatedKey"
        mock_table.scan.side_effect = [
            {
                "Items": [{"name": "A"}, {"name": "B"}],
                "LastEvaluatedKey": {"id": "next"},
            },
            {
                "Items": [{"name": "C"}],
            },
        ]

        command = GetAllClients()
        result = command.fetch_all()

        assert len(result) == 3
        assert result == sorted(result, key=lambda c: c["name"].lower())
        assert mock_table.scan.call_count == 2  # se llamó dos veces

    # ⚙️ Test: tabla vacía sin errores
    @patch("boto3.resource")
    def test_fetch_all_sin_items_retorna_lista_vacia(self, mock_dynamodb):
        mock_table = MagicMock()
        mock_dynamodb.return_value.Table.return_value = mock_table

        mock_table.scan.return_value = {}  # sin Items

        command = GetAllClients()
        result = command.fetch_all()

        assert result == []

    # ⚡ Test: ClientError levanta ApiError
    @patch("boto3.resource")
    def test_fetch_all_lanza_apierror_en_falla(self, mock_dynamodb):
        mock_table = MagicMock()
        mock_dynamodb.return_value.Table.return_value = mock_table

        mock_table.scan.side_effect = ClientError(
            {"Error": {"Message": "Acceso denegado"}}, "Scan"
        )

        command = GetAllClients()

        with pytest.raises(ApiError, match="Error al obtener la lista de clientes"):
            command.fetch_all()
