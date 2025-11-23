import pytest
from unittest.mock import patch


def clear_db():
    models = []
    for model in models:
        with model.batch_write() as batch:
            for item in model.scan():
                batch.delete(item)


@pytest.fixture
def app():
    """
    Fixture de integración: devuelve un test_client de Flask.

    - Mockea los decoradores de flask_cognito para no exigir JWT real.
    - Mockea current_cognito_jwt con un payload fijo para /me.
    """
    with patch("flask_cognito.cognito_auth_required", lambda f: f), \
         patch("flask_cognito.cognito_group_permissions", lambda x: (lambda f: f)), \
         patch("flask_cognito.current_cognito_jwt", {
             "email": "admin@test.com",
             "sub": "abc123",
             "cognito:username": "admin@test.com",
             "custom:role": "admin",
             "cognito:groups": ["Admins"],
             "token_use": "id",
         }):
        from src.main import app as flask_app

        flask_app.testing = True
        with flask_app.test_client() as client:
            clear_db()
            yield client
            clear_db()


@pytest.fixture
def client(app):
    return app
