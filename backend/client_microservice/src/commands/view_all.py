import boto3
import os
from botocore.exceptions import ClientError
from .base_command import BaseCommannd
from ..errors.errors import ApiError

REGION = os.getenv("AWS_REGION", "us-east-1")
TABLE_NAME = os.getenv("CLIENTS_TABLE_NAME", "Clients")


class GetAllClients(BaseCommannd):
    """Comando para obtener todos los clientes institucionales registrados."""

    def __init__(self):
        # Inicializar conexión DynamoDB
        self.dynamodb = boto3.resource("dynamodb", region_name=REGION)
        self.table = self.dynamodb.Table(TABLE_NAME)

    def execute(self):
        """Ejecuta la obtención completa de clientes."""
        return self.fetch_all()

    def fetch_all(self):
        """Obtiene todos los clientes de la tabla (con paginación)."""
        try:
            response = self.table.scan()
            items = response.get("Items", [])

            # 🔁 Manejar paginación si hay más de 1 MB de resultados
            while "LastEvaluatedKey" in response:
                response = self.table.scan(ExclusiveStartKey=response["LastEvaluatedKey"])
                items.extend(response.get("Items", []))

            # 🧾 Ordenar por nombre del cliente
            items.sort(key=lambda c: c.get("name", "").lower())

            return items

        except ClientError as e:
            raise ApiError(f"Error al obtener la lista de clientes: {e.response['Error']['Message']}")
