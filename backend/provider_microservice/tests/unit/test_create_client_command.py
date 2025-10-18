import pytest
from unittest.mock import MagicMock, patch
from botocore.exceptions import ClientError
from backend.provider_microservice.src.commands.create_provider import CreateClient
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
            tax_id="123456789",
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

    # 🚫 NIT inválido CO
    def test_validate_nit_invalido_colombia(self):
        client = CreateClient(
            name="Clinica Norte",
            tax_id="ABC123",
            country="CO",
            level="2",
            specialty="Oncología",
            location="Cali"
        )
        with pytest.raises(ParamError, match="NIT inválido"):
            client.validate()

    # 🚫 RFC inválido MX
    def test_validate_rfc_invalido_mexico(self):
        client = CreateClient(
            name="Laboratorio MX",
            tax_id="12345",
            country="MX",
            level="3",
            specialty="Análisis",
            location="CDMX"
        )
        with pytest.raises(ParamError, match="RFC inválido"):
            client.validate()

    # ⚙️ SHA-256 correcto
    def test_encrypt_tax_id_generates_sha256(self):
        client = CreateClient("Test", "12345", "CO", "1", "Medicina", "Bogotá")
        client.encrypt_tax_id()
        assert len(client.tax_id_encrypted) == 64

    # 💾 Duplicado (ya existe)
    @patch("boto3.resource")
    def test_validate_cliente_duplicado(self, mock_dynamodb):
        mock_table = MagicMock()
        mock_dynamodb.return_value.Table.return_value = mock_table
        mock_table.get_item.return_value = {"Item": {"tax_id": "123456789"}}
        client = CreateClient("Hospital", "123456789", "CO", "1", "Medicina", "Bogotá")
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
        client = CreateClient("Test", "123456789", "CO", "1", "Cardio", "Bogotá")
        with pytest.raises(ApiError):
            client.save()

    # 🆕 ⚠️ Error al verificar duplicado (get_item lanza ClientError) -> ApiError
    @patch("boto3.resource")
    def test_validate_error_al_verificar_duplicado_lanza_apierror(self, mock_dynamodb):
        mock_table = MagicMock()
        mock_dynamodb.return_value.Table.return_value = mock_table

        # Simula fallo de red/permiso en get_item
        mock_table.get_item.side_effect = ClientError(
            {"Error": {"Message": "AccessDenied / NetworkError"}}, "GetItem"
        )

        client = CreateClient(
            name="Hosp X",
            tax_id="987654321",
            country="CO",
            level="1",
            specialty="General",
            location="Medellín"
        )

        with pytest.raises(ApiError, match="Error al verificar duplicado"):
            client.validate()

    # 🆕 🚫 Otros países con tax_id corto (<5) -> ParamError
    def test_validate_otro_pais_tax_id_demasiado_corto(self):
        client = CreateClient(
            name="Clínica Intl",
            tax_id="1234",      # < 5
            country="AR",       # ni CO ni MX
            level="2",
            specialty="Trauma",
            location="Buenos Aires"
        )
        with pytest.raises(ParamError, match="Identificador tributario inválido"):
            client.validate()
