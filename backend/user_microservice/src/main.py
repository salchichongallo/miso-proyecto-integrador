import os
import logging
from flask import Flask, jsonify
from dotenv import load_dotenv

loaded = load_dotenv('.env')

from .blueprints.users import users_blueprint
from .errors.errors import ApiError


app = Flask("user_microservice")
app.register_blueprint(users_blueprint)


@app.get("/health")
def health():
    return { "status": "up", "app": app.name }


@app.errorhandler(ApiError)
def handle_exception(err):
    response = {
      'mssg': err.description,
      'version': os.getenv("VERSION", "1.0.0")
    }
    return jsonify(response), err.code


if __name__ != "__main__":
    gunicorn_logger = logging.getLogger("gunicorn.error")
    app.logger.handlers = gunicorn_logger.handlers
    app.logger.setLevel(gunicorn_logger.level)
    logging.basicConfig(level=gunicorn_logger.level)
