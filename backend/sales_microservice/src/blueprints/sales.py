from flask import jsonify, Blueprint
from ..commands.ping import PingCommand


sales_blueprint = Blueprint("sales", __name__)


@sales_blueprint.get("/ping")
def ping():
    return jsonify(PingCommand().execute())
