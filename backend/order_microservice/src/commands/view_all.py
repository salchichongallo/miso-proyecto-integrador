import logging
from .base_command import BaseCommannd
from ..errors.errors import ApiError
from ..models.order import OrderModel

logger = logging.getLogger(__name__)


class GetAllOrders(BaseCommannd):
    """
    Obtiene todas las órdenes almacenadas en DynamoDB.
    """

    def execute(self):
        try:
            logger.info("📦 Obteniendo todas las órdenes...")

            # Llama al método del modelo que escanea la tabla
            orders = OrderModel.scan()

            # Convierte cada objeto OrderModel a diccionario
            orders_list = [order.to_dict() for order in orders]

            logger.info(f"✅ Total de órdenes obtenidas: {len(orders_list)}")

            return orders_list

        except Exception as e:
            logger.error(f"❌ Error al obtener órdenes: {e}")
            raise ApiError(f"Error al obtener órdenes: {str(e)}")
