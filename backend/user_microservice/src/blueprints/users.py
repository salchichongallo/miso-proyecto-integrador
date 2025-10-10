from flask import jsonify, Blueprint
from ..commands.ping import Ping


users_blueprint = Blueprint("users", __name__)


@users_blueprint.get("/users/ping")
def ping():
    return jsonify(Ping().execute())

