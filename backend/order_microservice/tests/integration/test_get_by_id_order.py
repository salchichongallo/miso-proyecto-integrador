import pytest
import logging
from datetime import date, timedelta
from unittest.mock import patch
from src.errors.errors import ApiError

@pytest.mark.usefixtures("client")
class TestGetOrderByIdIntegration:
    """🧪 Test de integración para obtener una orden por ID (rutas: '/' y '/<id>')"""

    def test_get_order_by_id_success(self, client):
        """✅ Crea una orden y luego la obtiene correctamente por ID"""
        # 1) Crear orden en "/"
        create_payload = {
            "priority": "HIGH",
            "products": [
                {"id": "P-1001", "name": "Mouse", "amount": 2, "id_warehouse": "W-001"},
                {"id": "P-2002", "name": "Keyboard", "amount": 1, "id_warehouse": "W-002"}
            ],
            "country": "Mexico",
            "city": "Monterrey",
            "address": "Av. Constitución #1500",
            "date_estimated": (date.today() + timedelta(days=3)).isoformat(),
            "id_client": "CLIENT-123",
            "id_vendor": "VENDOR-456"
        }

        create_response = client.post("/", json=create_payload)
        body = create_response.get_json()
        logging.info("Create Response: %s", body)
        assert create_response.status_code == 201

        order_id = body["order"]["id"]

        # 2) Obtenerla con "/<id>"
        response = client.get(f"/{order_id}")
        result = response.get_json()
        logging.info("Get Response: %s", result)

        assert response.status_code == 200
        assert result["id"] == order_id
        assert result["priority"] == "HIGH"
        assert isinstance(result["products"], list)
        assert len(result["products"]) == 2

    def test_get_order_not_found(self, client):
        """❌ Debe devolver 404 si la orden no existe"""
        response = client.get("/ORDER-NO-EXISTE")
        json_data = response.get_json()
        logging.info("Response JSON (no encontrada): %s", json_data)

        assert response.status_code == 404
        assert "error" in json_data
        assert "No se encontró" in json_data["error"]

    # 🚫 500 por ApiError desde el comando
    @patch("src.commands.get_order_id.GetOrderById.execute")
    def test_get_order_api_error(self, mock_execute, client):
        """❌ 500 si el comando lanza ApiError"""
        mock_execute.side_effect = ApiError("Fallo interno en DynamoDB")

        response = client.get("/ORDER-FAIL")
        json_data = response.get_json()
        logging.info("Response (ApiError): %s", json_data)

        assert response.status_code == 500
        assert "error" in json_data
        assert "Fallo interno" in json_data["error"]

    # 🚫 500 por Exception inesperada
    @patch("src.commands.get_order_id.GetOrderById.execute")
    def test_get_order_unexpected_exception(self, mock_execute, client):
        """❌ 500 si ocurre una excepción inesperada"""
        mock_execute.side_effect = Exception("Error no controlado")

        response = client.get("/ORDER-CRASH")
        json_data = response.get_json()
        logging.info("Response (Exception): %s", json_data)

        assert response.status_code == 500
        assert "error" in json_data
        assert "Error inesperado" in json_data["error"]
