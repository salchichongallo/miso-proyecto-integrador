import pytest
from unittest.mock import patch, MagicMock
from src.commands.create_user_bulk import CreateCognitoUserBulk
from src.errors.errors import ParamError
from src.commands.create_user import CreateCognitoUser


# =========================
# Helpers Mocks
# =========================

def mock_create_user_success(email, role):
    return {
        "message": "Usuario creado exitosamente",
        "email": email,
        "cognito_id": "mock-id",
        "role": role
    }


def mock_create_user_fail(email, role):
    raise Exception("User already exists")


# =========================
# Tests Unitarios
# =========================

def test_bulk_init_invalid_payload():
    with pytest.raises(ParamError):
        CreateCognitoUserBulk("not-a-list")


@patch.object(CreateCognitoUser, "execute")
def test_bulk_success(mock_execute):
    mock_execute.side_effect = lambda: mock_create_user_success("a@test.com", "admin")

    cmd = CreateCognitoUserBulk([
        {"email": "a@test.com", "role": "admin"}
    ])

    result = cmd.execute()

    assert len(result["created"]) == 1
    assert len(result["failed"]) == 0


@patch.object(CreateCognitoUser, "execute")
def test_bulk_partial_fail(mock_execute):
    mock_execute.side_effect = [
        mock_create_user_success("good@test.com", "admin"),
        Exception("User already exists"),
    ]

    cmd = CreateCognitoUserBulk([
        {"email": "good@test.com", "role": "admin"},
        {"email": "bad@test.com", "role": "admin"},
    ])

    result = cmd.execute()

    assert len(result["created"]) == 1
    assert len(result["failed"]) == 1
    assert result["failed"][0]["reason"] == "User already exists"


def test_bulk_missing_fields():
    cmd = CreateCognitoUserBulk([
        {"email": "x@test.com"},
        {"role": "admin"},
    ])

    result = cmd.execute()

    assert len(result["created"]) == 0
    assert len(result["failed"]) == 2
    assert result["failed"][0]["reason"] == "Missing email or role"
