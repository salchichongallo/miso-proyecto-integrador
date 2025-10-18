import traceback
from datetime import date
from flask import jsonify, Blueprint, request
from ..commands.ping import PingCommand
from ..models.product import NewProductJsonSchema
from ..errors.errors import ParamError, ApiError
from ..commands.create_product import CreateProduct
from ..commands.view_all import GetAllProducts
from ..commands.create_products_bulk import CreateProductsBulk

from flask_cognito import cognito_auth_required

products_blueprint = Blueprint("product", __name__)


@products_blueprint.get("/ping")
def ping():
    return jsonify(PingCommand().execute())


@products_blueprint.post("/")
@cognito_auth_required
def create_product():
    try:
        json_data = request.get_json()
        NewProductJsonSchema.check(json_data)

        json_data["expiration_date"] = date.fromisoformat(json_data["expiration_date"])
        create_product = CreateProduct(**json_data).execute()
        return jsonify(create_product), 201

    except ParamError as e:
        return jsonify({"error": str(e)}), 400
    except ApiError as e:
        return jsonify({"error": str(e)}), 500
    except Exception as e:
        traceback.print_exc()
        return jsonify({"error": f"Error inesperado: {str(e)}"}), 500



@products_blueprint.get("/")
@cognito_auth_required
def get_all_products():
    try:
        products = GetAllProducts().execute()
        return jsonify(products), 200
    except ApiError as e:
        return jsonify({"error": str(e)}), 500
    except Exception as e:
        return jsonify({"error": f"Error inesperado: {str(e)}"}), 500



@products_blueprint.post("/bulk")
@cognito_auth_required
def bulk_upload_products():
    try:
        if "file" not in request.files:
            return jsonify({"error": "Debe adjuntar un archivo CSV o Excel"}), 400

        file = request.files["file"]
        file_bytes = file.read()
        filename = file.filename

        result = CreateProductsBulk(file_bytes, filename).execute()
        return jsonify(result), 200

    except ApiError as e:
        return jsonify({"error": str(e)}), 400
    except Exception as e:
        return jsonify({"error": f"Error inesperado: {str(e)}"}), 500
