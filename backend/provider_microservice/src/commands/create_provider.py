import logging
import hashlib
from .base_command import BaseCommannd
from ..models.provider import ProviderModel, NewProviderSchema
from ..errors.errors import ParamError, ApiError
from ..utils.user_requests import create_user

logger = logging.getLogger(__name__)


class CreateProvider(BaseCommannd):

    def __init__(self, body: dict):
        self.body = body

    def execute(self):
        try:
            logger.info("Creando nuevo proveedor...")

            # 1. Validar con schema
            NewProviderSchema.check(self.body)

            nit = self.body["nit"].strip()
            name = self.body["name"].strip()
            country = self.body["country"].strip().upper()
            address = self.body["address"].strip()
            email = self.body["email"].strip().lower()
            phone = self.body["phone"].strip()

            # Validamos que el email no exista en la db
            existing_email = ProviderModel.find_by_email(email)
            if existing_email:
                raise ParamError("El correo electrónico ya está registrado.")

            # 2. Crear usuario Cognito
            user = create_user(email=email)
            provider_id = user.get("cognito_id")

            # 3. Cifrar NIT
            nit_encrypted = hashlib.sha256(nit.encode()).hexdigest()

            # 4. Guardar en DynamoDB
            provider = ProviderModel.create(
                nit=nit,
                nit_encrypted=nit_encrypted,
                provider_id=provider_id,
                name=name,
                country=country,
                address=address,
                email=email,
                phone=phone,
            )

            return provider.to_dict()

        except ParamError:
            raise
        except Exception as e:
            logger.error(f"Error creando proveedor: {e}")
            raise ApiError(str(e))
