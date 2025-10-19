import pytest


class TestGetAllVendorsEndpoint:
    @pytest.mark.usefixtures("client")
    def test_get_all_vendors_endpoint(self, client):
        """✅ Caso exitoso: retorna lista de vendedores"""
        self.create_vendor(client, {"name": "Jhorman", "email": "jhorman@example.com"})
        self.create_vendor(client, {"name": "Carlos", "email": "carlos@example.com"})

        response = client.get("/")
        assert response.status_code == 200
        data = response.get_json()

        assert isinstance(data, list)
        assert len(data) == 2

    def create_vendor(self, client, partial_payload):
        payload = {
            "name": "Jhorman Galindo",
            "email": "jhorman@example.com",
            "institutions": ["131231231", "12312312312"]
        }
        payload.update(partial_payload)
        return client.post("/", json=payload)

    @pytest.mark.usefixtures("client")
    def test_get_all_vendors_vacio(self, client):
        """⚠️ Caso sin vendedores: lista vacía"""
        response = client.get("/")

        assert response.status_code == 200
        data = response.get_json()
        assert isinstance(data, list)
        assert len(data) == 0
