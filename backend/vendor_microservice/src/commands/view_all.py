import boto3
from botocore.exceptions import ClientError
from .base_command import BaseCommannd
from ..errors.errors import ApiError
from ..models.db import REGION, TABLE_NAME, DYNAMODB_ENDPOINT


class GetAllVendors(BaseCommannd):

    def __init__(self):
        # 💡 Inicializar conexión DynamoDB (modo local o AWS real)
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
        return self.fetch_all()

    def fetch_all(self):
        try:
            response = self.table.scan()
            items = response.get("Items", [])

            while "LastEvaluatedKey" in response:
                response = self.table.scan(ExclusiveStartKey=response["LastEvaluatedKey"])
                items.extend(response.get("Items", []))

            # 🧾 Ordenar por nombre o email, opcional
            items.sort(key=lambda v: v.get("name", "").lower())

            return items

        except ClientError as e:
            raise ApiError(f"Error al obtener la lista de vendedores: {e.response['Error']['Message']}")
