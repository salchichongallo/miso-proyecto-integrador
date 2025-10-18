import boto3
from botocore.exceptions import ClientError
from .base_command import BaseCommannd
from ..errors.errors import ApiError
from ..models.db import REGION, TABLE_NAME, DYNAMODB_ENDPOINT


class GetAllClients(BaseCommannd):
    """Comando para obtener todos los clientes institucionales registrados."""

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
        """Ejecuta la obtención completa de clientes."""
        return self.fetch_all()

    def fetch_all(self):
        """Obtiene todos los clientes de la tabla (con paginación)."""
        try:
            response = self.table.scan()
            items = response.get("Items", [])

            # 🔁 Paginación en caso de más de 1MB de datos
            while "LastEvaluatedKey" in response:
                response = self.table.scan(ExclusiveStartKey=response["LastEvaluatedKey"])
                items.extend(response.get("Items", []))

            # 🧾 Ordenar resultados por nombre
            items.sort(key=lambda c: c.get("name", "").lower())

            return items

        except ClientError as e:
            raise ApiError(f"Error al obtener la lista de clientes: {e.response['Error']['Message']}")
