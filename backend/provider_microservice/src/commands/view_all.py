import boto3
import os
from botocore.exceptions import ClientError
from .base_command import BaseCommannd
from ..errors.errors import ApiError

# 🌍 Variables de entorno
REGION = os.getenv("AWS_REGION", "us-east-1")
TABLE_NAME = "Providers"
DYNAMODB_ENDPOINT = os.getenv("DYNAMODB_ENDPOINT")


class GetAllProviders(BaseCommannd):
    """Comando para obtener todos los proveedores registrados en el sistema."""

    def __init__(self):
        # 🧩 Conexión a DynamoDB (local o real según entorno)
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
        """Ejecuta la obtención de todos los proveedores."""
        return self.fetch_all()

    def fetch_all(self):
        """Obtiene todos los proveedores registrados (con manejo de paginación)."""
        try:
            response = self.table.scan()
            items = response.get("Items", [])

            # 🔁 Si hay más de 1MB de datos, continuar escaneando
            while "LastEvaluatedKey" in response:
                response = self.table.scan(ExclusiveStartKey=response["LastEvaluatedKey"])
                items.extend(response.get("Items", []))

            # 🧾 Ordenar resultados por nombre
            items.sort(key=lambda p: p.get("name", "").lower())

            return items

        except ClientError as e:
            raise ApiError(f"Error al obtener la lista de proveedores: {e.response['Error']['Message']}")
