import pytest
from unittest.mock import MagicMock, patch
from src.commands.get_orders_by_client import GetOrdersByClient
from src.errors.errors import ParamError, ApiError


class TestGetOrdersByClientCommand:
    # ✅ Caso exitoso
    @patch("src.commands.get_orders_by_client.OrderModel")
    def test_execute_retorna_ordenes_para_cliente(self, mock_order_model):
        """✅ Debe retornar la lista de órdenes asociadas a un cliente"""
        mock_order_model.get_by_client.return_value = [
            {"id": "ORDER-001", "id_client": "CLIENT-123"},
            {"id": "ORDER-002", "id_client": "CLIENT-123"},
        ]

        command = GetOrdersByClient("CLIENT-123")
        result = command.execute()

        # ✅ Verificaciones
        assert isinstance(result, list)
        assert len(result) == 2
        assert result[0]["id"] == "ORDER-001"
        assert all(order["id_client"] == "CLIENT-123" for order in result)

        mock_order_model.get_by_client.assert_called_once_with("CLIENT-123")

    # ⚠️ Caso: client_id vacío
    def test_execute_sin_client_id(self):
        """⚠️ Debe lanzar ParamError si el parámetro client_id está vacío"""
        command = GetOrdersByClient(None)

        with pytest.raises(ParamError, match="client_id"):
            command.execute()

    # ⚠️ Caso: client_id con espacios en blanco
    def test_execute_client_id_en_blanco(self):
        """⚠️ Debe lanzar ParamError si el parámetro tiene solo espacios"""
        command = GetOrdersByClient("   ")

        with pytest.raises(ParamError, match="client_id"):
            command.execute()

    # ❌ Caso: error inesperado en el modelo
    @patch("src.commands.get_orders_by_client.OrderModel")
    def test_execute_error_interno(self, mock_order_model):
        """❌ Debe capturar excepciones inesperadas y lanzar ApiError"""
        mock_order_model.get_by_client.side_effect = Exception("Falla en DynamoDB")

        command = GetOrdersByClient("CLIENT-500")

        with pytest.raises(ApiError, match="Error al obtener órdenes por cliente"):
            command.execute()

        mock_order_model.get_by_client.assert_called_once_with("CLIENT-500")
