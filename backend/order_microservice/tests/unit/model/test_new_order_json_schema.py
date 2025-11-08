import pytest
import datetime
from unittest.mock import patch, MagicMock
from src.models.order import OrderModel, OrderStatus, PriorityLevel


class TestOrderModel:
    """✅ Pruebas unitarias para el modelo OrderModel"""

    def build_valid_order_kwargs(self, **overrides):
        """Construye datos válidos de orden simulada"""
        base = {
            "priority": "HIGH",
            "id_client": "CLIENT-123",
            "id_vendor": "VENDOR-456",
            "country": "Colombia",
            "city": "Bogotá",
            "address": "Calle 100 #10-20",
            "date_estimated": "2025-11-10T00:00:00",
            "products": [
                {"id": "P-1001", "name": "Mouse óptico", "amount": 2, "id_warehouse": "W-001", "unit_price": 25.0},
                {"id": "P-2002", "name": "Teclado", "amount": 1, "id_warehouse": "W-002", "unit_price": 45.0}
            ]
        }
        base.update(overrides)
        return base

    # ✅ Test de creación exitosa
    @patch.object(OrderModel, "save")
    def test_create_order_generates_expected_fields(self, mock_save):
        """✅ Crea una orden correctamente con campos aleatorios"""
        data = self.build_valid_order_kwargs()

        order = OrderModel.create(**data)

        # Verificaciones básicas
        assert order.id is not None
        assert order.dispatch_warehouse is not None
        assert order.driver_name is not None
        assert order.delivery_vehicle is not None

        # Verifica fechas
        assert isinstance(order.date_estimated, datetime.datetime)
        assert isinstance(order.delivery_date, datetime.datetime)
        assert isinstance(order.created_at, datetime.datetime)
        assert order.delivery_date > order.created_at

        # save() debe haberse llamado una vez
        mock_save.assert_called_once()

    # ⚠️ Test cuando falta la fecha estimada
    def test_create_raises_error_on_invalid_date(self):
        """⚠️ Lanza error si date_estimated tiene formato inválido"""
        data = self.build_valid_order_kwargs(date_estimated="fecha-invalida")

        with pytest.raises(ValueError):
            OrderModel.create(**data)

    # 🧩 Test de to_dict()
    @patch.object(OrderModel, "save")
    def test_to_dict_returns_iso_dates(self, mock_save):
        """🧩 Convierte correctamente las fechas a ISO"""
        data = self.build_valid_order_kwargs()
        order = OrderModel.create(**data)
        result = order.to_dict()

        assert "created_at" in result
        assert "date_estimated" in result
        assert "delivery_date" in result
        assert result["created_at"].endswith("+00:00")
        assert "Calle" in result["address"]

    # 🧠 Test de find_existing_order (existe)
    @patch.object(OrderModel, "get")
    def test_find_existing_order_returns_object(self, mock_get):
        """🧠 Devuelve la orden si existe"""
        fake_order = MagicMock()
        mock_get.return_value = fake_order

        result = OrderModel.find_existing_order("ABC123")
        assert result == fake_order
        mock_get.assert_called_once_with(hash_key="ABC123")

    # ❌ Test de find_existing_order (no existe)
    @patch.object(OrderModel, "get", side_effect=OrderModel.DoesNotExist)
    def test_find_existing_order_returns_none_if_missing(self, mock_get):
        """❌ Devuelve None si la orden no existe"""
        result = OrderModel.find_existing_order("NOT_FOUND")
        assert result is None
        mock_get.assert_called_once()

    # 📦 Test de get_all (mock scan)
    @patch.object(OrderModel, "scan")
    def test_get_all_returns_list(self, mock_scan):
        """📦 Devuelve lista de órdenes desde scan()"""
        fake_order = MagicMock()
        fake_order.to_dict.return_value = {"id": "1", "priority": "HIGH"}
        mock_scan.return_value = [fake_order]

        result = OrderModel.get_all()
        assert isinstance(result, list)
        assert result[0]["id"] == "1"

    # 👥 Test de get_by_client
    @patch.object(OrderModel, "scan")
    def test_get_by_client_filters_results(self, mock_scan):
        """👥 Devuelve lista filtrada por cliente"""
        fake_order = MagicMock()
        fake_order.to_dict.return_value = {"id": "1", "id_client": "CLIENT-123"}
        mock_scan.return_value = [fake_order]

        result = OrderModel.get_by_client("CLIENT-123")
        assert result[0]["id_client"] == "CLIENT-123"
        mock_scan.assert_called_once()


# --- Extra: Validación de enums ---

def test_order_status_enum_values():
    """🧩 Enum OrderStatus contiene los valores esperados"""
    values = [s.value for s in OrderStatus]
    assert "PENDING" in values
    assert "DELIVERED" in values
    assert "CANCELLED" in values

def test_priority_level_enum_values():
    """🧩 Enum PriorityLevel contiene los valores esperados"""
    values = [p.value for p in PriorityLevel]
    assert values == ["LOW", "MEDIUM", "HIGH"]
