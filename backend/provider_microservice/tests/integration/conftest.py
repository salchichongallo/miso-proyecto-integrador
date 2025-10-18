import pytest
from unittest.mock import patch


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
            yield client
