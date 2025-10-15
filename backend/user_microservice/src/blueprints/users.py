from flask import jsonify, Blueprint
from flask_cognito import cognito_auth_required, current_cognito_jwt, cognito_group_permissions
from ..commands.ping import PingCommand

users_blueprint = Blueprint("users", __name__)

@users_blueprint.get("/ping")
def ping():
    return jsonify(PingCommand().execute())

@users_blueprint.get("/me")
@cognito_auth_required
# @cognito_group_permissions(["admins"])
def api_private():

    username = current_cognito_jwt.get("username")
    user_sub = current_cognito_jwt.get("sub")
    token_use = current_cognito_jwt.get("token_use")
    groups = current_cognito_jwt.get("cognito:groups", [])

    return jsonify({
        "message": "✅ Access granted",
        "username": username,
        "sub": user_sub,
        "token_use": token_use,
        "groups": groups
    })
