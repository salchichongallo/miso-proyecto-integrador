from flask import jsonify, Blueprint, request
from ..commands.ping import PingCommand
from flask_cognito import cognito_auth_required
from ..errors.errors import ParamError, ApiError
from ..commands.create_sales_plan import CreateSalesPlan
from ..commands.view_all_sales_plans import GetAllSalesPlans
from ..commands.view_report_vendor import ViewReportVendor
from ..models.sales_plan import NewSalesPlanJsonSchema

sales_blueprint = Blueprint("sales_plan", __name__, url_prefix="/sales_plan")


@sales_blueprint.get("/ping")
def ping():
    return jsonify(PingCommand().execute())


@sales_blueprint.post("/")
@cognito_auth_required
def create_sales_plan():
    try:
        json_data = request.get_json()
        NewSalesPlanJsonSchema.check(json_data)
        response = CreateSalesPlan(json_data).execute()
        return jsonify(response), 201

    except ParamError as e:
        return jsonify({"error": str(e)}), 400
    except ApiError as e:
        return jsonify({"error": str(e)}), 500
    except Exception as e:
        return jsonify({"error": f"Unexpected error: {str(e)}"}), 500



@sales_blueprint.get("/")
@cognito_auth_required
def get_all_sales_plans():
    try:
        response = GetAllSalesPlans().execute()
        return jsonify(response), 200
    except ApiError as e:
        return jsonify({"error": str(e)}), 500
    except Exception as e:
        return jsonify({"error": f"Unexpected error: {str(e)}"}), 500


@sales_blueprint.get("/<vendor_id>")
@cognito_auth_required
def get_report_by_vendor(vendor_id):
    try:
        response = ViewReportVendor(vendor_id).execute()
        return jsonify(response), 200
    except ApiError as e:
        return jsonify({"error": str(e)}), 500
    except Exception as e:
        return jsonify({"error": f"Unexpected error: {str(e)}"}), 500
