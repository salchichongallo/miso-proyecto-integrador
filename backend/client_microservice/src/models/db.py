import boto3
import os
import logging
from botocore.exceptions import ClientError

# 🧩 Configuración del logger
logger = logging.getLogger(__name__)

REGION = os.getenv("AWS_REGION", "us-east-1")
TABLE_NAME = "Clients"
DYNAMODB_ENDPOINT = os.getenv("DYNAMODB_ENDPOINT")


def init_db():
    """
    Inicializa la conexión a DynamoDB y crea la tabla Clients si no existe.
    Usa un endpoint local si está definido en las variables de entorno.
    """
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

    try:
        existing_tables = dynamodb.list_tables().get("TableNames", [])
        if TABLE_NAME in existing_tables:
            logger.info(f"ℹ️ La tabla {TABLE_NAME} ya existe.")
            return

        logger.info(f"🚀 Creando tabla {TABLE_NAME} en {REGION}...")
        dynamodb.create_table(
            TableName=TABLE_NAME,
            AttributeDefinitions=[
                {"AttributeName": "tax_id", "AttributeType": "S"}
            ],
            KeySchema=[
                {"AttributeName": "tax_id", "KeyType": "HASH"}
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
