from flask import jsonify, Blueprint
from ..commands.ping import Ping


vendors_blueprint = Blueprint("vendor", __name__)


@vendors_blueprint.get("/vendor/ping")
def ping():
    return jsonify(Ping().execute())

