import pytest
import logging

class TestCreateProduct:
    @pytest.mark.usefixtures("client")
    def test_create_product_endpoint(self, client):
        """✅ Caso exitoso de creación"""
        payload = {
            "provider_nit": "1234567890",
            "name": "Acetaminofén",
            "product_type": "Medicamento",
            "stock": 10,
            "expiration_date": "2099-12-22",
            "temperature_required": 25.0,
            "batch": "L001",
            "status": "Disponible",
            "unit_value": 2.5,
            "storage_conditions": "Lugar fresco y seco"
        }
        response = client.post("/", json=payload)
        logging.info("Response: %s", response.get_json())
        assert response.status_code == 201
