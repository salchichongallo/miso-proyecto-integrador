import pytest
from unittest.mock import MagicMock, patch
from botocore.exceptions import ClientError
from src.commands.create_client import CreateClient
from src.errors.errors import ParamError, ApiError


class TestCreateClientCommand:

    # ✅ Creación exitosa
    @patch("boto3.resource")
    def test_execute_crea_cliente_exitosamente(self, mock_dynamodb):
        mock_table = MagicMock()
        mock_dynamodb.return_value.Table.return_value = mock_table
        mock_table.get_item.return_value = {}  # no existe

        client = CreateClient(
            name="Hospital Central",
            tax_id="1234567890",  
            country="CO",
            level="NIVEL_1",
            specialty="Cardiología",
            location="Bogotá"
        )

        mock_table.put_item.return_value = {"ResponseMetadata": {"HTTPStatusCode": 200}}
        result = client.execute()
        assert "client_id" in result
        assert result["name"] == "Hospital Central"
        assert result["message"] == "Cliente institucional registrado exitosamente"
        mock_table.put_item.assert_called_once()

    # 🚫 Campos vacíos
    def test_validate_campos_obligatorios_faltantes(self):
        client = CreateClient(name="", tax_id="", country="", level="", specialty="", location="")
        with pytest.raises(ParamError):
            client.validate()

    # 🚫 NIT inválido (no 10 dígitos)
    def test_validate_nit_invalido(self):
        client = CreateClient(
            name="Clinica Norte",
            tax_id="12345",  # ❌ menos de 10 dígitos
            country="CO",
            level="2",
            specialty="Oncología",
            location="Cali"
        )
        with pytest.raises(ParamError, match="10 dígitos"):
            client.validate()

    # ⚙️ SHA-256 correcto
    def test_encrypt_tax_id_generates_sha256(self):
        client = CreateClient("Test", "1234567890", "CO", "1", "Medicina", "Bogotá")
        client.encrypt_tax_id()
        assert len(client.tax_id_encrypted) == 64

    # 💾 Duplicado (ya existe)
    @patch("boto3.resource")
    def test_validate_cliente_duplicado(self, mock_dynamodb):
        mock_table = MagicMock()
        mock_dynamodb.return_value.Table.return_value = mock_table
        mock_table.get_item.return_value = {"Item": {"tax_id": "1234567890"}}

        client = CreateClient("Hospital", "1234567890", "CO", "1", "Medicina", "Bogotá")
        with pytest.raises(ParamError, match="ya está registrado"):
            client.validate()

    # ⚡ Error al guardar en DynamoDB -> ApiError
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

    # ⚠️ Error al verificar duplicado (get_item lanza ClientError) -> ApiError
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
