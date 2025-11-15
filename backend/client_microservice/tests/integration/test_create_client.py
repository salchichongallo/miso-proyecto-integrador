import pytest
import logging
from unittest.mock import patch

@pytest.mark.usefixtures("client")
class TestClientEndpoints:

    def test_create_client_endpoint(self, client):
        payload = {
            "name": "Hospital Central",
            "tax_id": "1234567890",
            "country": "CO",
            "level": "I",
            "specialty": "Cardiología",
            "location": "Bogotá"
        }

        # mock
        with patch("src.commands.create_client.create_user",
                return_value={"cognito_id": "cognito-test-1"}):

            response = client.post("/", json=payload)
            data = response.get_json()

        assert response.status_code == 201
        assert "successfully" in data["mssg"].lower()
        assert data["client"]["name"] == "Hospital Central"

    # ----------------- 🚫 Casos negativos -----------------

    def test_create_client_schema_falla(self, client):
        payload = {
            "name": "Hospital Central",
            "country": "CO",
            "level": "I",
            "specialty": "Cardiología",
            "location": "Bogotá"
        }
        response = client.post("/", json=payload)
        assert response.status_code in (400, 500)
        assert "obligatorio" in str(response.get_json()).lower()

    def test_create_client_tax_id_invalido(self, client):
        payload = {
            "name": "Hospital Norte",
            "tax_id": "12345",
            "country": "CO",
            "level": "II",
            "specialty": "Pediatría",
            "location": "Bogotá"
        }
        response = client.post("/", json=payload)
        assert response.status_code in (400, 500)
        assert "10 dígitos" in str(response.get_json())

    def test_create_client_duplicado(self, client):
        """❌ Cliente duplicado"""

        payload = {
            "name": "Hospital Central",
            "tax_id": "1234567890",
            "country": "CO",
            "level": "I",
            "specialty": "Cardiología",
            "location": "Bogotá"
        }

        with patch("src.commands.create_client.create_user",
                   return_value={"cognito_id": "cognito-test-1"}):
            client.post("/", json=payload)

        # segundo intento → DEBE fallar
        response = client.post("/", json=payload)
        assert response.status_code in (400, 500)
        assert "ya está registrado" in str(response.get_json())

    def test_create_client_exception_generica(self, client):
        """❌ Debe capturar Exception genérica y retornar 500"""

        payload = {
            "name": "Hospital Crash",
            "tax_id": "1234567890",
            "country": "CO",
            "level": "II",
            "specialty": "Urgencias",
            "location": "Medellín"
        }

        # Mock que lanza una excepción NO controlada
        with patch("src.commands.create_client.CreateClient.execute",
                   side_effect=Exception("Error inesperado")):

            response = client.post("/", json=payload)
            data = response.get_json()

        assert response.status_code == 500
        assert "error inesperado" in data["error"].lower()


    