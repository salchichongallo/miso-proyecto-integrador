import pytest
from unittest.mock import MagicMock, patch
from botocore.exceptions import ClientError

from src.commands.create_client import CreateClient
from src.errors.errors import ParamError, ApiError


class TestCreateClientCommand:

    # ---------------------------------------------------------
    # 1) Creación exitosa (mock DynamoDB + mock HTTP POST)
    # ---------------------------------------------------------
    @patch("src.utils.user_requests.requests.post")
    @patch("boto3.resource")
    def test_execute_crea_cliente_exitosamente(self, mock_dynamodb, mock_post):
        # Mock DynamoDB
        mock_table = MagicMock()
        mock_dynamodb.return_value.Table.return_value = mock_table
        mock_table.get_item.return_value = {}  # No existe aún

        # Mock user API
        mock_post.return_value.status_code = 201
        mock_post.return_value.json.return_value = {
            "cognito_id": "abc-123"
        }

        client = CreateClient(
            name="Hospital Central",
            tax_id="1234567890",
            country="CO",
            level="1",
            specialty="Cardio",
            location="Bogotá"
        )

        result = client.execute()

        assert result["id"] == "abc-123"
        assert result["name"] == "Hospital Central"
        assert result["tax_id"] == "1234567890"
        assert result["message"] == "Cliente institucional registrado exitosamente"

        mock_table.put_item.assert_called_once()

    # ---------------------------------------------------------
    # 2) Campos obligatorios faltantes
    # ---------------------------------------------------------
    def test_validate_campos_obligatorios_faltantes(self):
        client = CreateClient("", "", "", "", "", "")
        with pytest.raises(ParamError):
            client.validate()

    # ---------------------------------------------------------
    # 3) NIT inválido (menos de 10 dígitos)
    # ---------------------------------------------------------
    def test_validate_nit_invalido(self):
        client = CreateClient(
            name="Clinica Norte",
            tax_id="12345",
            country="CO",
            level="2",
            specialty="Oncología",
            location="Cali"
        )
        with pytest.raises(ParamError, match="10 dígitos"):
            client.validate()

    # ---------------------------------------------------------
    # 4) SHA256 generado correctamente
    # ---------------------------------------------------------
    def test_encrypt_tax_id_generates_sha256(self):
        client = CreateClient("Test", "1234567890", "CO", "1", "Medicina", "Bogotá")
        client.encrypt_tax_id()
        assert len(client.tax_id_encrypted) == 64

    # ---------------------------------------------------------
    # 5) Duplicado (cliente ya existe en DynamoDB)
    # ---------------------------------------------------------
    @patch("boto3.resource")
    def test_validate_cliente_duplicado(self, mock_dynamodb):
        mock_table = MagicMock()
        mock_dynamodb.return_value.Table.return_value = mock_table
        mock_table.get_item.return_value = {"Item": {"tax_id": "1234567890"}}

        client = CreateClient("Hospital", "1234567890", "CO", "1", "Medicina", "Bogotá")

        with pytest.raises(ParamError, match="ya está registrado"):
            client.validate()

    # ---------------------------------------------------------
    # 6) Error en DynamoDB → ApiError
    # ---------------------------------------------------------
    @patch("boto3.resource")
    def test_save_error_dynamodb(self, mock_dynamodb):
        mock_table = MagicMock()
        mock_dynamodb.return_value.Table.return_value = mock_table

        mock_table.put_item.side_effect = ClientError(
            {"Error": {"Message": "Falla de red"}}, "PutItem"
        )

        client = CreateClient("Test", "1234567890", "CO", "1", "Cardio", "Bogotá")

        with pytest.raises(ApiError):
            client.save()

    # ---------------------------------------------------------
    # 7) get_item falla (error red) → ApiError
    # ---------------------------------------------------------
    @patch("boto3.resource")
    def test_validate_error_al_verificar_duplicado_lanza_apierror(self, mock_dynamodb):
        mock_table = MagicMock()
        mock_dynamodb.return_value.Table.return_value = mock_table

        mock_table.get_item.side_effect = ClientError(
            {"Error": {"Message": "AccessDenied / NetworkError"}}, "GetItem"
        )

        client = CreateClient(
            name="Hosp X",
            tax_id="9876543210",
            country="CO",
            level="1",
            specialty="General",
            location="Medellín"
        )

        with pytest.raises(ApiError, match="Error al verificar duplicado"):
            client.validate()

    # ---------------------------------------------------------
    # 8) Error al crear usuario en microservicio (HTTP != 201)
    # ---------------------------------------------------------
    @patch("src.utils.user_requests.requests.post")
    def test_save_cognito_falla_levanta_apierror(self, mock_post):
        mock_post.return_value.status_code = 500
        mock_post.return_value.text = "Internal error"

        client = CreateClient(
            name="Hosp",
            tax_id="1234567890",
            country="CO",
            level="1",
            specialty="General",
            location="Bogotá"
        )

        with pytest.raises(Exception, match="Error creating user"):
            client.save_cognito_user()
