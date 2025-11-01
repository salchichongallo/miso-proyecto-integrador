import traceback
from datetime import date
from flask import jsonify, Blueprint, request
from ..commands.ping import PingCommand
from ..models.order import NewOrderJsonSchema
from ..errors.errors import ParamError, ApiError
from ..commands.create_order import CreateOrder
# from ..commands.view_all import GetAllProducts
# from ..commands import CreateProductsBulk

from flask_cognito import cognito_auth_required

orders_blueprint = Blueprint("orders", __name__)


@orders_blueprint.get("/ping")
def ping():
    return jsonify(PingCommand().execute())


@orders_blueprint.post("/")
# @cognito_auth_required
def create_order():
    try:
        json_data = request.get_json()
        NewOrderJsonSchema.check(json_data)
        create_order_response = CreateOrder(json_data).execute()
        return jsonify(create_order_response), 201

    except ParamError as e:
        return jsonify({"error": str(e)}), 400
    except ApiError as e:
        return jsonify({"error": str(e)}), 500
    except Exception as e:
        traceback.print_exc()
        return jsonify({"error": f"Error inesperado: {str(e)}"}), 500



# @products_blueprint.get("/")
# @cognito_auth_required
# def get_all_products():
#     try:
#         products = GetAllProducts().execute()
#         return jsonify(products), 200
#     except ApiError as e:
#         return jsonify({"error": str(e)}), 500
#     except Exception as e:
#         return jsonify({"error": f"Error inesperado: {str(e)}"}), 500


