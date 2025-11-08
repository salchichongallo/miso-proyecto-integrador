import logging
from .base_command import BaseCommannd
from ..errors.errors import ApiError, ParamError
from ..models.order import OrderModel

logger = logging.getLogger(__name__)


class GetOrdersByClient(BaseCommannd):
    """
    Obtiene todas las órdenes asociadas a un `id_client`.
    """
    def __init__(self, client_id: str):
        self.client_id = client_id.strip() if client_id else None

    def execute(self):
        try:
            logger.info(f"🔎 Buscando órdenes para id_client: {self.client_id}")

            if not self.client_id:
                raise ParamError("El parámetro 'client_id' es obligatorio.")

            orders = OrderModel.get_by_client(self.client_id)

            logger.info(f"✅ Órdenes encontradas para client={self.client_id}: {len(orders)}")

            return orders

        except ParamError:
            raise
        except Exception as e:
            logger.error(f"❌ Error al obtener órdenes por cliente: {e}")
            raise ApiError(f"Error al obtener órdenes por cliente: {str(e)}")
