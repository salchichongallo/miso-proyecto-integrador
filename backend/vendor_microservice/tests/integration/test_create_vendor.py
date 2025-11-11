import pytest
import logging
from unittest.mock import patch
from src.errors.errors import ApiError


@pytest.mark.usefixtures("client")
class TestCreateVendorIntegration:
    """🧪 Test de integración para la creación de vendedores"""

    def test_successful_vendor_creation(self, client):
        """✅ Debe crear un vendedor exitosamente y devolver 201"""
        payload = {
            "name": "Jhorman Galindo",
            "email": "jhorman@example.com",
            "institutions": [{ "name": "Clinica Norte" }, { "name": "Hospital Central" }],
        }

        response = client.post("/", json=payload)
        json_data = response.get_json()

        logging.info("Response JSON: %s", json_data)

        # ✅ Verificaciones
        assert response.status_code == 201
        assert "message" in json_data
        assert "Vendedor registrado exitosamente" in json_data["message"]
        assert "vendor" in json_data
        assert json_data["vendor"]["email"] == "jhorman@example.com"
        assert json_data["vendor"]["name"] == "Jhorman Galindo"
        assert isinstance(json_data["vendor"]["institutions"], list)
        assert len(json_data["vendor"]["institutions"]) == 2

    def test_missing_required_field(self, client):
        """❌ Debe retornar 400 si falta un campo obligatorio"""
        payload = {
            # Falta el campo 'email'
            "name": "Jhorman Galindo",
            "institutions": ["Clinica Norte"]
        }

        response = client.post("/", json=payload)
        json_data = response.get_json()

        logging.info("Response JSON (error 400): %s", json_data)

        # ✅ Verificaciones
        assert response.status_code == 400
        assert "error" in json_data
        assert "email" in json_data["error"] or "correo" in json_data["error"]

    # 🚫 Caso: ApiError durante la creación
    @patch("src.commands.create_vendor.CreateVendor.execute")
    def test_create_vendor_api_error(self, mock_execute, client):
        """❌ Debe devolver 500 si ocurre un ApiError en el comando"""
        mock_execute.side_effect = ApiError("Error en DynamoDB al guardar el vendedor")

        payload = {
            "name": "Jhorman Galindo",
            "email": "jhorman@example.com",
            "institutions": [{ "name": "Clinica Norte" }, { "name": "Hospital Central" }],
        }

        response = client.post("/", json=payload)
        json_data = response.get_json()

        logging.info("Response JSON (ApiError 500): %s", json_data)

        # ✅ Verificaciones
        assert response.status_code == 500
        assert "error" in json_data
        assert "Error en DynamoDB" in json_data["error"]

    # 🚫 Caso: excepción inesperada
    @patch("src.commands.create_vendor.CreateVendor.execute")
    def test_create_vendor_unexpected_exception(self, mock_execute, client):
        """❌ Debe devolver 500 si ocurre una excepción inesperada"""
        mock_execute.side_effect = Exception("Error inesperado en ejecución")

        payload = {
            "name": "Jhorman Galindo",
            "email": "jhorman@example.com",
            "institutions": [{ "name":"Clinica Norte" }]
        }

        response = client.post("/", json=payload)
        json_data = response.get_json()

        logging.info("Response JSON (Exception 500): %s", json_data)

        # ✅ Verificaciones
        assert response.status_code == 500
        assert "error" in json_data
        assert "Error inesperado" in json_data["error"]
