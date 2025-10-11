import os
from flask import Flask, jsonify
from dotenv import load_dotenv

loaded = load_dotenv('.env')

from .blueprints.users import users_blueprint
from .errors.errors import ApiError


app = Flask("user_microservice")
app.register_blueprint(users_blueprint)


@app.errorhandler(ApiError)
def handle_exception(err):
    response = {
      'mssg': err.description,
      'version': os.getenv("VERSION", "1.0.0")
    }
    return jsonify(response), err.code
