import json
import pytest
from unittest.mock import patch, MagicMock

# ======================================================
# Helper: mock cognito client (todo en este archivo)
# ======================================================

class MockCognitoExceptions:
    class UsernameExistsException(Exception):
        pass


def mock_success():
    """Mock para creación exitosa."""
    mock = MagicMock()
    mock.exceptions = MockCognitoExceptions
    mock.admin_create_user.return_value = {"User": {"Username": "mock-id"}}
    mock.admin_set_user_password.return_value = {}
    return mock


def mock_exists():
    """Mock para usuario ya existente."""
    mock = MagicMock()
    mock.exceptions = MockCognitoExceptions
    mock.admin_create_user.side_effect = MockCognitoExceptions.UsernameExistsException("User exists")
    return mock


def mock_error():
    """Mock para error inesperado."""
    mock = MagicMock()
    mock.exceptions = MockCognitoExceptions
    mock.admin_create_user.side_effect = Exception("AWS ERROR")
    return mock


# ======================================================
# TEST DE INTEGRACIÓN: POST /bulk
# ======================================================

@pytest.mark.usefixtures("app")
class TestCreateUserBulkIntegration:

    @patch("boto3.client")
    def test_bulk_success(self, mock_boto_client, app):
        """
        Caso 100% exitoso
        """
        mock_boto_client.return_value = mock_success()

        payload = {
            "users": [
                {"email": "a@test.com", "role": "admin"},
                {"email": "b@test.com", "role": "vendor"}
            ]
        }

        resp = app.post(
            "/bulk",
            data=json.dumps(payload),
            content_type="application/json"
        )

        assert resp.status_code == 201
        body = resp.get_json()

        assert len(body["created"]) == 2
        assert len(body["failed"]) == 0


    @patch("boto3.client")
    def test_bulk_missing_users_field(self, mock_boto_client, app):
        """
        Falta el campo users → 400
        """
        mock_boto_client.return_value = mock_success()

        payload = {}

        resp = app.post(
            "/bulk",
            data=json.dumps(payload),
            content_type="application/json"
        )

        assert resp.status_code == 400
        body = resp.get_json()

        assert "users" in body["mssg"].lower()


    @patch("boto3.client")
    def test_bulk_missing_fields_in_items(self, mock_boto_client, app):
        """
        Lista enviada pero items inválidos
        """
        mock_boto_client.return_value = mock_success()

        payload = {
            "users": [
                {"email": "missing-role@test.com"},
                {"role": "admin"}
            ]
        }

        resp = app.post(
            "/bulk",
            data=json.dumps(payload),
            content_type="application/json"
        )

        assert resp.status_code == 201
        body = resp.get_json()

        assert len(body["created"]) == 0
        assert len(body["failed"]) == 2
        assert "missing" in body["failed"][0]["reason"].lower()


    @patch("boto3.client")
    def test_bulk_partial_failure(self, mock_boto_client, app):
        """
        Un usuario OK, otro falla por exists()
        """
        mock = mock_success()
        mock.admin_create_user.side_effect = [
            {"User": {"Username": "id-1"}},                      # OK
            mock.exceptions.UsernameExistsException("exists")    # Falla
        ]
        mock_boto_client.return_value = mock

        payload = {
            "users": [
                {"email": "ok@test.com", "role": "vendor"},
                {"email": "exists@test.com", "role": "vendor"}
            ]
        }

        resp = app.post(
            "/bulk",
            data=json.dumps(payload),
            content_type="application/json"
        )

        assert resp.status_code == 201
        body = resp.get_json()

        assert len(body["created"]) == 1
        assert len(body["failed"]) == 1
        assert "existe" in body["failed"][0]["reason"].lower()


    @patch("boto3.client")
    def test_bulk_unexpected_error(self, mock_boto_client, app):
        """
        Error inesperado → todos fallan, pero el endpoint retorna 201
        """
        mock_boto_client.return_value = mock_error()

        payload = {
            "users": [
                {"email": "a@test.com", "role": "admin"},
                {"email": "b@test.com", "role": "admin"}
            ]
        }

        resp = app.post(
            "/bulk",
            data=json.dumps(payload),
            content_type="application/json"
        )

        assert resp.status_code == 201
        body = resp.get_json()

        assert len(body["created"]) == 0
        assert len(body["failed"]) == 2
        assert "error" in body["failed"][0]["reason"].lower()
