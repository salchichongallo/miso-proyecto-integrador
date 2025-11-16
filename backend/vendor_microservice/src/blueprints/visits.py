from flask import jsonify, Blueprint, request
from ..commands.ping import PingCommand
from flask_cognito import cognito_auth_required, current_cognito_jwt
from ..errors.errors import ParamError, ApiError
from ..models.visit import NewVisitJsonSchema
from ..commands.create_visit import CreateVisit
from ..commands.get_visits_by_vendor import ListVisits

visits_blueprint = Blueprint("visits", __name__, url_prefix="/visits")


@visits_blueprint.get("/ping")
def ping():
    return jsonify(PingCommand().execute())


@visits_blueprint.post("/")
@cognito_auth_required
def create_visit():
    try:
        json_data = request.get_json()
        vendor_id = current_cognito_jwt.get("sub")
        NewVisitJsonSchema.check(json_data)
        response = CreateVisit(json_data, vendor_id).execute()
        return jsonify(response), 201

    except ParamError as e:
        return jsonify({"error": str(e)}), 400
    except ApiError as e:
        return jsonify({"error": str(e)}), 500
    except Exception as e:
        return jsonify({"error": f"Unexpected error: {str(e)}"}), 500



@visits_blueprint.get("/")
@cognito_auth_required
def list_visits():
    try:
        vendor_id = current_cognito_jwt.get("sub")
        response = ListVisits(vendor_id).execute()
        return jsonify(response), 200

    except ApiError as e:
        return jsonify({"error": str(e)}), 500
    except Exception as e:
        return jsonify({"error": f"Unexpected error: {str(e)}"}), 500
