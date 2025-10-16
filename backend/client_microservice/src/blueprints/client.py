from flask import jsonify, Blueprint, request
from ..commands.ping import Ping
from ..commands.create_client import CreateClient
from ..commands.view_all import GetAllClients
from flask_cognito import cognito_auth_required, current_cognito_jwt, cognito_group_permissions
from ..models.client import NewClientJsonSchema


clients_blueprint = Blueprint("client", __name__)


@clients_blueprint.get("/ping")
def ping():
    return jsonify(Ping().execute())

@clients_blueprint.post("/create")
# @cognito_auth_required
# @cognito_group_permissions(["admins"])
def create_client():
    json = request.get_json()
    NewClientJsonSchema.check(json)
    payload = {
        "name": json.get("name"),
        "tax_id": json.get("tax_id"),
        "country": json.get("country"),
        "level": json.get("level"),
        "specialty": json.get("specialty"),
        "location": json.get("location"),
        }
    create_client = CreateClient(**payload).execute()
    return jsonify({"mssg": "Client created successfully", "vendor": create_client}), 201


@clients_blueprint.get("/all")
# @cognito_auth_required
# @cognito_group_permissions(["admins", "vendors"])
def list_clients():
    result = GetAllClients().execute()
    return jsonify(result), 200

