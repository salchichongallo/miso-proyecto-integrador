import pytest
import logging
from datetime import date, timedelta
from unittest.mock import patch
from src.errors.errors import ApiError


class FakeJWT:
    """Mock compatible con current_cognito_jwt.get()."""
    def __init__(self, sub="CLIENT-123", role="client"):
        self.sub = sub
        self.role = role

    def get(self, key, default=None):
        if key == "sub":
            return self.sub
        if key == "custom:role":
            return self.role
        return default


@pytest.mark.usefixtures("client")
class TestGetOrderByIdIntegration:
    """🧪 Test de integración para obtener una orden por ID"""

    @patch("src.blueprints.orders.current_cognito_jwt", new=FakeJWT(sub="CLIENT-123", role="client"))
    def test_get_order_by_id_success(self, client):
        """✅ Crea una orden y luego la obtiene correctamente por ID"""

        # 1️⃣ Crear orden
        create_payload = {
            "priority": "HIGH",
            "products": [
                {"id": "P-1001", "name": "Mouse", "amount": 2, "id_warehouse": "W-001", "unit_price": 25.0},
                {"id": "P-2002", "name": "Keyboard", "amount": 1, "id_warehouse": "W-002", "unit_price": 45.0}
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

        # 2️⃣ Obtener el ID real desde GET /client
        list_response = client.get("/client")
        orders = list_response.get_json()
        logging.info("Orders from GET /client: %s", orders)

        assert len(orders) > 0
        order_id = orders[0]["id"]

        # 3️⃣ Obtener la orden con "/<id>"
        response = client.get(f"/{order_id}")
        result = response.get_json()
        logging.info("Get Response: %s", result)

        assert response.status_code == 200
        assert result["id"] == order_id
        assert result["priority"] == "HIGH"
        assert len(result["products"]) == 2

    @patch("src.blueprints.orders.current_cognito_jwt", new=FakeJWT(sub="CLIENT-X"))
    def test_get_order_not_found(self, client):
        """❌ Debe devolver 404 si la orden no existe"""
        response = client.get("/ORDER-NO-EXISTE")
        json_data = response.get_json()

        assert response.status_code == 404
        assert "error" in json_data

    @patch("src.blueprints.orders.current_cognito_jwt", new=FakeJWT())
    @patch("src.commands.get_order_id.GetOrderById.execute")
    def test_get_order_api_error(self, mock_execute, client):
        """❌ 500 si el comando lanza ApiError"""
        mock_execute.side_effect = ApiError("Fallo interno en DynamoDB")

        response = client.get("/ORDER-FAIL")
        json_data = response.get_json()

        assert response.status_code == 500
        assert "error" in json_data
        assert "Fallo interno" in json_data["error"]

    @patch("src.blueprints.orders.current_cognito_jwt", new=FakeJWT())
    @patch("src.commands.get_order_id.GetOrderById.execute")
    def test_get_order_unexpected_exception(self, mock_execute, client):
        """❌ 500 si ocurre una excepción inesperada"""
        mock_execute.side_effect = Exception("Error no controlado")

        response = client.get("/ORDER-CRASH")
        json_data = response.get_json()

        assert response.status_code == 500
        assert "error" in json_data
        assert "Error inesperado" in json_data["error"]
