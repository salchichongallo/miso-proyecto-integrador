import pytest
from unittest.mock import MagicMock, patch
from datetime import datetime, timedelta
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

        # Body simulado
        body = {
            "priority": "HIGH",
            "products": [
                {"id": "P-1001", "name": "Mouse", "amount": 2, "id_warehouse": "W-001"},
                {"id": "P-1002", "name": "Keyboard", "amount": 1, "id_warehouse": "W-002"}
            ],
            "country": "Mexico",
            "city": "Monterrey",
            "address": "Av. Constitución #1500",
            "date_estimated": (datetime.now() + timedelta(days=5)).date(),
            "id_client": "CLIENT-123",
            "id_vendor": "VENDOR-456"
        }

        # Ejecutar comando
        command = CreateOrder(body)
        result = command.execute()

        # ✅ Verificaciones
        assert "message" in result
        assert "exitosamente" in result["message"]
        assert "order" in result
        assert result["order"]["id"] == "ORDER-12345"

        # Verificar que se llamó OrderModel.create con el body
        mock_order_model.create.assert_called_once_with(**body)

    # 🚫 Error al crear la orden (excepción del modelo)
    @patch("src.commands.create_order.OrderModel")
    def test_execute_error_modelo(self, mock_order_model):
        """❌ Si OrderModel.create lanza excepción"""
        mock_order_model.create.side_effect = Exception("Falla en DynamoDB")

        body = {
            "priority": "HIGH",
            "products": [{"id": "P-1", "name": "Mouse", "amount": 1, "id_warehouse": "W-001"}],
            "country": "Mexico",
            "city": "Monterrey",
            "address": "Av. Constitución #1500",
            "date_estimated": (datetime.now() + timedelta(days=5)).date(),
            "id_client": "CLIENT-123",
            "id_vendor": "VENDOR-456"
        }

        command = CreateOrder(body)

        with pytest.raises(ApiError, match="Error al crear orden"):
            command.execute()

    # 🚫 Fecha estimada inválida (menor o igual a hoy)
    def test_validate_fecha_invalida(self):
        """❌ La fecha estimada debe ser posterior a la actual"""
        body = {
            "priority": "MEDIUM",
            "products": [{"id": "P-1", "name": "Mouse", "amount": 1, "id_warehouse": "W-001"}],
            "country": "Mexico",
            "city": "CDMX",
            "address": "Reforma 123",
            "date_estimated": datetime.now().date(),  # hoy (inválida)
            "id_client": "CLIENT-123",
            "id_vendor": "VENDOR-456"
        }

        # El schema validará que la fecha no esté vacía ni con formato erróneo
        # Pero esta validación específica (fecha > hoy) se haría a nivel de negocio si se implementa
        # Aquí solo se verifica que el esquema valide correctamente la estructura
        with pytest.raises(ParamError):
            NewOrderJsonSchema.check(body)

    # 🚫 Lista de productos vacía
    def test_validate_lista_productos_vacia(self):
        """❌ La lista de productos no puede estar vacía"""
        body = {
            "priority": "LOW",
            "products": [],
            "country": "Colombia",
            "city": "Bogotá",
            "address": "Calle 100 #10",
            "date_estimated": (datetime.now() + timedelta(days=3)).date(),
            "id_client": "CLIENT-001",
            "id_vendor": "VENDOR-002"
        }

        with pytest.raises(ParamError, match="no puede estar vacía"):
            NewOrderJsonSchema.check(body)

    # 🚫 Falta un campo obligatorio
    def test_validate_campo_obligatorio_faltante(self):
        """❌ Debe fallar si falta un campo obligatorio"""
        body = {
            "priority": "HIGH",
            "products": [{"id": "P-1", "name": "Mouse", "amount": 1, "id_warehouse": "W-001", "unit_price": 25.0}],
            # ❌ Falta 'country'
            "city": "Medellín",
            "address": "Cra 45 #12",
            "date_estimated": (datetime.now() + timedelta(days=7)).date(),
            "id_client": "CLIENT-1",
            "id_vendor": "VENDOR-1"
        }

        with pytest.raises(ParamError, match="El país es obligatorio"):
            NewOrderJsonSchema.check(body)

    # 🚫 Producto con campos inválidos
    def test_validate_producto_con_campos_invalidos(self):
        """❌ Debe fallar si un producto no tiene los campos requeridos"""
        body = {
            "priority": "HIGH",
            "products": [
                {"id": "P-1001", "amount": 2, "id_warehouse": "W-001", "unit_price": 150.0}  # ❌ Falta 'name'
            ],
            "country": "Mexico",
            "city": "Monterrey",
            "address": "Av. Constitución #1500",
            "date_estimated": (datetime.now() + timedelta(days=5)).date(),
            "id_client": "CLIENT-123",
            "id_vendor": "VENDOR-456"
        }

        with pytest.raises(ParamError, match="nombre"):
            NewOrderJsonSchema.check(body)
