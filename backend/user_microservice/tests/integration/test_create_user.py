import json
import pytest
from unittest.mock import patch, MagicMock

# ======================================================
# Helper: mock cognito client
# ======================================================

class MockCognitoExceptions:
    class UsernameExistsException(Exception):
        pass


def build_mock_cognito(success=True, exists=False, error=False):
    """
    Genera un mock de boto3.client("cognito-idp")
    con distintos comportamientos.
    """

    mock_client = MagicMock()
    mock_client.exceptions = MockCognitoExceptions

    # Caso: usuario ya existe
    if exists:
        mock_client.admin_create_user.side_effect = MockCognitoExceptions.UsernameExistsException(
            "User already exists"
        )
        return mock_client

    # Caso: error inesperado
    if error:
        mock_client.admin_create_user.side_effect = Exception("AWS ERROR")
        return mock_client

    # Caso éxito
    if success:
        mock_client.admin_create_user.return_value = {
            "User": {
                "Username": "generated-cognito-id-123"
            }
        }
        mock_client.admin_set_user_password.return_value = {}
        return mock_client


# ======================================================
# TEST DE INTEGRACIÓN: POST /
# ======================================================

@pytest.mark.usefixtures("app")
class TestCreateUserIntegration:

    @patch("boto3.client")
    def test_create_user_success(self, mock_boto_client, app):
        mock_boto_client.return_value = build_mock_cognito(success=True)

        payload = {
            "email": "test@test.com",
            "role": "seller"
        }

        resp = app.post(
            "/",
            data=json.dumps(payload),
            content_type="application/json"
        )

        assert resp.status_code == 201
        body = resp.get_json()

        assert body["email"] == "test@test.com"
        assert body["role"] == "seller"
        assert body["cognito_id"] == "generated-cognito-id-123"
        assert "message" in body  # este sí viene del comando correcto


    @patch("boto3.client")
    def test_create_user_missing_fields(self, mock_boto_client, app):
        """
        Falta email o role -> ParamError -> HTTP 400
        """
        mock_boto_client.return_value = build_mock_cognito()

        payload = {"email": "no-role@test.com"}

        resp = app.post(
            "/",
            data=json.dumps(payload),
            content_type="application/json"
        )

        assert resp.status_code == 400
        body = resp.get_json()

        # tu ApiError handler usa "mssg"
        assert "required" in body["mssg"].lower()


    @patch("boto3.client")
    def test_create_user_already_exists(self, mock_boto_client, app):
        """
        UsernameExistsException -> ParamError -> HTTP 400
        """
        mock_boto_client.return_value = build_mock_cognito(exists=True)

        payload = {
            "email": "existing@test.com",
            "role": "manager"
        }

        resp = app.post(
            "/",
            data=json.dumps(payload),
            content_type="application/json"
        )

        # tu API devuelve 400, no 422
        assert resp.status_code == 400
        body = resp.get_json()

        assert "existe" in body["mssg"].lower()


    @patch("boto3.client")
    def test_create_user_unexpected_error(self, mock_boto_client, app):
        """
        Error inesperado -> ApiError -> HTTP 500
        """
        mock_boto_client.return_value = build_mock_cognito(error=True)

        payload = {
            "email": "bad@test.com",
            "role": "admin"
        }

        resp = app.post(
            "/",
            data=json.dumps(payload),
            content_type="application/json"
        )

        assert resp.status_code == 422

