import pytest
from unittest.mock import MagicMock, patch
from src.commands.create_user import CreateCognitoUser
from src.errors.errors import ParamError, ApiError


def test_validate_invalid_email():
    cmd = CreateCognitoUser(email="invalid", role="admin")
    with pytest.raises(ParamError):
        cmd.validate()


def test_validate_invalid_role():
    cmd = CreateCognitoUser(email="test@test.com", role="wrong")
    with pytest.raises(ParamError):
        cmd.validate()


# ------------------------------------------------------------
# Caso exitoso
# ------------------------------------------------------------
@patch("boto3.client")
def test_create_user_success(mock_boto_client):
    mock_client = MagicMock()
    mock_boto_client.return_value = mock_client

    mock_client.admin_create_user.return_value = {
        "User": {
            "Username": "12345",
            "Attributes": [{"Name": "sub", "Value": "12345"}],
        }
    }

    mock_client.admin_set_user_password.return_value = {}

    cmd = CreateCognitoUser("test@test.com", "admin")
    result = cmd.execute()

    assert result["email"] == "test@test.com"
    assert result["role"] == "admin"
    assert result["cognito_id"] == "12345"


# ------------------------------------------------------------
# Usuario ya existe
# ------------------------------------------------------------
@patch("boto3.client")
def test_create_user_exists(mock_boto_client):
    mock_client = MagicMock()
    mock_boto_client.return_value = mock_client

    class FakeExists(Exception):
        pass

    mock_client.exceptions = MagicMock()
    mock_client.exceptions.UsernameExistsException = FakeExists

    mock_client.admin_create_user.side_effect = FakeExists("exists")

    cmd = CreateCognitoUser("test@test.com", "admin")

    with pytest.raises(ParamError):
        cmd.execute()


# ------------------------------------------------------------
# Error inesperado
# ------------------------------------------------------------
@patch("boto3.client")
def test_create_user_unexpected_error(mock_boto_client):
    mock_client = MagicMock()
    mock_boto_client.return_value = mock_client

    class FakeExists(Exception):
        pass

    mock_client.exceptions = MagicMock()
    mock_client.exceptions.UsernameExistsException = FakeExists

    mock_client.admin_create_user.side_effect = Exception("AWS ERROR")

    cmd = CreateCognitoUser("test@test.com", "seller")

    with pytest.raises(ApiError):
        cmd.execute()
