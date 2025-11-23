import pytest
from unittest.mock import patch, MagicMock

from src.commands.create_provider import CreateProvider
from src.models.provider import ProviderModel
from src.errors.errors import ParamError, ApiError


class TestCreateProviderCommand:
    """🧪 Pruebas unitarias para CreateProvider"""

    # ============================================================
    # ✅ Caso exitoso de creación
    # ============================================================
    @patch("src.commands.create_provider.create_user")
    @patch.object(ProviderModel, "create")
    @patch.object(ProviderModel, "find_by_email", return_value=None)
    @patch.object(ProviderModel, "find", return_value=None)
    def test_execute_crea_provider_exitosamente(self, mock_find_nit, mock_find_email, mock_create, mock_create_user):
        """Debe crear un proveedor correctamente"""

        mock_create_user.return_value = {"cognito_id": "prov-123"}

        mock_provider = MagicMock()
        mock_provider.to_dict.return_value = {
            "nit": "9112345699",
            "name": "Proveedor S.A.",
            "country": "CO",
            "address": "Calle 123",
            "email": "contacto@proveedor.com",
            "phone": "3104567892",
            "provider_id": "prov-123"
        }
        mock_create.return_value = mock_provider

        body = {
            "nit": "9112345699",
            "name": "Proveedor S.A.",
            "country": "CO",
            "address": "Calle 123",
            "email": "contacto@proveedor.com",
            "phone": "3104567892"
        }

        command = CreateProvider(body)
        result = command.execute()

        assert result["nit"] == "9112345699"
        assert result["email"] == "contacto@proveedor.com"

        mock_find_email.assert_called_once_with("contacto@proveedor.com")
        mock_create_user.assert_called_once_with(email="contacto@proveedor.com")
        mock_create.assert_called_once()

    # ============================================================
    # 🚫 Campos obligatorios faltantes
    # ============================================================
    def test_faltan_campos_obligatorios(self):
        command = CreateProvider({
            "nit": "",
            "name": "",
            "country": "",
            "address": "",
            "email": "",
            "phone": ""
        })
        with pytest.raises(ParamError):
            command.execute()

    # ============================================================
    # 🚫 Email ya existe
    # ============================================================
    @patch.object(ProviderModel, "find_by_email")
    def test_email_duplicado(self, mock_find_email):
        mock_find_email.return_value = MagicMock()  # Simula duplicado

        body = {
            "nit": "9112345699",
            "name": "Proveedor X",
            "country": "CO",
            "address": "Calle 123",
            "email": "contacto@proveedor.com",
            "phone": "3104567892"
        }

        command = CreateProvider(body)
        with pytest.raises(ParamError, match="ya está registrado"):
            command.execute()


    # ============================================================
    # ⚡ Error interno al crear proveedor
    # ============================================================
    @patch.object(ProviderModel, "find_by_email", return_value=None)
    @patch.object(ProviderModel, "find", return_value=None)
    @patch("src.commands.create_provider.create_user", return_value={"cognito_id": "prov-123"})
    @patch.object(ProviderModel, "create", side_effect=Exception("Error DynamoDB"))
    def test_error_interno(self, mock_create, mock_create_user, mock_find_nit, mock_find_email):
        body = {
            "nit": "9112345699",
            "name": "Proveedor X",
            "country": "CO",
            "address": "Calle 123",
            "email": "contacto@proveedor.com",
            "phone": "3104567892"
        }

        command = CreateProvider(body)

        with pytest.raises(ApiError):
            command.execute()
