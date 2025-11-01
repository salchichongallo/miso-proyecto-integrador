import pytest
from uuid import uuid4
from unittest.mock import patch
from src.models.order import OrderModel

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


@pytest.fixture()
def db_clearer():
    clear_db()
    yield
    clear_db()


def clear_db():
    models = [OrderModel]
    for model in models:
        with model.batch_write() as batch:
            for item in model.scan():
                batch.delete(item)

