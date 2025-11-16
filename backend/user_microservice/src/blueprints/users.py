from flask import jsonify, Blueprint, request
from flask_cognito import cognito_auth_required, current_cognito_jwt, cognito_group_permissions
from ..commands.ping import PingCommand
from ..commands.create_user import CreateCognitoUser
from ..commands.create_user_bulk import CreateCognitoUserBulk
from ..errors.errors import ParamError

users_blueprint = Blueprint("users", __name__)

@users_blueprint.get("/ping")
def ping():
    return jsonify(PingCommand().execute())

@users_blueprint.get("/me")
@cognito_auth_required
def api_private():

    return jsonify({
        "email": current_cognito_jwt.get("email"),
        "cognito_id": current_cognito_jwt.get("sub"),
        "username": current_cognito_jwt.get("cognito:username"),
        "role": current_cognito_jwt.get("custom:role"),
        "groups": current_cognito_jwt.get("cognito:groups", []),
        "token_use": current_cognito_jwt.get("token_use")
    })


@users_blueprint.post("/")
def create_user():

    data = request.get_json() or {}
    email = data.get("email")
    role = data.get("role")

    if not email or not role:
        raise ParamError("The 'email' and 'role' fields are required.")

    result = CreateCognitoUser(email, role).execute()
    return jsonify(result), 201


@users_blueprint.post("/bulk")
def create_user_bulk():

    data = request.get_json() or {}
    users = data.get("users")

    if not users:
        raise ParamError("The field 'users' is required and must be a list.")

    result = CreateCognitoUserBulk(users).execute()
    return jsonify(result), 201
