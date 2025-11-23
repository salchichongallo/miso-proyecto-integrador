import logging
import os
import boto3
from .base_command import BaseCommannd
from ..errors.errors import ParamError, ApiError

logger = logging.getLogger(__name__)

ALLOWED_ROLES = {"admin", "vendor", "client", "provider"}

class CreateCognitoUser(BaseCommannd):

    def __init__(self, email, role):
        self.email = email.strip()
        self.role = role.strip().lower()

        self.client = boto3.client(
            "cognito-idp",
            region_name=os.getenv("AWS_REGION", "us-east-1"),
            aws_access_key_id=os.getenv("AWS_ACCESS_KEY_ID"),
            aws_secret_access_key=os.getenv("AWS_SECRET_ACCESS_KEY"),
        )

        self.user_pool_id = os.getenv("APP_COGNITO_USER_POOL_ID")


    def execute(self):
        logger.info(f"Creando usuario Cognito: {self.email}")
        self.validate()
        return self.create_user()


    def validate(self):
        if not self.email:
            raise ParamError("El email es obligatorio.")

        if "@" not in self.email:
            raise ParamError("El email no tiene un formato válido.")

        if not self.role:
            raise ParamError("El rol es obligatorio.")

        if self.role not in ALLOWED_ROLES:
            raise ParamError(f"El rol debe ser uno de: {', '.join(ALLOWED_ROLES)}")

        if not self.user_pool_id:
            raise ApiError("Falta configuración: APP_COGNITO_USER_POOL_ID")

    def create_user(self):
        try:
            # 1. Crear usuario SIN contraseña temporal
            response = self.client.admin_create_user(
                UserPoolId=self.user_pool_id,
                Username=self.email,
                MessageAction="SUPPRESS",
                UserAttributes=[
                    {"Name": "email_verified", "Value": "true"},
                    {"Name": "email", "Value": self.email},
                    {"Name": "custom:role", "Value": self.role},
                ],
            )

            cognito_id = response["User"]["Username"]

            # 2. Establecer contraseña permanente
            self.client.admin_set_user_password(
                UserPoolId=self.user_pool_id,
                Username=self.email,
                Password="secret123",
                Permanent=True
            )

            logger.info(f"✅ Usuario creado correctamente en Cognito: {self.email}")

            return {
                "message": "Usuario creado exitosamente",
                "email": self.email,
                "cognito_id": cognito_id,
                "role": self.role,
            }

        except self.client.exceptions.UsernameExistsException:
            raise ParamError("El usuario ya existe en Cognito.")

        except Exception as e:
            logger.error(f"❌ Error creando usuario Cognito: {e}")
            raise ApiError(f"Error al crear usuario Cognito: {str(e)}")
