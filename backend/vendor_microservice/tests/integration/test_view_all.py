import pytest


class TestGetAllVendorsEndpoint:
    @pytest.mark.usefixtures("client")
    def test_get_all_vendors_endpoint(self, client):
        """✅ Caso exitoso: retorna lista de vendedores"""
        self.create_vendor(client, {"vendor_id": "1", "name": "Jhorman", "email": "jhorman@example.com"})
        self.create_vendor(client, {"vendor_id": "2", "name": "Carlos", "email": "carlos@example.com"})

        response = client.get("/")
        assert response.status_code == 200
        data = response.get_json()

        assert "vendors" in data
        assert len(data["vendors"]) == 2

    def create_vendor(self, client, partial_payload):
        payload = {
            "name": "Jhorman Galindo",
            "email": "jhorman@example.com",
            "institutions": ["Clinica Norte", "Hospital Central"]
        }
        payload.update(partial_payload)
        return client.post("/", json=payload)

    @pytest.mark.usefixtures("client")
    def test_get_all_vendors_vacio(self, client):
        """⚠️ Caso sin vendedores: lista vacía"""
        response = client.get("/")

        assert response.status_code == 200
        data = response.get_json()
        print(data)
        assert "vendors" in data
        assert isinstance(data["vendors"], list)
        assert len(data["vendors"]) == 0
