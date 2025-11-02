import uuid
import traceback
import datetime
from flask import jsonify, Blueprint, request

from ..commands.ping import PingCommand
from ..models.product import NewProductJsonSchema
from ..models.product_mirror import ProductMirrorModel
from ..errors.errors import ParamError, ApiError
from ..commands.create_product import CreateProduct
from ..commands.create_products_bulk import CreateProductsBulk
from ..queries.search_products import SearchProductsQuery
from ..queries.get_product_detail import GetProductDetailQuery

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

        json_data["expiration_date"] = datetime.date.fromisoformat(json_data["expiration_date"])
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
    products = SearchProductsQuery(
        product_name=request.args.get("product_name"),
        batch=request.args.get("batch"),
        status=request.args.get("status"),
        warehouse_name=request.args.get("warehouse_name"),
    ).execute()
    return jsonify(products), 200


@products_blueprint.get("/<string:sku>")
@cognito_auth_required
def get_product(sku):
    products = GetProductDetailQuery(sku).execute()
    return jsonify(products), 200


@products_blueprint.post("/bulk")
@cognito_auth_required
def bulk_upload_products():
    try:
        if "file" not in request.files:
            return jsonify({"error": "Debe adjuntar un archivo CSV o Excel"}), 400

        file = request.files["file"]
        file_bytes = file.read()
        filename = file.filename
        warehouse = request.form.get("warehouse", "DEFAULT_WH")

        result = CreateProductsBulk(file_bytes, filename, warehouse).execute()
        return jsonify(result), 200

    except ApiError as e:
        return jsonify({"error": str(e)}), 400
    except Exception as e:
        return jsonify({"error": f"Error inesperado: {str(e)}"}), 500


@products_blueprint.post("/mirrors")
@cognito_auth_required
def create_product_mirror():
    body = request.get_json()

    # Convertir fecha de expiración a formato ISO string
    expiration_date_obj = datetime.datetime.strptime(body["expiration_date"], "%Y-%m-%d").date()
    formatted_date = expiration_date_obj.isoformat()

    product_mirror = ProductMirrorModel(
        id=str(uuid.uuid4()),
        sku=body["sku"],
        provider_nit=body["provider_nit"],
        name=body["name"],
        product_type=body["product_type"],
        stock=body["stock"],
        expiration_date=formatted_date,
        temperature_required=body["temperature_required"],
        batch=body["batch"],
        status=body["status"],
        unit_value=body["unit_value"],
        storage_conditions=body["storage_conditions"],
        warehouse=body["warehouse"],
        warehouse_name=body["warehouse_name"],
        warehouse_address=body["warehouse_address"],
        warehouse_country=body["warehouse_country"],
        warehouse_city=body["warehouse_city"],
        created_at=datetime.datetime.now(datetime.timezone.utc),
        updated_at=datetime.datetime.now(datetime.timezone.utc),
    )
    product_mirror.save()
    return jsonify(product_mirror.to_dict()), 200
