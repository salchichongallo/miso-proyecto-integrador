import logging
import random
import pytest


class TestGetAllClientsEndpoint:
    @pytest.mark.usefixtures("client")
    def test_get_all_clients_endpoint(self, client):
        """✅ Caso exitoso: retorna lista de clientes"""
        self.create_client(client, {"name": "Hospital Central", "country": "CO"})
        self.create_client(client, {"name": "Clinica Norte", "country": "MX"})

        response = client.get("/")
        assert response.status_code == 200
        data = response.get_json()
        logging.info("Response data: %s", data)

        assert isinstance(data, list)
        assert len(data) == 2
        assert data[0]["name"] == "Clinica Norte"
        assert data[0]["country"] == "MX"

    def create_client(self, client, partial_payload):
        """✅ Caso exitoso de creación"""
        base_payload = {
            "name": "Hospital Central",
            "country": "CO",
            "level": "I",
            "specialty": "Cardiología",
            "location": "Bogotá"
        }
        base_payload.update(partial_payload)
        if "tax_id" not in partial_payload:
            base_payload["tax_id"] = str(random.randint(10000, 9999999999))

        return client.post("/", json=base_payload)

    @pytest.mark.usefixtures("client")
    def test_get_all_clients_vacio(self, client):
        """⚠️ Caso sin clientes: lista vacía"""
        response = client.get("/")

        assert response.status_code == 200
        data = response.get_json()
        assert isinstance(data, list)
        assert len(data) == 0
