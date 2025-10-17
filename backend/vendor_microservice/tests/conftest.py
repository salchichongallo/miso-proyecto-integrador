import os
import sys
import pytest
from unittest.mock import patch

# --- Configuración de paths ---
CURRENT_DIR = os.path.dirname(__file__)
PROJECT_ROOT = os.path.abspath(os.path.join(CURRENT_DIR, ".."))
SRC_PATH = os.path.join(PROJECT_ROOT, "src")
sys.path.insert(0, PROJECT_ROOT)
sys.path.insert(0, SRC_PATH)

# --- 💡 APLICAR MOCKS DE COGNITO ANTES DE IMPORTAR APP ---
with patch("flask_cognito.cognito_auth_required", lambda f: f), \
     patch("flask_cognito.cognito_group_permissions", lambda x: (lambda f: f)), \
     patch("flask_cognito.current_cognito_jwt", {
         "username": "test-user",
         "email": "test@example.com",
         "cognito:groups": ["admins", "vendors"]
     }):
    from src.main import app


# --- Fixture de cliente Flask ---
@pytest.fixture
def client():
    app.testing = True
    with app.test_client() as client:
        yield client
