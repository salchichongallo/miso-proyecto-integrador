import pytest
import logging

class TestClientEndpoints:

    @pytest.mark.usefixtures("client")
    def test_create_client_endpoint(self, client):
        """✅ Caso exitoso de creación"""
        payload = {
            "name": "Hospital Central",
            "tax_id": "1234567890",
            "country": "CO",
            "level": "I",
            "specialty": "Cardiología",
            "location": "Bogotá"
        }

        response = client.post("/", json=payload)
        logging.debug("Response: %s", response.get_json())
        assert response.status_code == 201
        data = response.get_json()
        assert "Client created successfully" in data["mssg"]
        assert data["vendor"]["name"] == "Hospital Central"

    # # ----------------- 🚫 Casos negativos -----------------

    @pytest.mark.usefixtures("client")
    def test_create_client_schema_falla(self, client):
        """❌ Falla de validación en el schema JSON"""
        payload_without_tax_id = {
            "name": "Hospital Central",
            "country": "CO",
            "level": "I",
            "specialty": "Cardiología",
            "location": "Bogotá"
        }
        response = client.post("/", json=payload_without_tax_id)
        assert response.status_code in (400, 500)
        data = response.get_json()
        assert "obligatorio" in str(data)

    @pytest.mark.usefixtures("client")
    def test_create_client_tax_id_invalido(self, client):
        """❌ NIT inválido (menos o más de 10 dígitos)"""
        payload = {
            "name": "Hospital Norte",
            "tax_id": "12345",  # ❌ menos de 10 dígitos
            "country": "CO",
            "level": "II",
            "specialty": "Pediatría",
            "location": "Bogotá"
        }
        response = client.post("/", json=payload)
        assert response.status_code in (400, 500)
        assert "10 dígitos" in str(response.get_json())

    @pytest.mark.usefixtures("client")
    def test_create_client_duplicado(self, client):
        """❌ Cliente duplicado"""

        # First, create the client successfully
        tax_id = "1234567890"
        payload = {
            "name": "Hospital Central",
            "tax_id": tax_id,
            "country": "CO",
            "level": "I",
            "specialty": "Cardiología",
            "location": "Bogotá"
        }
        client.post("/", json=payload)

        # Try to create the same client again
        payload = {
            "name": "Hospital Central",
            "tax_id": tax_id,
            "country": "CO",
            "level": "II",
            "specialty": "Cardiología",
            "location": "Bogotá"
        }
        response = client.post("/", json=payload)
        assert response.status_code in (400, 500)
        assert "ya está registrado" in str(response.get_json())
