import boto3
import os
from botocore.exceptions import ClientError
from .base_command import BaseCommannd
from ..errors.errors import ApiError

REGION = os.getenv("AWS_REGION", "us-east-1")
TABLE_NAME = os.getenv("VENDORS_TABLE_NAME", "Vendors")


class GetAllVendors(BaseCommannd):

    def __init__(self):
        # Inicializar conexión DynamoDB
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

            return {"vendors": items}

        except ClientError as e:
            raise ApiError(f"Error al obtener la lista de vendedores: {e.response['Error']['Message']}")
