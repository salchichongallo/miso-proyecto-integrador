#!/usr/bin/env python3
"""
Script de inicialización para DynamoDB
Crea todas las tablas necesarias para los microservicios
"""

import boto3
import os
import time
import logging
from botocore.exceptions import ClientError

# Configuración del logger
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(levelname)s - %(message)s'
)
logger = logging.getLogger(__name__)

# Configuración
REGION = os.getenv("AWS_REGION", "us-east-1")
DYNAMODB_ENDPOINT = os.getenv("DYNAMODB_ENDPOINT", "http://localhost:8000")

CLIENTS_TABLE = os.getenv("CLIENTS_TABLE", "Clients")
VENDORS_TABLE = os.getenv("VENDORS_TABLE", "Vendors")
PROVIDERS_TABLE = os.getenv("PROVIDERS_TABLE", "Providers")
PRODUCTS_TABLE = os.getenv("PRODUCTS_TABLE", "Products")
WAREHOUSES_TABLE = os.getenv("WAREHOUSES_TABLE", "Warehouses")
SALES_TABLE = os.getenv("SALES_TABLE", "Sales")
ORDERS_TABLE = os.getenv("ORDERS_TABLE", "Orders")
SALES_PLANS_TABLE = os.getenv("SALES_PLANS_TABLE", "SalesPlans")

# Definición de tablas
TABLES_CONFIG = {
    CLIENTS_TABLE: {
        "AttributeDefinitions": [
            {"AttributeName": "tax_id", "AttributeType": "S"}
        ],
        "KeySchema": [
            {"AttributeName": "tax_id", "KeyType": "HASH"}
        ],
        "ProvisionedThroughput": {
            "ReadCapacityUnits": 5,
            "WriteCapacityUnits": 5
        }
    },
    VENDORS_TABLE: {
        "AttributeDefinitions": [
            {"AttributeName": "email", "AttributeType": "S"}
        ],
        "KeySchema": [
            {"AttributeName": "email", "KeyType": "HASH"}
        ],
        "ProvisionedThroughput": {
            "ReadCapacityUnits": 5,
            "WriteCapacityUnits": 5
        }
    },
    PROVIDERS_TABLE: {
        "AttributeDefinitions": [
            {"AttributeName": "nit", "AttributeType": "S"}
        ],
        "KeySchema": [
            {"AttributeName": "nit", "KeyType": "HASH"}
        ],
        "ProvisionedThroughput": {
            "ReadCapacityUnits": 5,
            "WriteCapacityUnits": 5
        }
    },
    PRODUCTS_TABLE: {
        "AttributeDefinitions": [
            {"AttributeName": "warehouse", "AttributeType": "S"},
            {"AttributeName": "sku", "AttributeType": "S"}
        ],
        "KeySchema": [
            {"AttributeName": "warehouse", "KeyType": "HASH"},
            {"AttributeName": "sku", "KeyType": "RANGE"}
        ],
        "ProvisionedThroughput": {
            "ReadCapacityUnits": 5,
            "WriteCapacityUnits": 5
        }
    },
    WAREHOUSES_TABLE: {
        "AttributeDefinitions": [
            {"AttributeName": "id", "AttributeType": "S"}
        ],
        "KeySchema": [
            {"AttributeName": "id", "KeyType": "HASH"}
        ],
        "ProvisionedThroughput": {
            "ReadCapacityUnits": 5,
            "WriteCapacityUnits": 5
        }
    },
    SALES_TABLE: {
        "AttributeDefinitions": [
            {"AttributeName": "PK", "AttributeType": "S"}
        ],
        "KeySchema": [
            {"AttributeName": "PK", "KeyType": "HASH"}
        ],
        "ProvisionedThroughput": {
            "ReadCapacityUnits": 5,
            "WriteCapacityUnits": 5
        }
    }

    , ORDERS_TABLE: {
        "AttributeDefinitions": [
            {"AttributeName": "id", "AttributeType": "S"}
        ],
        "KeySchema": [
            {"AttributeName": "id", "KeyType": "HASH"}
        ],
        "ProvisionedThroughput": {
            "ReadCapacityUnits": 5,
            "WriteCapacityUnits": 5
        }
    },
    SALES_PLANS_TABLE: {
        "AttributeDefinitions": [
            {"AttributeName": "plan_id", "AttributeType": "S"}
        ],
        "KeySchema": [
            {"AttributeName": "plan_id", "KeyType": "HASH"}
        ],
        "ProvisionedThroughput": {
            "ReadCapacityUnits": 5,
            "WriteCapacityUnits": 5
        }
    }
}


def get_dynamodb_client():
    """Crea cliente de DynamoDB con configuración local"""
    return boto3.client(
        "dynamodb",
        region_name=REGION,
        endpoint_url=DYNAMODB_ENDPOINT,
        aws_access_key_id="dummy",
        aws_secret_access_key="dummy"
    )


def wait_for_dynamodb():
    """Espera a que DynamoDB esté disponible"""
    max_retries = 30
    retry_count = 0

    while retry_count < max_retries:
        try:
            dynamodb = get_dynamodb_client()
            dynamodb.list_tables()
            logger.info("✅ DynamoDB está disponible")
            return True
        except Exception as error:
            retry_count += 1
            logger.info(f"⏳ Esperando DynamoDB... intento {retry_count}/{max_retries}")
            logger.info(error)
            time.sleep(2)

    logger.error("❌ DynamoDB no está disponible después de 60 segundos")
    return False


def table_exists(dynamodb, table_name):
    """Verifica si una tabla existe"""
    try:
        existing_tables = dynamodb.list_tables().get("TableNames", [])
        return table_name in existing_tables
    except ClientError:
        return False


def create_table(dynamodb, table_name, table_config):
    """Crea una tabla de DynamoDB"""
    try:
        logger.info(f"🚀 Creando tabla {table_name}...")

        dynamodb.create_table(
            TableName=table_name,
            **table_config
        )

        # Esperar a que la tabla esté activa
        waiter = dynamodb.get_waiter("table_exists")
        waiter.wait(TableName=table_name)

        logger.info(f"✅ Tabla {table_name} creada exitosamente")
        return True

    except ClientError as e:
        if e.response['Error']['Code'] == 'ResourceInUseException':
            logger.info(f"ℹ️ La tabla {table_name} ya existe")
            return True
        else:
            logger.error(f"❌ Error al crear la tabla {table_name}: {e}")
            return False


def init_all_tables():
    """Inicializa todas las tablas necesarias"""
    logger.info("🏁 Iniciando creación de tablas DynamoDB...")

    # Esperar a que DynamoDB esté disponible
    if not wait_for_dynamodb():
        return False

    dynamodb = get_dynamodb_client()
    success_count = 0

    for table_name, table_config in TABLES_CONFIG.items():
        if table_exists(dynamodb, table_name):
            logger.info(f"ℹ️ La tabla {table_name} ya existe, saltando...")
            success_count += 1
            continue

        if create_table(dynamodb, table_name, table_config):
            success_count += 1
        else:
            logger.error(f"❌ Falló la creación de la tabla {table_name}")

    total_tables = len(TABLES_CONFIG)
    logger.info(f"📊 Resumen: {success_count}/{total_tables} tablas creadas/verificadas")

    if success_count == total_tables:
        logger.info("🎉 Todas las tablas están listas!")
        return True
    else:
        logger.error("💥 Algunas tablas fallaron en su creación")
        return False


if __name__ == "__main__":
    success = init_all_tables()
    exit(0 if success else 1)
