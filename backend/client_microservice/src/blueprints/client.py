from flask import jsonify, Blueprint, request
from ..commands.ping import PingCommand
from ..commands.create_client import CreateClient
from ..commands.view_all import GetAllClients
from flask_cognito import cognito_auth_required, current_cognito_jwt, cognito_group_permissions
from ..models.client import NewClientJsonSchema
from ..errors.errors import ParamError, ApiError


clients_blueprint = Blueprint("client", __name__)


@clients_blueprint.get("/ping")
def ping():
    return jsonify(PingCommand().execute())

@clients_blueprint.post("/")
@cognito_auth_required
def create_client():
    try:
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
        return jsonify({"mssg": "Client created successfully", "client": create_client}), 201

    except ParamError as e:
        return jsonify({"error": str(e)}), 400

    except ApiError as e:
        return jsonify({"error": str(e)}), 500

    except Exception as e:
        return jsonify({"error": str(e)}), 500


@clients_blueprint.get("/")
@cognito_auth_required
def list_clients():
    try:
        result = GetAllClients().execute()
        return jsonify(result), 200
    except ApiError as e:
        return jsonify({"error": str(e)}), 500
    except Exception as e:
        return jsonify({"error": str(e)}), 500
