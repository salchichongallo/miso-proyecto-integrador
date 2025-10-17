import boto3
import os
import logging
from botocore.exceptions import ClientError

# 🧩 Configuración del logger
logger = logging.getLogger(__name__)

REGION = os.getenv("AWS_REGION", "us-east-1")
TABLE_NAME = "Vendors"
DYNAMODB_ENDPOINT = os.getenv("DYNAMODB_ENDPOINT")

def init_db():
    """
    Inicializa la conexión a DynamoDB y crea la tabla Vendors si no existe.
    Usa un endpoint local si está definido en las variables de entorno.
    """
    # 🧩 Usa endpoint local si está definido
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
                {"AttributeName": "email", "AttributeType": "S"}
            ],
            KeySchema=[
                {"AttributeName": "email", "KeyType": "HASH"}
            ],
            ProvisionedThroughput={
                "ReadCapacityUnits": 5,
                "WriteCapacityUnits": 5
            }
        )

        waiter = dynamodb.get_waiter("table_exists")
        waiter.wait(TableName=TABLE_NAME)
        logger.info(f"✅ Tabla {TABLE_NAME} creada exitosamente en {REGION}.")

    except ClientError as e:
        logger.error(f"❌ Error al crear la tabla: {e}")
