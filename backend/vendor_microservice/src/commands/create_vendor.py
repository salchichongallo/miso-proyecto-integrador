import logging
import datetime
from .base_command import BaseCommannd
from ..errors.errors import ParamError, ApiError
from ..models.vendor import VendorModel

logger = logging.getLogger(__name__)


class CreateVendor(BaseCommannd):
    """
    Crea un nuevo vendedor en la base de datos DynamoDB.
    """

    def __init__(self, body: dict):
        self.body = body

    def execute(self):
        try:
            logger.info("🚀 Creando nuevo vendedor...")

            # ✅ Validaciones básicas de negocio
            name = self.body.get("name", "").strip()
            email = self.body.get("email", "").strip().lower()
            institutions = self.body.get("institutions", [])

            if not name or not email:
                raise ParamError("El nombre y el correo son obligatorios.")

            if not isinstance(institutions, list):
                raise ParamError("El campo 'institutions' debe ser una lista.")

            if len(institutions) > 30:
                raise ParamError("No se pueden asignar más de 30 instituciones por vendedor.")

            # Verificar si el email ya existe
            existing_vendor = VendorModel.find_existing_vendor(email)
            if existing_vendor:
                raise ParamError("El correo electrónico ya está registrado.")

            # Crear registro
            vendor = VendorModel.create(
                name=name,
                email=email,
                institutions=institutions,
            )

            logger.info(f"✅ Vendedor creado correctamente: {vendor.email}")

            return {
                "message": "Vendedor registrado exitosamente.",
                "vendor": vendor.to_dict()
            }

        except ParamError as e:
            raise e
        except Exception as e:
            logger.error(f"❌ Error al crear vendedor: {e}")
            raise ApiError(f"Error al crear vendedor: {str(e)}")
