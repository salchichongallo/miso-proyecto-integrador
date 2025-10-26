import pytest


class TestGetAllWarehouses:
    @pytest.mark.usefixtures("client")
    def test_get_all_warehouses(self, client):
        self.create_warehouse(client)
        self.create_warehouse(client)

        response = client.get("/warehouses")
        assert response.status_code == 200
        assert len(response.get_json()) == 2

    def create_warehouse(self, client):
        payload = {
            "address": "foo street",
            "country": "Colombia",
            "city": "Medellin",
            "capacity": 20
        }
        return client.post("/warehouses", json=payload).get_json()

    @pytest.mark.usefixtures("client")
    def test_empty_warehouses(self, client):
        response = client.get("/warehouses")
        assert response.status_code == 200
        assert response.get_json() == []
