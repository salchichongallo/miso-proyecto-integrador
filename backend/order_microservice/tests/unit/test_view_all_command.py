import pytest
from unittest.mock import MagicMock, patch
from src.commands.view_all import GetAllOrders
from src.errors.errors import ApiError


class TestGetAllOrdersCommand:
    # ✅ Caso exitoso: retorna lista de órdenes
    @patch("src.commands.view_all.OrderModel")
    def test_execute_retorna_lista_de_ordenes(self, mock_order_model):
        """✅ Debe retornar todas las órdenes convertidas en lista de diccionarios"""
        # Mock de objetos de orden simulados
        mock_order_1 = MagicMock()
        mock_order_1.to_dict.return_value = {
            "id": "ORDER-1",
            "priority": "HIGH",
            "status": "PENDING"
        }

        mock_order_2 = MagicMock()
        mock_order_2.to_dict.return_value = {
            "id": "ORDER-2",
            "priority": "LOW",
            "status": "DELIVERED"
        }

        # Simular el retorno de OrderModel.scan()
        mock_order_model.scan.return_value = [mock_order_1, mock_order_2]

        # Ejecutar comando
        command = GetAllOrders()
        result = command.execute()

        # ✅ Verificaciones
        assert isinstance(result, list)
        assert len(result) == 2
        assert result[0]["id"] == "ORDER-1"
        assert result[1]["status"] == "DELIVERED"

        # Verificar que se haya llamado scan()
        mock_order_model.scan.assert_called_once()

    # 🚫 Caso: excepción en el modelo (por ejemplo, error en DynamoDB)
    @patch("src.commands.view_all.OrderModel")
    def test_execute_error_en_modelo(self, mock_order_model):
        """❌ Debe lanzar ApiError si OrderModel.scan lanza una excepción"""
        mock_order_model.scan.side_effect = Exception("Falla en DynamoDB")

        command = GetAllOrders()

        with pytest.raises(ApiError, match="Error al obtener órdenes"):
            command.execute()
