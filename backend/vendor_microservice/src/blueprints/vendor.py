from flask import jsonify, Blueprint, request
from ..commands.ping import PingCommand
from ..commands.create_vendor import CreateVendor
from ..commands.view_all import GetAllVendors
from flask_cognito import cognito_auth_required, current_cognito_jwt, cognito_group_permissions
from ..models.vendor import NewVendorJsonSchema
from ..errors.errors import ParamError, ApiError


vendors_blueprint = Blueprint("vendor", __name__)


@vendors_blueprint.get("/ping")
def ping():
    return jsonify(PingCommand().execute())

@vendors_blueprint.post("/create")
# @cognito_auth_required
# @cognito_group_permissions(["admins"])
def create_vendor():
    try:
        json = request.get_json()
        NewVendorJsonSchema.check(json)
        payload = {
            "name": json["name"],
            "email": json["email"],
            "institutions": json["institutions"]
        }
        create_vendor = CreateVendor(**payload).execute()
        return jsonify({"mssg": "Vendor created successfully", "vendor": create_vendor}), 201

    except ParamError as e:
        return jsonify({"error": str(e)}), 400

    except ApiError as e:
        return jsonify({"error": str(e)}), 500

    except Exception as e:
        return jsonify({"error": str(e)}), 500


@vendors_blueprint.get("/all")
# @cognito_auth_required
# @cognito_group_permissions(["admins", "vendors"])
def list_vendors():
    try:
        result = GetAllVendors().execute()
        return jsonify(result), 200
    except ApiError as e:
        return jsonify({"error": str(e)}), 500
    except Exception as e:
        return jsonify({"error": str(e)}), 500
