import logging
import datetime
from .base_command import BaseCommannd
from ..errors.errors import ApiError
from ..models.order import OrderModel

logger = logging.getLogger(__name__)


class CreateOrder(BaseCommannd):
    """
    Crea una nueva orden en DynamoDB.
    """

    def __init__(self, body: dict):
        self.body = body

    def execute(self):
        """Crea la orden usando los datos ya validados."""
        try:
            logger.info("Creando nueva orden...")

            # Convertir la fecha si viene como objeto date
            if isinstance(self.body.get("date_estimated"), datetime.date):
                self.body["date_estimated"] = self.body["date_estimated"].isoformat()

            # Crear y guardar la orden
            order = OrderModel.create(**self.body)

            logger.info(f"✅ Orden creada correctamente: {order.id}")

            return {
                "message": "Orden creada exitosamente.",
                "order": order.to_dict()
            }

        except Exception as e:
            logger.error(f"Error al crear orden: {e}")
            raise ApiError(f"Error al crear orden: {str(e)}")
