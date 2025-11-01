import pytest
import logging

class TestGetAllProducts:
    @pytest.mark.usefixtures("client")
    def test_get_all_products(self, client):
        """✅ Caso exitoso de obtención de productos"""
        response = client.get("/")
        logging.info("Response: %s", response.get_json())
        assert response.status_code == 200
