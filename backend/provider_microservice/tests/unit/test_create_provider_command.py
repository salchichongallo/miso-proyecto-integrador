import pytest
from unittest.mock import MagicMock, patch
from botocore.exceptions import ClientError
from src.commands.create_provider import CreateProvider
from src.errors.errors import ParamError, ApiError


class TestCreateProviderCommand:

    # ✅ Creación exitosa
    @patch("boto3.resource")
    def test_execute_crea_proveedor_exitosamente(self, mock_dynamodb):
        mock_table = MagicMock()
        mock_dynamodb.return_value.Table.return_value = mock_table
        mock_table.get_item.return_value = {}  # no existe
        provider = CreateProvider(
            name="Proveedor Central",
            country="CO",
            nit="1234567890",
            address="Calle 10",
            email="proveedor@mail.com",
            phone="3124567890"
        )
        mock_table.put_item.return_value = {"ResponseMetadata": {"HTTPStatusCode": 200}}
        result = provider.execute()

        assert "provider_id" in result
        assert result["name"] == "Proveedor Central"
        assert result["message"] == "Proveedor registrado exitosamente"
        mock_table.put_item.assert_called_once()

    # 🚫 Campos vacíos
    def test_validate_campos_obligatorios_faltantes(self):
        provider = CreateProvider(
            name="",
            country="",
            nit="",
            address="",
            email="",
            phone=""
        )
        with pytest.raises(ParamError, match="Todos los campos obligatorios"):
            provider.validate()

    # 🚫 NIT inválido
    def test_validate_nit_invalido(self):
        provider = CreateProvider(
            name="Proveedor NIT Malo",
            country="CO",
            nit="12345",
            address="Calle 20",
            email="valido@mail.com",
            phone="3124567890"
        )
        with pytest.raises(ParamError, match="NIT debe contener exactamente 10 dígitos"):
            provider.validate()

    # 🚫 Email inválido
    def test_validate_email_invalido(self):
        provider = CreateProvider(
            name="Proveedor Email Malo",
            country="CO",
            nit="1234567890",
            address="Carrera 15",
            email="correo-invalido",
            phone="3124567890"
        )
        with pytest.raises(ParamError, match="formato del email es inválido"):
            provider.validate()

    # 🚫 Teléfono inválido
    def test_validate_telefono_invalido(self):
        provider = CreateProvider(
            name="Proveedor Teléfono Malo",
            country="CO",
            nit="1234567890",
            address="Calle 88",
            email="valido@correo.com",
            phone="1234"
        )
        # 🔧 Mensaje corregido según implementación real
        with pytest.raises(ParamError, match="El teléfono debe contener exactamente 10 dígitos numéricos"):
            provider.validate()

    # 💾 Duplicado (ya existe)
    @patch("boto3.resource")
    def test_validate_proveedor_duplicado(self, mock_dynamodb):
        mock_table = MagicMock()
        mock_dynamodb.return_value.Table.return_value = mock_table
        mock_table.get_item.return_value = {"Item": {"nit": "1234567890"}}
        provider = CreateProvider(
            name="Proveedor Duplicado",
            country="CO",
            nit="1234567890",
            address="Calle 15",
            email="duplicado@mail.com",
            phone="3124567890"
        )
        with pytest.raises(ParamError, match="ya está registrado"):
            provider.validate()

    # ⚠️ Error al verificar duplicado (ClientError)
    @patch("boto3.resource")
    def test_validate_error_verificar_duplicado(self, mock_dynamodb):
        mock_table = MagicMock()
        mock_dynamodb.return_value.Table.return_value = mock_table
        mock_table.get_item.side_effect = ClientError(
            {"Error": {"Message": "AccessDenied"}}, "GetItem"
        )

        provider = CreateProvider(
            name="Proveedor X",
            country="CO",
            nit="9876543210",
            address="Calle 30",
            email="prueba@mail.com",
            phone="3001112233"
        )
        with pytest.raises(ApiError, match="Error al verificar duplicado"):
            provider.validate()

    # ⚙️ Encriptado SHA-256 correcto
    def test_encrypt_nit_sha256_generado(self):
        provider = CreateProvider(
            "Proveedor SHA",
            "CO",
            "1234567890",
            "Calle 1",
            "correo@mail.com",
            "3002223344"
        )
        provider.encrypt_nit()
        assert len(provider.nit_encrypted) == 64

    # 💥 Error al guardar en DynamoDB
    @patch("boto3.resource")
    def test_save_error_dynamodb(self, mock_dynamodb):
        mock_table = MagicMock()
        mock_dynamodb.return_value.Table.return_value = mock_table
        mock_table.put_item.side_effect = ClientError(
            {"Error": {"Message": "Falla de red"}}, "PutItem"
        )

        provider = CreateProvider(
            "Proveedor Dynamo",
            "CO",
            "1234567890",
            "Calle 12",
            "correo@mail.com",
            "3009998888"
        )

        with pytest.raises(ApiError, match="Error al registrar proveedor"):
            provider.save()
