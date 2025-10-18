import boto3
import os
import logging
from botocore.exceptions import ClientError

logger = logging.getLogger(__name__)

REGION = os.getenv("AWS_REGION", "us-east-1")
TABLE_NAME = "Products"
DYNAMODB_ENDPOINT = os.getenv("DYNAMODB_ENDPOINT")


def init_db():
    if DYNAMODB_ENDPOINT:
        dynamodb = boto3.client(
            "dynamodb",
            region_name=REGION,
            endpoint_url=DYNAMODB_ENDPOINT,
            aws_access_key_id="dummy",
            aws_secret_access_key="dummy"
        )
    else:
        dynamodb = boto3.client("dynamodb", region_name=REGION)

    try:
        existing_tables = dynamodb.list_tables().get("TableNames", [])
        if TABLE_NAME in existing_tables:
            logger.info(f"ℹ️ La tabla {TABLE_NAME} ya existe.")
            return

        logger.info(f"🚀 Creando tabla {TABLE_NAME} en {REGION}...")
        dynamodb.create_table(
            TableName=TABLE_NAME,
            AttributeDefinitions=[
                {"AttributeName": "sku", "AttributeType": "S"}
            ],
            KeySchema=[
                {"AttributeName": "sku", "KeyType": "HASH"}
            ],
            ProvisionedThroughput={
                "ReadCapacityUnits": 5,
                "WriteCapacityUnits": 5
            }
        )

        waiter = dynamodb.get_waiter("table_exists")
        waiter.wait(TableName=TABLE_NAME)
        logger.info(f"✅ Tabla {TABLE_NAME} creada exitosamente con clave primaria 'sku'.")

    except ClientError as e:
        logger.error(f"❌ Error al crear la tabla: {e}")
