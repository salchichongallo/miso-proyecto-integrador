import pytest
import logging
from datetime import date, timedelta
from unittest.mock import patch


class FakeJWT:
    """Mock compatible con current_cognito_jwt.get()"""
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
class TestGetOrdersByClientIntegration:
    """🧪 Test de integración para GET /client/<client_id>"""

    @patch("src.blueprints.orders.current_cognito_jwt", new=FakeJWT(sub="CLIENT-123", role="client"))
    def test_create_and_get_orders_by_client(self, client):
        """✅ Debe crear una orden y luego recuperarla por client_id"""

        # 1️⃣ Crear la orden
        payload = {
            "priority": "HIGH",
            "products": [
                {"id": "P-1001", "name": "Mouse", "amount": 2,
                 "id_warehouse": "W-001", "unit_price": 25.0},
                {"id": "P-2002", "name": "Keyboard", "amount": 1,
                 "id_warehouse": "W-002", "unit_price": 45.0}
            ],
            "country": "Mexico",
            "city": "Monterrey",
            "address": "Av. Constitución #1500",
            "date_estimated": (date.today() + timedelta(days=3)).isoformat(),
            "id_client": "CLIENT-123",
            "id_vendor": "VENDOR-999"
        }

        create_response = client.post("/", json=payload)
        create_json = create_response.get_json()

        logging.info("🧩 Create Order Response: %s", create_json)

        assert create_response.status_code == 201
        assert "message" in create_json

        # 2️⃣ Obtener órdenes usando la nueva ruta /client/<client_id>
        get_response = client.get("/client/CLIENT-123")
        get_json = get_response.get_json()

        logging.info("📦 Get Orders by Client Response: %s", get_json)

        assert get_response.status_code == 200
        assert isinstance(get_json, list)
        assert len(get_json) >= 1
        assert any(order["id_client"] == "CLIENT-123" for order in get_json)


    @patch("src.blueprints.orders.current_cognito_jwt", new=FakeJWT(sub="CLIENT-NOEXISTE", role="client"))
    def test_get_orders_by_client_invalid_client(self, client):
        """🚫 Si el cliente no existe, debe devolver lista vacía"""

        response = client.get("/client/CLIENT-NOEXISTE")
        json_data = response.get_json()

        logging.info("🚫 Response invalid client: %s", json_data)

        assert response.status_code == 200
        assert isinstance(json_data, list)
        assert len(json_data) == 0
