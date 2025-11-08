import pytest
from unittest.mock import MagicMock, patch
from datetime import datetime, timedelta
from src.commands.create_order import CreateOrder
from src.errors.errors import ParamError, ApiError
from src.models.order import NewOrderJsonSchema


class TestCreateOrderCommand:
    # ✅ Caso exitoso: orden creada correctamente
    @patch("src.commands.create_order.OrderModel")
    def test_execute_crea_orden_exitosamente(self, mock_order_model):
        """✅ Debe crear una nueva orden correctamente"""
        # Mock de la instancia del modelo
        mock_order_instance = MagicMock()
        mock_order_model.create.return_value = mock_order_instance
        mock_order_instance.id = "ORDER-12345"
        mock_order_instance.to_dict.return_value = {
            "id": "ORDER-12345",
            "priority": "HIGH",
            "status": "PENDING"
        }

        # Body simulado (fecha en ISO)
        body = {
            "priority": "HIGH",
            "products": [
                {"id": "P-1001", "name": "Mouse", "amount": 2, "id_warehouse": "W-001", "unit_price": 20.5},
                {"id": "P-1002", "name": "Keyboard", "amount": 1, "id_warehouse": "W-002", "unit_price": 45.0}
            ],
            "country": "Mexico",
            "city": "Monterrey",
            "address": "Av. Constitución #1500",
            "date_estimated": (datetime.now() + timedelta(days=5)).date().isoformat(),
            "id_client": "CLIENT-123",
            "id_vendor": "VENDOR-456"
        }

        # Ejecutar comando
        command = CreateOrder(body)
        result = command.execute()

        # ✅ Verificaciones
        assert "message" in result
        assert "exitosamente" in result["message"].lower()
        assert "order" in result
        assert result["order"]["id"] == "ORDER-12345"

        # Verificar que se llamó OrderModel.create con los mismos argumentos
        mock_order_model.create.assert_called_once_with(**body)

    # 🚫 Error al crear la orden (excepción del modelo)
    @patch("src.commands.create_order.OrderModel")
    def test_execute_error_modelo(self, mock_order_model):
        """❌ Si OrderModel.create lanza excepción"""
        mock_order_model.create.side_effect = Exception("Falla en DynamoDB")

        body = {
            "priority": "HIGH",
            "products": [{"id": "P-1", "name": "Mouse", "amount": 1, "id_warehouse": "W-001", "unit_price": 25.0}],
            "country": "Mexico",
            "city": "Monterrey",
            "address": "Av. Constitución #1500",
            "date_estimated": (datetime.now() + timedelta(days=5)).date().isoformat(),
            "id_client": "CLIENT-123",
            "id_vendor": "VENDOR-456"
        }

        command = CreateOrder(body)

        with pytest.raises(ApiError, match="Error al crear orden"):
            command.execute()
