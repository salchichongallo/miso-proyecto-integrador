import pytest
import logging
from pathlib import Path


products_csv_file = Path(__file__).parent / 'test-data' / 'products_bulk.csv'


class TestCreateProduct:
    @pytest.mark.usefixtures("client")
    def test_create_product_endpoint(self, client):
        """✅ Caso exitoso de creación"""
        data = {
            'file': products_csv_file.open('rb')
        }
        response = client.post("/bulk", data=data)
        logging.info("Response: %s", response.get_json())
        assert response.status_code == 200
