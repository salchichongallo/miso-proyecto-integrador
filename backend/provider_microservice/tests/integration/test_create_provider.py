import pytest
import logging
from unittest.mock import patch
from src.errors.errors import ApiError


@pytest.mark.usefixtures("client")
class TestCreateProviderIntegration:
    """🧪 Tests de integración SOLO para crear proveedores"""

    # ============================================================
    # ✅ Caso exitoso
    # ============================================================
    @patch("src.commands.create_provider.create_user", return_value={"cognito_id": "prov-test-1"})
    @patch("src.models.provider.ProviderModel.find_by_email", return_value=None)
    @patch("src.models.provider.ProviderModel.find", return_value=None)
    @patch("src.models.provider.ProviderModel.create")
    def test_successful_provider_creation(self, mock_create, mock_find_nit, mock_find_email, mock_create_user, client):
        """Debe crear un proveedor exitosamente y devolver 201"""

        mock_provider_dict = {
            "nit": "1234567890",
            "name": "Proveedor X",
            "country": "CO",
            "address": "Calle 123",
            "email": "contacto@proveedor.com",
            "phone": "3104567892",
            "provider_id": "prov-test-1"
        }

        mock_provider_obj = type("Obj", (), {"to_dict": lambda self: mock_provider_dict})
        mock_create.return_value = mock_provider_obj()

        payload = {
            "nit": "1234567890",
            "name": "Proveedor X",
            "country": "CO",
            "address": "Calle 123",
            "email": "contacto@proveedor.com",
            "phone": "3104567892"
        }

        response = client.post("/", json=payload)
        json_data = response.get_json()

        # Validaciones
        assert response.status_code == 201
        assert "message" in json_data
        assert "Proveedor creado exitosamente" in json_data["message"]

        # Aquí estaba el error
        provider = json_data["provider"]
        assert provider["nit"] == "1234567890"
        assert provider["email"] == "contacto@proveedor.com"

        # Mocks
        mock_find_email.assert_called_once_with("contacto@proveedor.com")
        mock_create_user.assert_called_once_with(email="contacto@proveedor.com")
        mock_create.assert_called_once()

    # ============================================================
    # ❌ Campo obligatorio faltante
    # ============================================================
    def test_missing_required_field(self, client):
        payload = {
            "nit": "1234567890",
            # falta name
            "country": "CO",
            "address": "Calle 123",
            "email": "contacto@proveedor.com",
            "phone": "3104567892"
        }

        response = client.post("/", json=payload)
        json_data = response.get_json()

        assert response.status_code == 400
        assert "error" in json_data

    # ============================================================
    # ❌ Email duplicado
    # ============================================================
    @patch("src.models.provider.ProviderModel.find_by_email")
    def test_email_already_exists(self, mock_find_email, client):
        mock_find_email.return_value = True  # simula email existente

        payload = {
            "nit": "1234567890",
            "name": "Proveedor X",
            "country": "CO",
            "address": "Calle 123",
            "email": "contacto@proveedor.com",
            "phone": "3104567892"
        }

        response = client.post("/", json=payload)
        json_data = response.get_json()

        assert response.status_code == 409
        assert "error" in json_data
        assert "ya está registrado" in json_data["error"]

    # ============================================================
    # ❌ ApiError interno en el comando
    # ============================================================
    @patch("src.commands.create_provider.CreateProvider.execute", side_effect=ApiError("Error en DynamoDB"))
    def test_api_error(self, mock_execute, client):
        payload = {
            "nit": "1234567890",
            "name": "Proveedor X",
            "country": "CO",
            "address": "Calle 123",
            "email": "contacto@proveedor.com",
            "phone": "3104567892"
        }

        response = client.post("/", json=payload)
        json_data = response.get_json()

        assert response.status_code == 500
        assert "Error en DynamoDB" in json_data["error"]

    # ============================================================
    # ❌ Excepción inesperada
    # ============================================================
    @patch("src.commands.create_provider.CreateProvider.execute", side_effect=Exception("Crash inesperado"))
    def test_unexpected_exception(self, mock_execute, client):
        payload = {
            "nit": "1234567890",
            "name": "Proveedor X",
            "country": "CO",
            "address": "Calle 123",
            "email": "contacto@proveedor.com",
            "phone": "3104567892"
        }

        response = client.post("/", json=payload)
        json_data = response.get_json()

        assert response.status_code == 500
        assert "Error inesperado" in json_data["error"]
