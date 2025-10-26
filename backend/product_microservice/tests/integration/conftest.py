import os
import boto3
import pytest
from unittest.mock import patch
from src.models.warehouse import WarehouseModel
from src.models.db import TABLE_NAME, PK_NAME


# --- Fixture de cliente Flask ---
@pytest.fixture
def client():
    # --- 💡 APLICAR MOCKS DE COGNITO ANTES DE IMPORTAR APP ---
    with patch("flask_cognito.cognito_auth_required", lambda f: f), \
        patch("flask_cognito.cognito_group_permissions", lambda x: (lambda f: f)), \
        patch("flask_cognito.current_cognito_jwt", {
            "username": "test-user",
            "email": "test@example.com",
            "cognito:groups": ["admins", "vendors"]
        }):
        from src.main import app
        with app.test_client() as client:
            app.testing = True
            clear_db()
            yield client
            clear_db()


def clear_db():
    table_names = [
        (TABLE_NAME, PK_NAME),
        (WarehouseModel.Meta.table_name, WarehouseModel.id.attr_name),
    ]

    if os.getenv("DYNAMODB_ENDPOINT"):
        dynamodb = boto3.resource(
            "dynamodb",
            endpoint_url=os.getenv("DYNAMODB_ENDPOINT"),
            aws_access_key_id="dummy",
            aws_secret_access_key="dummy"
        )
    else:
        dynamodb = boto3.resource('dynamodb')

    for table_name, pk_name in table_names:
        clear_dynamodb_table(table_name, pk_name, dynamodb)


def clear_dynamodb_table(table_name, pk_name, dynamodb):
    table = dynamodb.Table(table_name)

    # Scan to get all items (or at least their keys)
    response = table.scan(ProjectionExpression=pk_name)

    while True:
        with table.batch_writer() as batch:
            for item in response['Items']:
                batch.delete_item(Key={pk_name: item[pk_name]})

        if 'LastEvaluatedKey' not in response:
            break
        response = table.scan(
            ExclusiveStartKey=response['LastEvaluatedKey'],
            ProjectionExpression=pk_name
        )
