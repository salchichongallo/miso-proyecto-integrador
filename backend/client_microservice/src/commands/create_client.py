import boto3
import uuid
import os
import re
import hashlib
import logging
from botocore.exceptions import ClientError
from .base_command import BaseCommannd
from ..errors.errors import ParamError, ApiError

logger = logging.getLogger(__name__)

REGION = os.getenv("AWS_REGION", "us-east-1")
TABLE_NAME = "Clients"
PK_NAME = "tax_id"
DYNAMODB_ENDPOINT = os.getenv("DYNAMODB_ENDPOINT")


class CreateClient(BaseCommannd):

    def __init__(self, name: str, tax_id: str, country: str, level: str, specialty: str, location: str):
        self.name = name.strip() if name else None
        self.tax_id = tax_id.strip() if tax_id else None
        self.country = country.strip().upper() if country else None
        self.level = level.strip().upper() if level else None
        self.specialty = specialty.strip() if specialty else None
        self.location = location.strip() if location else None
        self.client_id = None
        self.tax_id_encrypted = None

        # Inicializar conexión DynamoDB
        if DYNAMODB_ENDPOINT:
            logger.info(f"🔗 Conectando a DynamoDB local en {DYNAMODB_ENDPOINT}")
            self.dynamodb = boto3.resource(
                "dynamodb",
                region_name=REGION,
                endpoint_url=DYNAMODB_ENDPOINT,
                aws_access_key_id="dummy",
                aws_secret_access_key="dummy"
            )
        else:
            logger.info(f"🌍 Conectando a DynamoDB real en AWS región {REGION}")
            self.dynamodb = boto3.resource("dynamodb", region_name=REGION)

        self.table = self.dynamodb.Table(TABLE_NAME)

    # ----------------------------------------------------------
    def execute(self):
        """Ejecuta la validación, creación y guardado del cliente."""
        logger.info(f"🧾 Iniciando creación del cliente: {self.name}")
        self.validate()
        self.client_id = str(uuid.uuid4())
        self.encrypt_tax_id()
        self.save()
        return self.response()

    # ----------------------------------------------------------
    def validate(self):
        """Valida campos requeridos y existencia del cliente."""
        logger.debug("🔍 Validando información del cliente...")

        # Validar campos obligatorios
        if not all([self.name, self.tax_id, self.country, self.level, self.specialty, self.location]):
            raise ParamError("Todos los campos son obligatorios para registrar un cliente institucional.")

        # ✅ Validar que el tax_id tenga exactamente 10 dígitos numéricos
        if not re.match(r"^\d{10}$", self.tax_id):
            raise ParamError("El NIT debe contener exactamente 10 dígitos numéricos.")

        # Validar que no exista el tax_id en la base
        try:
            existing = self.table.get_item(Key={"tax_id": self.tax_id})
            if "Item" in existing:
                raise ParamError("El cliente institucional ya está registrado.")
        except ClientError as e:
            logger.error(f"❌ Error al verificar duplicado: {e}")
            raise ApiError(f"Error al verificar duplicado: {e.response['Error']['Message']}")

    # ----------------------------------------------------------
    def encrypt_tax_id(self):
        """Simula el cifrado del identificador tributario usando SHA-256."""
        self.tax_id_encrypted = hashlib.sha256(self.tax_id.encode()).hexdigest()
        logger.debug(f"🔒 Identificador tributario cifrado para {self.tax_id}")

    # ----------------------------------------------------------
    def save(self):
        """Guarda el nuevo cliente en DynamoDB."""
        item = {
            "tax_id": self.tax_id,
            "tax_id_encrypted": self.tax_id_encrypted,
            "client_id": self.client_id,
            "name": self.name,
            "country": self.country,
            "level": self.level,
            "specialty": self.specialty,
            "location": self.location,
        }

        try:
            self.table.put_item(Item=item)
            logger.info(f"✅ Cliente {self.name} ({self.tax_id}) registrado correctamente.")
        except ClientError as e:
            logger.error(f"❌ Error al registrar cliente: {e}")
            raise ApiError(f"Error al registrar cliente: {e.response['Error']['Message']}")

    # ----------------------------------------------------------
    def response(self):
        """Construye la respuesta final del comando."""
        logger.info(f"📦 Cliente creado exitosamente: {self.client_id}")
        return {
            "client_id": self.client_id,
            "tax_id": self.tax_id,
            "name": self.name,
            "country": self.country,
            "level": self.level,
            "specialty": self.specialty,
            "location": self.location,
            "message": "Cliente institucional registrado exitosamente"
        }
