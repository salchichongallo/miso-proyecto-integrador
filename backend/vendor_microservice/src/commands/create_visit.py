import logging
import datetime
from .base_command import BaseCommannd
from ..errors.errors import ParamError, ApiError
from ..models.visit import VisitModel, NewVisitJsonSchema

logger = logging.getLogger(__name__)


class CreateVisit(BaseCommannd):
    """
    Command: Crea un registro de visita comercial.
    """

    def __init__(self, body: dict, vendor_id: str):
        self.body = body
        self.vendor_id = vendor_id

    def execute(self):
        try:
            logger.info("📝 Iniciando creación de visita...")

            # Validar vendor_id
            if not self.vendor_id:
                raise ParamError("vendor_id es obligatorio (token inválido).")

            # Construcción del payload final
            payload = {
                "vendor_id": self.vendor_id,
                "client_id": self.body["client_id"],
                "contact_name": self.body["contact_name"],
                "contact_phone": self.body["contact_phone"],
                "visit_datetime": self.body["visit_datetime"],
                "observations": self.body.get("observations", ""),
                "bucket_data": self.body.get("bucket_data", []),
            }

            visit = VisitModel.create(**payload)

            logger.info(f"✅ Visita creada correctamente: {visit.visit_id}")

            return {
                "message": "Visita registrada exitosamente.",
                "visit": visit.to_dict()
            }

        except ParamError:
            raise

        except Exception as e:
            logger.error(f"❌ Error al crear visita: {e}")
            raise ApiError(f"Error al crear visita: {str(e)}")
