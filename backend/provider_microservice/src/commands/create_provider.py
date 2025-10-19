import boto3
import uuid
import re
import hashlib
import logging
from botocore.exceptions import ClientError
from .base_command import BaseCommannd
from ..errors.errors import ParamError, ApiError
from ..models.db import REGION, DYNAMODB_ENDPOINT, TABLE_NAME


# 🧩 Configuración del logger
logger = logging.getLogger(__name__)


class CreateProvider(BaseCommannd):
    """
    Comando para registrar un proveedor validando NIT único (10 dígitos),
    email y teléfono, según la historia de usuario MS-34.
    """

    def __init__(self, name: str, country: str, nit: str, address: str, email: str, phone: str):
        self.name = name.strip() if name else None
        self.country = country.strip().upper() if country else None
        self.nit = nit.strip() if nit else None
        self.address = address.strip() if address else None
        self.email = email.strip().lower() if email else None
        self.phone = phone.strip() if phone else None
        self.provider_id = None
        self.nit_encrypted = None

        # 🔗 Conexión a DynamoDB
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
        """Ejecuta la validación, creación y guardado del proveedor."""
        logger.info(f"🧾 Iniciando creación del proveedor: {self.name}")
        self.validate()
        self.provider_id = str(uuid.uuid4())
        self.encrypt_nit()
        self.save()
        return self.response()

    # ----------------------------------------------------------
    def validate(self):
        """Valida campos requeridos y existencia del proveedor."""
        logger.debug("🔍 Validando información del proveedor...")

        # Campos obligatorios
        if not all([self.name, self.country, self.nit, self.email, self.phone]):
            raise ParamError("Todos los campos obligatorios (nombre, país, NIT, email y teléfono) deben estar diligenciados.")

        # Validar formato del NIT (exactamente 10 dígitos)
        if not re.match(r"^\d{10}$", self.nit):
            raise ParamError("El NIT debe contener exactamente 10 dígitos numéricos.")

        # Validar formato del email
        email_pattern = r"^[\w\.-]+@[\w\.-]+\.\w+$"
        if not re.match(email_pattern, self.email):
            raise ParamError("El formato del email es inválido.")

        # Validar formato del teléfono (exactamente 10 dígitos)
        if not re.match(r"^\d{10}$", self.phone):
            raise ParamError("El teléfono debe contener exactamente 10 dígitos numéricos.")

        # Verificar si ya existe el NIT
        try:
            existing = self.table.get_item(Key={"nit": self.nit})
            if "Item" in existing:
                raise ParamError("El proveedor con este NIT ya está registrado.")
        except ClientError as e:
            logger.error(f"❌ Error al verificar duplicado: {e}")
            raise ApiError(f"Error al verificar duplicado: {e.response['Error']['Message']}")

    # ----------------------------------------------------------
    def encrypt_nit(self):
        """Cifra el NIT usando SHA-256 para almacenamiento seguro."""
        self.nit_encrypted = hashlib.sha256(self.nit.encode()).hexdigest()
        logger.debug(f"🔒 NIT cifrado para {self.nit}")

    # ----------------------------------------------------------
    def save(self):
        """Guarda el nuevo proveedor en DynamoDB."""
        item = {
            "nit": self.nit,
            "nit_encrypted": self.nit_encrypted,
            "provider_id": self.provider_id,
            "name": self.name,
            "country": self.country,
            "address": self.address,
            "email": self.email,
            "phone": self.phone
        }

        try:
            self.table.put_item(Item=item)
            logger.info(f"✅ Proveedor {self.name} ({self.nit}) registrado correctamente.")
        except ClientError as e:
            logger.error(f"❌ Error al registrar proveedor: {e}")
            raise ApiError(f"Error al registrar proveedor: {e.response['Error']['Message']}")

    # ----------------------------------------------------------
    def response(self):
        """Construye la respuesta final del comando."""
        logger.info(f"📦 Proveedor creado exitosamente: {self.provider_id}")
        return {
            "provider_id": self.provider_id,
            "nit": self.nit,
            "name": self.name,
            "country": self.country,
            "address": self.address,
            "email": self.email,
            "phone": self.phone,
            "message": "Proveedor registrado exitosamente"
        }
