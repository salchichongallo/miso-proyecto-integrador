from flask import jsonify, Blueprint, request
from ..commands.ping import PingCommand
from ..commands.create_provider import CreateProvider
from ..commands.view_all import GetAllProviders
from ..commands.create_providers_bulk import CreateProvidersBulk
from ..errors.errors import ParamError, ApiError
from flask_cognito import cognito_auth_required

providers_blueprint = Blueprint("provider", __name__)

# ----------------------------------------------------------
@providers_blueprint.get("/ping")
def ping():
    return jsonify(PingCommand().execute())

# ----------------------------------------------------------
@providers_blueprint.post("/")
# @cognito_auth_required
def create_provider():
    try:
        json_data = request.get_json()
        create_provider = CreateProvider(json_data).execute()
        return jsonify({
            "message": "Proveedor creado exitosamente",
            "provider": create_provider
        }), 201

    except ParamError as e:
        if "ya está registrado" in str(e):
            return jsonify({"error": str(e)}), 409
        return jsonify({"error": str(e)}), 400

    except ApiError as e:
        return jsonify({"error": str(e)}), 500

    except Exception as e:
        return jsonify({"error": f"Error inesperado: {str(e)}"}), 500


@providers_blueprint.get("/")
# @cognito_auth_required
def get_all_providers():
    try:
        providers = GetAllProviders().execute()
        return jsonify(providers), 200
    except ApiError as e:
        return jsonify({"error": str(e)}), 500
    except Exception as e:
        return jsonify({"error": f"Error inesperado: {str(e)}"}), 500


# @providers_blueprint.post("/bulk")
# # @cognito_auth_required
# def bulk_upload_providers():
#     try:
#         if "file" not in request.files:
#             return jsonify({"error": "No se adjuntó ningún archivo"}), 400

#         file = request.files["file"]
#         command = CreateProvidersBulk(file.read(), file.filename)
#         result = command.execute()
#         return jsonify(result), 200

#     except ApiError as e:
#         return jsonify({"error": str(e)}), 400
#     except Exception as e:
#         return jsonify({"error": f"Error inesperado: {str(e)}"}), 500
