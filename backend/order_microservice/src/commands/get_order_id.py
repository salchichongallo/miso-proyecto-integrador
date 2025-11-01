import logging
from .base_command import BaseCommannd
from ..errors.errors import ApiError, ParamError
from ..models.order import OrderModel

logger = logging.getLogger(__name__)


class GetOrderById(BaseCommannd):
    """
    Obtiene una orden específica por su ID.
    """
    def __init__(self, order_id: str):
        self.order_id = order_id.strip() if order_id else None

    def execute(self):
        try:
            logger.info(f"🔎 Buscando orden con ID: {self.order_id}")

            if not self.order_id:
                raise ParamError("El parámetro 'order_id' es obligatorio.")

            order = OrderModel.find_existing_order(self.order_id)

            if not order:
                raise ParamError(f"No se encontró ninguna orden con el ID: {self.order_id}")

            logger.info(f"✅ Orden encontrada: {order.id}")

            return order.to_dict()

        except ParamError as e:
            raise e
        except Exception as e:
            logger.error(f"❌ Error al obtener la orden: {e}")
            raise ApiError(f"Error al obtener la orden: {str(e)}")
