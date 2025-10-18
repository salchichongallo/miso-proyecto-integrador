from flask import jsonify, Blueprint, request
from ..commands.ping import PingCommand
# from ..commands.create_vendor import CreateVendor
# from ..commands.view_all import GetAllVendors
# from flask_cognito import cognito_auth_required, current_cognito_jwt, cognito_group_permissions
# from ..models.vendor import NewVendorJsonSchema
# from ..errors.errors import ParamError, ApiError


products_blueprint = Blueprint("product", __name__)


@products_blueprint.get("/ping")
def ping():
    return jsonify(PingCommand().execute())
