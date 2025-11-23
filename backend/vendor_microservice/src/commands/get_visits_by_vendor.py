import logging
from .base_command import BaseCommannd
from ..errors.errors import ApiError, ParamError
from ..models.visit import VisitModel

logger = logging.getLogger(__name__)


class ListVisits(BaseCommannd):

    def __init__(self, vendor_id: str):
        self.vendor_id = vendor_id

    def execute(self):
        try:
            logger.info("🔍 Iniciando consulta de visitas por vendedor...")

            # Validación
            if not self.vendor_id:
                raise ParamError("vendor_id es obligatorio (token inválido).")

            # Consulta en DynamoDB
            visits = VisitModel.get_by_vendor(self.vendor_id)

            logger.info(f"📦 Se encontraron {len(visits)} visitas para el vendor {self.vendor_id}")

            return visits


        except ParamError:
            raise

        except Exception as e:
            logger.error(f"❌ Error al obtener visitas: {e}")
            raise ApiError(f"Error al obtener visitas: {str(e)}")
