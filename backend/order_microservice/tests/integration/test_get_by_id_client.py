import pytest
import logging
from datetime import date, timedelta


@pytest.mark.usefixtures("client")
class TestGetOrdersByClientIntegration:
    """🧪 Test de integración para GET /orders/client/<client_id>"""

    def test_create_and_get_orders_by_client(self, client):
        """✅ Debe crear una orden y luego recuperarla por client_id"""

        # Paso 1️⃣ Crear orden
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
        assert "message" in create_json
        assert "Orden creada exitosamente" in create_json["message"]
        assert "order" in create_json
        assert create_json["order"]["id_client"] == "CLIENT-123"

        # Paso 2️⃣ Consultar por cliente
        get_response = client.get("/client/CLIENT-123", headers={"Authorization": "Bearer fake_token"})
        get_json = get_response.get_json()

        logging.info("📦 Get Orders by Client Response: %s", get_json)

        # ✅ Validaciones
        assert get_response.status_code == 200
        assert isinstance(get_json, list)
        assert len(get_json) >= 1
        assert any(order["id_client"] == "CLIENT-123" for order in get_json)


    def test_get_orders_by_client_invalid_client(self, client):
        """🚫 Debe retornar 200 con lista vacía si el cliente no tiene órdenes"""
        response = client.get("/client/CLIENT-NOEXISTE", headers={"Authorization": "Bearer fake_token"})
        json_data = response.get_json()

        logging.info("🚫 Get Orders by Client (no results): %s", json_data)

        assert response.status_code == 200
        assert isinstance(json_data, list)
        assert len(json_data) == 0
