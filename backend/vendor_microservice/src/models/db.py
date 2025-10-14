import os
import boto3
from botocore.exceptions import ClientError

REGION = os.getenv("REGION", "us-east-1")
TABLE_NAME = "Vendors"

def init_db():
    dynamodb = boto3.client("dynamodb", region_name=REGION)

    try:
        existing_tables = dynamodb.list_tables()["TableNames"]
        if TABLE_NAME in existing_tables:
            print(f"ℹ️ La tabla {TABLE_NAME} ya existe.")
            return

        print(f"🚀 Creando tabla {TABLE_NAME} en {REGION}...")
        dynamodb.create_table(
            TableName=TABLE_NAME,
            AttributeDefinitions=[
                {"AttributeName": "vendor_id", "AttributeType": "S"},
                {"AttributeName": "email", "AttributeType": "S"},
            ],
            KeySchema=[
                {"AttributeName": "vendor_id", "KeyType": "HASH"},
            ],
            ProvisionedThroughput={
                "ReadCapacityUnits": 5,
                "WriteCapacityUnits": 5
            }
        )

        waiter = dynamodb.get_waiter("table_exists")
        waiter.wait(TableName=TABLE_NAME)
        print(f"✅ Tabla {TABLE_NAME} creada exitosamente en {REGION}.")

    except ClientError as e:
        print(f"❌ Error al crear la tabla: {e}")
