from unittest.mock import patch

def test_me_endpoint(app):
    fake_jwt = {
        "email": "admin@test.com",
        "sub": "abc123",
        "cognito:username": "admin@test.com",
        "custom:role": "admin",
        "cognito:groups": ["Admins"],
        "token_use": "id"
    }

    with patch("flask_cognito.current_cognito_jwt", fake_jwt):
        resp = app.get("/me")

    assert resp.status_code == 200
