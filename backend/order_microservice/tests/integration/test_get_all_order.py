import pytest
import logging
from unittest.mock import patch
from src.errors.errors import ApiError


@pytest.mark.usefixtures("client")
class TestGetAllOrdersIntegration:
    """🧪 Test de integración para obtener todas las órdenes"""

    def test_get_all_orders_success(self, client):
        """✅ Debe devolver 200 y una lista (aunque esté vacía)"""

        response = client.get("/")
        json_data = response.get_json()

        logging.info("Response JSON (success): %s", json_data)

        assert response.status_code == 200
        assert isinstance(json_data, list)   # lista vacía o con elementos

    @patch("src.commands.view_all.GetAllOrders.execute")
    def test_get_all_orders_api_error(self, mock_execute, client):
        """❌ Debe devolver 500 si el comando lanza ApiError"""

        mock_execute.side_effect = ApiError("Fallo interno en DynamoDB")

        response = client.get("/")
        json_data = response.get_json()

        logging.info("Response JSON (ApiError): %s", json_data)

        assert response.status_code == 500
        assert "error" in json_data
        assert "Fallo interno" in json_data["error"]

    @patch("src.commands.view_all.GetAllOrders.execute")
    def test_get_all_orders_unexpected_exception(self, mock_execute, client):
        """❌ Debe devolver 500 si ocurre una excepción inesperada"""

        mock_execute.side_effect = Exception("Error inesperado al escanear tabla")

        response = client.get("/")
        json_data = response.get_json()

        logging.info("Response JSON (Exception): %s", json_data)

        assert response.status_code == 500
        assert "error" in json_data
        assert "Error inesperado" in json_data["error"]
