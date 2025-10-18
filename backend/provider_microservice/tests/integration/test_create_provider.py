import pytest


class TestProviderEndpoints:
    @pytest.mark.usefixtures("client")
    def test_create_provider_exitoso(self, client):
        """✅ Caso exitoso de creación"""

        payload = {
            "name": "Proveedor A",
            "country": "CO",
            "nit": "1234567890",
            "address": "Calle 123",
            "email": "proveedor@correo.com",
            "phone": "3001234567"
        }

        response = client.post("/", json=payload)
        data = response.get_json()

        assert response.status_code == 201
        assert data["message"] == "Proveedor creado exitosamente"
        assert data["provider"]["name"] == "Proveedor A"

    @pytest.mark.usefixtures("client")
    def test_create_provider_telefono_invalido(self, client):
        """❌ Teléfono inválido"""
        payload = {
            "name": "Proveedor X",
            "country": "CO",
            "nit": "1234567890",
            "address": "Calle 10",
            "email": "a@b.com",
            "phone": "123"
        }
        response = client.post("/", json=payload)
        data = response.get_json()
        assert response.status_code in (400, 500)
        assert "teléfono" in str(data).lower()
