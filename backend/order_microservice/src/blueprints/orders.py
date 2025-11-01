import traceback
from datetime import date
from flask import jsonify, Blueprint, request
from ..commands.ping import PingCommand
from ..models.order import NewOrderJsonSchema
from ..errors.errors import ParamError, ApiError
from ..commands.create_order import CreateOrder
from ..commands.view_all import GetAllOrders
from ..commands.get_order_id import GetOrderById

from flask_cognito import cognito_auth_required

orders_blueprint = Blueprint("orders", __name__)


@orders_blueprint.get("/ping")
def ping():
    return jsonify(PingCommand().execute())


@orders_blueprint.post("/")
@cognito_auth_required
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


@orders_blueprint.get("/")
@cognito_auth_required
def get_all_orders():
    try:
        orders = GetAllOrders().execute()
        return jsonify(orders), 200
    except ApiError as e:
        return jsonify({"error": str(e)}), 500
    except Exception as e:
        traceback.print_exc()
        return jsonify({"error": f"Error inesperado: {str(e)}"}), 500



@orders_blueprint.get("/<order_id>")
@cognito_auth_required
def get_order_by_id(order_id):
    try:
        result = GetOrderById(order_id).execute()
        return jsonify(result), 200

    except ParamError as e:
        return jsonify({"error": str(e)}), 404
    except ApiError as e:
        return jsonify({"error": str(e)}), 500
    except Exception as e:
        traceback.print_exc()
        return jsonify({"error": f"Error inesperado: {str(e)}"}), 500
