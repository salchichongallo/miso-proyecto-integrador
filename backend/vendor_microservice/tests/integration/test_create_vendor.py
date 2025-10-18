import pytest


class TestVendorEndpoints:
    @pytest.mark.usefixtures("client")
    def test_create_vendor_endpoint(self, client):
        """✅ Caso exitoso de creación"""
        payload = {
            "name": "Jhorman Galindo",
            "email": "jhorman@example.com",
            "institutions": ["Clinica Norte", "Hospital Central"]
        }

        response = client.post("/", json=payload)
        assert response.status_code == 201
        data = response.get_json()
        assert "Vendor created successfully" in data["mssg"]
        assert data["vendor"]["name"] == "Jhorman Galindo"

    @pytest.mark.usefixtures("client")
    def test_create_vendor_schema_falla(self, client):
        """❌ Falla en validación del JSON schema"""
        payload_without_email = {"name": "Vendor X", "institutions": []}
        response = client.post("/", json=payload_without_email)
        assert response.status_code in (400, 500)
        data = response.get_json()
        assert "El campo email es obligatorio." in str(data)
