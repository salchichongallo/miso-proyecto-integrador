import logging
import random
import pytest
from unittest.mock import patch


class TestGetAllClientsEndpoint:

    @pytest.mark.usefixtures("client")
    def test_get_all_clients_endpoint(self, client):

        with patch("src.commands.create_client.create_user",
                   return_value={"cognito_id": "mock-1"}):
            self.create_client(client, {"name": "Hospital Central", "country": "CO"})

        with patch("src.commands.create_client.create_user",
                   return_value={"cognito_id": "mock-2"}):
            self.create_client(client, {"name": "Clinica Norte", "country": "MX"})

        response = client.get("/")
        assert response.status_code == 200

        data = response.get_json()
        logging.info("Response data: %s", data)

        assert isinstance(data, list)
        assert len(data) == 2

        # Ordenado alfabéticamente → Clinica Norte primero
        assert data[0]["name"] == "Clinica Norte"
        assert data[0]["country"] == "MX"

    # helper interno
    def create_client(self, client, partial_payload):
        """Envia un POST para crear cliente y mockea tax_id automáticamente."""

        base_payload = {
            "name": "Hospital Central",
            "country": "CO",
            "level": "I",
            "specialty": "Cardiología",
            "location": "Bogotá"
        }

        base_payload.update(partial_payload)

        if "tax_id" not in partial_payload:
            base_payload["tax_id"] = str(random.randint(1000000000, 9999999999))

        return client.post("/", json=base_payload)

    @pytest.mark.usefixtures("client")
    def test_get_all_clients_vacio(self, client):
        response = client.get("/")

        assert response.status_code == 200
        data = response.get_json()

        assert isinstance(data, list)
        assert len(data) == 0
