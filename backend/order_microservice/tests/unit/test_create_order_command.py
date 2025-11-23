import pytest
from unittest.mock import MagicMock, patch
from datetime import datetime, timedelta
from src.commands.create_order import CreateOrder
from src.errors.errors import ApiError


class TestCreateOrderCommand:
    @patch("src.commands.create_order.OrderModel")
    def test_execute_crea_orden_exitosamente_client(self, mock_order_model):
        """Debe crear una orden como CLIENT agregando id_client y vaciando id_vendor"""

        # Mock del modelo
        mock_order_instance = MagicMock()
        mock_order_instance.id = "ORDER-12345"
        mock_order_model.create.return_value = mock_order_instance

        # Body ORIGINAL SIN ids (como debe venir del request)
        body = {
            "priority": "HIGH",
            "products": [
                {"id": "P-1001", "name": "Mouse", "amount": 2,
                 "id_warehouse": "W-001", "unit_price": 20.5},
            ],
            "country": "Mexico",
            "city": "Monterrey",
            "address": "Av. Constitución #1500",
            "date_estimated": (datetime.now() + timedelta(days=5)).date(),
        }

        # Guardar body original ANTES de ser modificado por el comando
        original_body = body.copy()

        id_user = "USER-999"
        id_role = "client"

        # Ejecutar comando
        command = CreateOrder(body, id_user, id_role)
        result = command.execute()

        # Validaciones
        assert "message" in result
        assert "exitosamente" in result["message"].lower()

        # Construcción del body esperado
        expected_body = original_body.copy()
        expected_body["id_client"] = id_user
        expected_body["id_vendor"] = ""
        expected_body["date_estimated"] = original_body["date_estimated"].isoformat()

        # Verificación de llamada al modelo
        mock_order_model.create.assert_called_once_with(**expected_body)

    # ----------------------------------------------

    @patch("src.commands.create_order.OrderModel")
    def test_execute_crea_orden_exitosamente_vendor(self, mock_order_model):
        """Debe crear una orden como VENDOR agregando id_vendor"""

        mock_order_instance = MagicMock()
        mock_order_instance.id = "ORDER-98765"
        mock_order_model.create.return_value = mock_order_instance

        body = {
            "priority": "LOW",
            "products": [
                {"id": "P-10", "name": "Teclado", "amount": 1,
                 "id_warehouse": "W-001", "unit_price": 40},
            ],
            "country": "Colombia",
            "city": "Bogotá",
            "address": "Calle falsa 123",
            "date_estimated": (datetime.now() + timedelta(days=3)).date(),
        }

        # Guardar original para comparar después
        original_body = body.copy()

        id_user = "VEND-444"
        id_role = "vendor"

        command = CreateOrder(body, id_user, id_role)
        result = command.execute()

        assert "message" in result

        expected_body = original_body.copy()
        expected_body["id_vendor"] = id_user
        expected_body["date_estimated"] = original_body["date_estimated"].isoformat()

        mock_order_model.create.assert_called_once_with(**expected_body)

    # ----------------------------------------------

    @patch("src.commands.create_order.OrderModel")
    def test_execute_error_modelo(self, mock_order_model):
        """Debe envolver excepciones del modelo en ApiError"""

        mock_order_model.create.side_effect = Exception("Falla en DynamoDB")

        body = {
            "priority": "HIGH",
            "products": [{"id": "P-1", "name": "Mouse", "amount": 1,
                          "id_warehouse": "W-001", "unit_price": 25.0}],
            "country": "Mexico",
            "city": "Monterrey",
            "address": "Av. Constitución #1500",
            "date_estimated": (datetime.now() + timedelta(days=5)).date(),
        }

        command = CreateOrder(body, "USER-123", "client")

        with pytest.raises(ApiError, match="Error al crear orden"):
            command.execute()

    # ----------------------------------------------

    def test_execute_rol_no_autorizado(self):
        """Debe lanzar ApiError si el rol no es client ni vendor"""

        body = {
            "priority": "HIGH",
            "products": [],
            "country": "Mexico",
            "city": "CDMX",
            "address": "Calle falsa",
            "date_estimated": datetime.now().date(),
        }

        command = CreateOrder(body, "USER-1", "admin")

        with pytest.raises(ApiError, match="Rol no autorizado"):
            command.execute()
