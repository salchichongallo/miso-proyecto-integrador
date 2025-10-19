import boto3
import os
import logging

# 🧩 Configuración del logger
logger = logging.getLogger(__name__)

REGION = os.getenv("AWS_REGION", "us-east-1")
TABLE_NAME = os.getenv("DYNAMODB_TABLE", "Vendors")
PK_NAME = "email"
DYNAMODB_ENDPOINT = os.getenv("DYNAMODB_ENDPOINT")


def init_db():
    # 💡 Si se define un endpoint local, usamos credenciales dummy
    if DYNAMODB_ENDPOINT:
        logger.info(f"🔗 Conectando a DynamoDB local en {DYNAMODB_ENDPOINT}")
        dynamodb = boto3.client(
            "dynamodb",
            region_name=REGION,
            endpoint_url=DYNAMODB_ENDPOINT,
            aws_access_key_id="dummy",
            aws_secret_access_key="dummy"
        )
    else:
        logger.info(f"🌍 Conectando a DynamoDB real en AWS región {REGION}")
        dynamodb = boto3.client("dynamodb", region_name=REGION)

    existing_tables = dynamodb.list_tables().get("TableNames", [])
    if TABLE_NAME not in existing_tables:
        raise Exception(f"La tabla \"{TABLE_NAME}\" no existe")
