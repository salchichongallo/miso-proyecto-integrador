import os
from flask import Flask, jsonify
from dotenv import load_dotenv
from .models.db import init_db

loaded = load_dotenv('.env')

from .blueprints.vendor import vendors_blueprint
from .errors.errors import ApiError


app = Flask("vendor_microservice")
app.register_blueprint(vendors_blueprint)

init_db()

@app.errorhandler(ApiError)
def handle_exception(err):
    response = {
      'mssg': err.description,
      'version': os.getenv("VERSION", "1.0.0")
    }
    return jsonify(response), err.code
