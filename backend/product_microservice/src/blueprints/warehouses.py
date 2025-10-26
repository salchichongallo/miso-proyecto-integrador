from flask import jsonify, Blueprint, request
from flask_cognito import cognito_auth_required

from ..models.warehouse import WarehouseModel, NewWarehouseSchema


warehouses_blueprint = Blueprint("warehouses", __name__, url_prefix="/warehouses")


@warehouses_blueprint.post("")
@cognito_auth_required
def create_warehouse():
    body = request.get_json()
    NewWarehouseSchema.check(body)
    warehouse = WarehouseModel.create(**body)
    return jsonify(warehouse.to_dict()), 201


@warehouses_blueprint.get("")
@cognito_auth_required
def get_warehouses():
    warehouses = WarehouseModel.get_all()
    warehouses_dict = [warehouse.to_dict() for warehouse in warehouses]
    return jsonify(warehouses_dict), 200
