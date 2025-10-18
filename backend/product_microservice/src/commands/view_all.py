import boto3
from botocore.exceptions import ClientError
from .base_command import BaseCommannd
from ..errors.errors import ApiError
from ..models.db import DYNAMODB_ENDPOINT, REGION, TABLE_NAME


class GetAllProducts(BaseCommannd):
    """Comando para obtener todos los productos registrados."""

    def __init__(self):
        # 🔗 Conexión a DynamoDB
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
        """Ejecuta la consulta para obtener todos los productos."""
        return self.fetch_all()

    def fetch_all(self):
        """Obtiene todos los productos con manejo de paginación."""
        try:
            response = self.table.scan()
            items = response.get("Items", [])

            # 🔁 Si hay más de 1 MB, continuar escaneando
            while "LastEvaluatedKey" in response:
                response = self.table.scan(ExclusiveStartKey=response["LastEvaluatedKey"])
                items.extend(response.get("Items", []))

            # 🧾 Ordenar por nombre
            items.sort(key=lambda p: p.get("name", "").lower())

            return items

        except ClientError as e:
            raise ApiError(f"Error al obtener la lista de productos: {e.response['Error']['Message']}")
