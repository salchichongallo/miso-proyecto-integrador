from flask import jsonify, Blueprint, request
from ..commands.ping import Ping
from ..models.vendor import NewVendorJsonSchema


vendors_blueprint = Blueprint("vendor", __name__)


@vendors_blueprint.get("/vendor/ping")
def ping():
    return jsonify(Ping().execute())

@vendors_blueprint.post("/vendor/create")
def create_vendor():
    json = request.get_json()
    NewVendorJsonSchema.check(json)
    payload = {
        "name": json["name"],
        "email": json["email"],
        "institutions": json["institutions"]
    }
    return jsonify({"mssg": "Vendor created successfully"}), 201

