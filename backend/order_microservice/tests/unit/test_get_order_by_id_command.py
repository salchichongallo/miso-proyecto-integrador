import pytest
from unittest.mock import MagicMock, patch
from src.commands.get_order_id import GetOrderById
from src.errors.errors import ParamError, ApiError


class TestGetOrderByIdCommand:
    # ✅ Caso exitoso: encuentra la orden
    @patch("src.commands.get_order_id.OrderModel")
    def test_execute_devuelve_orden_correctamente(self, mock_order_model):
        """✅ Debe retornar una orden existente correctamente"""
        # Mock de la orden encontrada
        mock_order_instance = MagicMock()
        mock_order_instance.id = "ORDER-123"
        mock_order_instance.to_dict.return_value = {
            "id": "ORDER-123",
            "priority": "HIGH",
            "status": "PENDING"
        }

        mock_order_model.find_existing_order.return_value = mock_order_instance

        # Ejecutar comando
        command = GetOrderById("ORDER-123")
        result = command.execute()

        # ✅ Verificaciones
        assert result["id"] == "ORDER-123"
        assert result["status"] == "PENDING"

        # Verifica que se llamó al modelo con el ID correcto
        mock_order_model.find_existing_order.assert_called_once_with("ORDER-123")

    # 🚫 Caso: parámetro vacío
    def test_execute_sin_order_id(self):
        """❌ Debe lanzar ParamError si no se proporciona un ID"""
        command = GetOrderById(None)
        with pytest.raises(ParamError, match="order_id"):
            command.execute()

    # 🚫 Caso: orden no encontrada
    @patch("src.commands.get_order_id.OrderModel")
    def test_execute_orden_no_encontrada(self, mock_order_model):
        """❌ Debe lanzar ParamError si la orden no existe"""
        mock_order_model.find_existing_order.return_value = None

        command = GetOrderById("ORDER-999")

        with pytest.raises(ParamError, match="No se encontró ninguna orden"):
            command.execute()

        mock_order_model.find_existing_order.assert_called_once_with("ORDER-999")

    # 🚫 Caso: excepción inesperada (error de conexión o similar)
    @patch("src.commands.get_order_id.OrderModel")
    def test_execute_error_interno(self, mock_order_model):
        """❌ Debe capturar errores inesperados y lanzar ApiError"""
        mock_order_model.find_existing_order.side_effect = Exception("Falla en DynamoDB")

        command = GetOrderById("ORDER-ERROR")

        with pytest.raises(ApiError, match="Error al obtener la orden"):
            command.execute()

        mock_order_model.find_existing_order.assert_called_once_with("ORDER-ERROR")
