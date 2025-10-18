import pytest


class TestGetAllProvidersEndpoint:

    # ✅ Caso exitoso: retorna lista de proveedores
    @pytest.mark.usefixtures("client")
    def test_get_all_providers_exitoso(self, client):
        """✅ Retorna lista de proveedores exitosamente"""
        self.create_provider(client, {"name": "Proveedor A", "nit": "1234567890"})
        self.create_provider(client, {"name": "Proveedor B", "nit": "9234567890"})

        response = client.get("/")
        data = response.get_json()

        assert response.status_code == 200
        assert isinstance(data, list)
        assert len(data) == 2

    def create_provider(self, client, partial_payload):
        payload = {
            "name": "Proveedor A",
            "country": "CO",
            "nit": "1234567890",
            "address": "Calle 123",
            "email": "proveedor@correo.com",
            "phone": "3001234567"
        }
        payload.update(partial_payload)
        return client.post("/", json=payload)

    @pytest.mark.usefixtures("client")
    def test_get_all_providers_lista_vacia(self, client):
        """⚙️ Retorna lista vacía sin errores"""
        response = client.get("/")
        data = response.get_json()

        assert response.status_code == 200
        assert data == []
