import logging
from .base_command import BaseCommannd
from ..errors.errors import ApiError
from ..models.vendor import VendorModel

logger = logging.getLogger(__name__)


class GetAllVendors(BaseCommannd):
    """
    Obtiene todos los vendedores almacenados en DynamoDB.
    """

    def execute(self):
        try:
            logger.info("📦 Obteniendo lista de vendedores...")

            # Llamada directa al modelo
            vendors = VendorModel.get_all()

            logger.info(f"✅ Total de vendedores obtenidos: {len(vendors)}")

            # Opcional: ordenar por nombre o email antes de devolverlos
            vendors.sort(key=lambda v: v.get("name", "").lower())

            return vendors

        except Exception as e:
            logger.error(f"❌ Error al obtener vendedores: {e}")
            raise ApiError(f"Error al obtener la lista de vendedores: {str(e)}")
