import logging
from .base_command import BaseCommannd
from ..models.provider import ProviderModel
from ..errors.errors import ApiError

logger = logging.getLogger(__name__)


class GetAllProviders(BaseCommannd):
    """
    Comando para obtener todos los proveedores registrados
    usando el modelo ProviderModel (PynamoDB).
    """

    def execute(self):
        try:
            logger.info("Obteniendo todos los proveedores...")

            providers = ProviderModel.get_all()

            return providers

        except Exception as e:
            logger.error(f"Error al obtener proveedores: {e}")
            raise ApiError(f"Error al obtener la lista de proveedores: {str(e)}")
