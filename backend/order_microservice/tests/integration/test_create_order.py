import pytest
import logging
from datetime import date, timedelta
from unittest.mock import patch
from src.errors.errors import ApiError


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
class TestCreateOrderIntegration:
    """🧪 Test de integración para la creación de órdenes"""

    @patch("src.blueprints.orders.current_cognito_jwt", new=FakeJWT())
    def test_successful_order_creation(self, client):
        """✅ Debe crear una orden exitosamente y devolver 201"""
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
            "id_vendor": "VENDOR-456"
        }

        response = client.post("/", json=payload)
        json_data = response.get_json()

        logging.info("Response JSON: %s", json_data)

        assert response.status_code == 201
        assert "message" in json_data
        assert "Orden creada exitosamente" in json_data["message"]

    @patch("src.blueprints.orders.current_cognito_jwt", new=FakeJWT())
    def test_missing_required_field(self, client):
        """❌ Debe retornar 400 si falta un campo obligatorio"""
        payload = {
            "priority": "HIGH",
            "products": [
                {"id": "P-1001", "name": "Mouse", "amount": 1, "id_warehouse": "W-001", "unit_price": 25.0}
            ],
            # Falta 'country'
            "city": "CDMX",
            "address": "Reforma 123",
            "date_estimated": (date.today() + timedelta(days=5)).isoformat(),
            "id_client": "CLIENT-123",
            "id_vendor": "VENDOR-456"
        }

        response = client.post("/", json=payload)
        json_data = response.get_json()

        logging.info("Response JSON (error): %s", json_data)

        assert response.status_code == 400
        assert "error" in json_data

    @patch("src.blueprints.orders.current_cognito_jwt", new=FakeJWT())
    @patch("src.commands.create_order.CreateOrder.execute")
    def test_create_order_api_error(self, mock_execute, client):
        """❌ Debe devolver 500 si ocurre un ApiError en el comando"""
        mock_execute.side_effect = ApiError("Error en DynamoDB")

        payload = {
            "priority": "HIGH",
            "products": [
                {"id": "P-1", "name": "Mouse", "amount": 1, "id_warehouse": "W-001", "unit_price": 25.0}
            ],
            "country": "Mexico",
            "city": "CDMX",
            "address": "Reforma 123",
            "date_estimated": (date.today() + timedelta(days=3)).isoformat(),
            "id_client": "CLIENT-123",
            "id_vendor": "VENDOR-456"
        }

        response = client.post("/", json=payload)
        json_data = response.get_json()

        assert response.status_code == 500
        assert "error" in json_data
        assert "Error en DynamoDB" in json_data["error"]

    @patch("src.blueprints.orders.current_cognito_jwt", new=FakeJWT())
    @patch("src.commands.create_order.CreateOrder.execute")
    def test_create_order_unexpected_exception(self, mock_execute, client):
        """❌ Debe devolver 500 si ocurre una excepción inesperada"""
        mock_execute.side_effect = Exception("Error inesperado")

        payload = {
            "priority": "LOW",
            "products": [
                {"id": "P-2", "name": "Teclado", "amount": 2, "id_warehouse": "W-003", "unit_price": 45.0}
            ],
            "country": "Colombia",
            "city": "Bogotá",
            "address": "Cra 100 #20-50",
            "date_estimated": (date.today() + timedelta(days=2)).isoformat(),
            "id_client": "CLIENT-123",
            "id_vendor": "VENDOR-456"
        }

        response = client.post("/", json=payload)
        json_data = response.get_json()

        assert response.status_code == 500
        assert "error" in json_data
        assert "Error inesperado" in json_data["error"]
