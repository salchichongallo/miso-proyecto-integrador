import pytest
import logging

class TestCreateWarehouse:
    @pytest.mark.usefixtures("client")
    def test_create_warehouse_endpoint(self, client):
        payload = {
            "address": "foo street",
            "country": "Colombia",
            "city": "Medellin",
            "capacity": 20
        }
        response = client.post("/warehouses", json=payload)
        logging.info("Response: %s", response.get_json())
        assert response.status_code == 201
