import pytest
from unittest.mock import MagicMock, patch
from datetime import datetime, timezone
from src.models.order import OrderModel


class TestFindExistingOrder:
    """🧪 Pruebas unitarias para find_existing_order()"""

    @patch.object(OrderModel, "get")
    def test_should_find_order_by_id(self, mock_get):
        """✅ Debe devolver una orden existente"""
        mock_order = MagicMock()
        mock_order.id = "ORDER-123"
        mock_get.return_value = mock_order

        result = OrderModel.find_existing_order("ORDER-123")

        mock_get.assert_called_once_with(hash_key="ORDER-123")
        assert result.id == "ORDER-123"

    @patch.object(OrderModel, "get", side_effect=OrderModel.DoesNotExist)
    def test_should_return_none_if_not_found(self, mock_get):
        """❌ Debe retornar None si la orden no existe"""
        result = OrderModel.find_existing_order("ORDER-NO-EXISTE")
        mock_get.assert_called_once_with(hash_key="ORDER-NO-EXISTE")
        assert result is None


class TestGetAllOrders:
    """🧪 Pruebas unitarias para get_all()"""

    @patch.object(OrderModel, "scan")
    def test_should_return_list_of_orders(self, mock_scan):
        """✅ Debe devolver lista de órdenes en formato dict"""
        mock_order1 = MagicMock()
        mock_order1.to_dict.return_value = {"id": "ORDER-1", "priority": "HIGH"}
        mock_order2 = MagicMock()
        mock_order2.to_dict.return_value = {"id": "ORDER-2", "priority": "LOW"}
        mock_scan.return_value = [mock_order1, mock_order2]

        result = OrderModel.get_all()

        mock_scan.assert_called_once()
        assert isinstance(result, list)
        assert len(result) == 2
        assert result[0]["id"] == "ORDER-1"

    @patch.object(OrderModel, "scan", side_effect=Exception("DB Error"))
    def test_should_raise_exception_on_failure(self, mock_scan):
        """❌ Debe lanzar excepción si scan falla"""
        with pytest.raises(Exception, match="Error retrieving orders"):
            OrderModel.get_all()


class TestCreateOrder:
    """🧪 Pruebas unitarias para create()"""

    @patch.object(OrderModel, "save")
    def test_should_create_order_correctly(self, mock_save):
        """✅ Debe crear una orden y asignar campos automáticos"""
        order = OrderModel.create(
            priority="HIGH",
            products=[{"id": "P1", "name": "Mouse", "amount": 1, "id_warehouse": "W-001"}],
            id_client="CLIENT-1",
            id_vendor="VENDOR-1",
            country="Mexico",
            city="Monterrey",
            address="Av. Constitución 1000",
            date_estimated="2025-11-05",
        )

        # ✅ Verificar que se haya generado un UUID
        assert order.id is not None
        assert isinstance(order.id, str)
        assert order.created_at is not None
        assert order.updated_at is not None
        assert order.priority == "HIGH"

        mock_save.assert_called_once()

    @patch.object(OrderModel, "save", side_effect=Exception("Error DynamoDB"))
    def test_should_raise_exception_if_save_fails(self, mock_save):
        """❌ Debe propagar error si save falla"""
        with pytest.raises(Exception):
            OrderModel.create(priority="HIGH")


class TestToDict:
    """🧪 Pruebas unitarias para el método to_dict() del modelo OrderModel"""

    def test_should_convert_order_to_dict(self):
        """✅ Debe convertir correctamente una instancia a diccionario"""
        # Crear instancia de orden simulada
        order = OrderModel(
            id="ORDER-999",
            priority="HIGH",
            products=[{"id": "P1", "name": "Mouse", "amount": 2, "id_warehouse": "W-001"}],
            id_client="CLIENT-X",
            id_vendor="VENDOR-X",
            country="Colombia",
            city="Bogotá",
            address="Calle 100 #10-20",
            date_estimated=datetime(2025, 11, 5, tzinfo=timezone.utc),
            order_status="PENDING",
        )

        # Asignar timestamps
        now = datetime.now(timezone.utc)
        order.created_at = now
        order.updated_at = now

        # Ejecutar
        result = order.to_dict()

        # ✅ Verificaciones
        assert result["id"] == "ORDER-999"
        assert result["priority"] == "HIGH"
        assert result["id_client"] == "CLIENT-X"
        assert result["id_vendor"] == "VENDOR-X"
        assert result["country"] == "Colombia"
        assert result["city"] == "Bogotá"
        assert result["address"] == "Calle 100 #10-20"
        assert result["order_status"] == "PENDING"
        assert result["products"][0]["name"] == "Mouse"

        # Verificar fechas en formato ISO
        assert "T" in result["created_at"]
        assert "T" in result["updated_at"]
        assert result["created_at"].endswith("+00:00")
        assert result["updated_at"].endswith("+00:00")
