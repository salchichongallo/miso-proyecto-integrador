import boto3
import uuid
import os
from botocore.exceptions import ClientError
from .base_command import BaseCommannd
from ..errors.errors import ParamError, ApiError

REGION = os.getenv("AWS_REGION", "us-east-1")
TABLE_NAME = os.getenv("VENDORS_TABLE_NAME", "Vendors")
DYNAMODB_ENDPOINT = os.getenv("DYNAMODB_ENDPOINT")


class CreateVendor(BaseCommannd):

    def __init__(self, name: str, email: str, institutions: list):
        self.name = name.strip() if name else None
        self.email = email.strip().lower() if email else None
        self.institutions = institutions or []
        self.vendor_id = None

        # 🧩 Inicializar conexión DynamoDB (local o real)
        if DYNAMODB_ENDPOINT:
            self.dynamodb = boto3.resource(
                "dynamodb",
                region_name=REGION,
                endpoint_url=DYNAMODB_ENDPOINT,
                aws_access_key_id="dummy",
                aws_secret_access_key="dummy"
            )
        else:
            self.dynamodb = boto3.resource("dynamodb", region_name=REGION)

        self.table = self.dynamodb.Table(TABLE_NAME)

    def execute(self):
        self.validate()
        self.vendor_id = str(uuid.uuid4())
        self.save()
        return {
            "vendor_id": self.vendor_id,
            "email": self.email,
            "name": self.name,
            "institutions": self.institutions,
        }

    def validate(self):
        if not self.name or not self.email:
            raise ParamError("El nombre y el correo son obligatorios.")

        if len(self.institutions) > 30:
            raise ParamError("No se pueden asignar más de 30 instituciones por vendedor.")

        # Verificar si el correo ya existe
        try:
            existing = self.table.get_item(Key={"email": self.email})
            if "Item" in existing:
                raise ParamError("El correo electrónico ya está registrado.")
        except ClientError as e:
            raise ApiError(f"Error al verificar duplicado: {e.response['Error']['Message']}")

    def save(self):
        item = {
            "vendor_id": self.vendor_id,
            "email": self.email,
            "name": self.name,
            "institutions": self.institutions,
        }

        try:
            self.table.put_item(Item=item)
        except ClientError as e:
            raise ApiError(f"Error al registrar vendedor: {e.response['Error']['Message']}")
