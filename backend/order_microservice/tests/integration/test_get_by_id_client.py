import pytest
import logging
from datetime import date, timedelta
from unittest.mock import patch


@pytest.mark.usefixtures("client")
class TestGetOrdersByClientIntegration:
    """🧪 Test de integración para GET /client"""

    def test_create_and_get_orders_by_client(self, client):
        """✅ Debe crear una orden y luego recuperarla usando el client_id del JWT"""

        # Patch del JWT para este test
        with patch("src.blueprints.orders.current_cognito_jwt", {"sub": "CLIENT-123"}):

            # 1️⃣ Crear orden
            payload = {
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
                "id_vendor": "VENDOR-999"
            }

            create_response = client.post("/", json=payload)
            create_json = create_response.get_json()

            logging.info("🧩 Create Order Response: %s", create_json)

            assert create_response.status_code == 201
            assert create_json["order"]["id_client"] == "CLIENT-123"

            # 2️⃣ Obtener órdenes usando el client_id del JWT
            get_response = client.get("/client")
            get_json = get_response.get_json()

            logging.info("📦 Get Orders by Client Response: %s", get_json)

            assert get_response.status_code == 200
            assert isinstance(get_json, list)
            assert len(get_json) >= 1
            assert any(order["id_client"] == "CLIENT-123" for order in get_json)


    def test_get_orders_by_client_invalid_client(self, client):
        """🚫 Si el JWT trae un client_id inexistente → lista vacía"""
        with patch("src.blueprints.orders.current_cognito_jwt", {"sub": "CLIENT-NOEXISTE"}):

            response = client.get("/client")
            json_data = response.get_json()

            logging.info("🚫 Response invalid client: %s", json_data)

            assert response.status_code == 200
            assert isinstance(json_data, list)
            assert len(json_data) == 0
