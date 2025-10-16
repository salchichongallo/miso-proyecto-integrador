import boto3
import uuid
import os
import re
import hashlib
from botocore.exceptions import ClientError
from .base_command import BaseCommannd
from ..errors.errors import ParamError, ApiError

REGION = os.getenv("AWS_REGION", "us-east-1")
TABLE_NAME = os.getenv("CLIENTS_TABLE_NAME", "Clients")


class CreateClient(BaseCommannd):
    """
    Comando para registrar un cliente institucional (hospital, clínica, laboratorio)
    con validación simulada del identificador tributario (tax_id) y cifrado básico.
    """

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
        self.dynamodb = boto3.resource("dynamodb", region_name=REGION)
        self.table = self.dynamodb.Table(TABLE_NAME)


    def execute(self):
        self.validate()
        self.client_id = str(uuid.uuid4())
        self.encrypt_tax_id()
        self.save()
        return self.response()


    def validate(self):
        """Valida campos requeridos y existencia del cliente."""
        if not all([self.name, self.tax_id, self.country, self.level, self.specialty, self.location]):
            raise ParamError("Todos los campos son obligatorios para registrar un cliente institucional.")

        # Validar formato del NIT/RUC según país (simulado)
        if self.country == "CO":  # 🇨🇴 Colombia: 9-10 dígitos
            if not re.match(r"^\d{9,10}$", self.tax_id):
                raise ParamError("NIT inválido: debe tener entre 9 y 10 dígitos.")
        elif self.country == "MX":  # 🇲🇽 México: RFC (mínimo 10, máximo 13 caracteres alfanuméricos)
            if not re.match(r"^[A-ZÑ&]{3,4}\d{6}[A-Z0-9]{3}$", self.tax_id, re.IGNORECASE):
                raise ParamError("RFC inválido: formato incorrecto.")
        else:
            # Simulación para otros países
            if len(self.tax_id) < 5:
                raise ParamError("Identificador tributario inválido.")

        # Verificar si ya existe el tax_id
        try:
            existing = self.table.get_item(Key={"tax_id": self.tax_id})
            if "Item" in existing:
                raise ParamError("El cliente institucional ya está registrado.")
        except ClientError as e:
            raise ApiError(f"Error al verificar duplicado: {e.response['Error']['Message']}")



    def encrypt_tax_id(self):
        """Simula el cifrado del identificador tributario usando SHA-256."""
        self.tax_id_encrypted = hashlib.sha256(self.tax_id.encode()).hexdigest()


    def save(self):
        """Guarda el nuevo cliente en DynamoDB."""
        item = {
            "tax_id": self.tax_id,  # valor original como clave
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
        except ClientError as e:
            raise ApiError(f"Error al registrar cliente: {e.response['Error']['Message']}")


    def response(self):
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
