import os
from flask import Flask, jsonify
from dotenv import load_dotenv

loaded = load_dotenv('.env.development')

from .blueprints.users import users_blueprint
from .errors.errors import ApiError
# from .models.db import init_db


app = Flask(__name__)
app.register_blueprint(users_blueprint)

# init_db(app)

@app.errorhandler(ApiError)
def handle_exception(err):
    response = {
      'mssg': err.description,
      'version': os.environ['VERSION']
    }
    return jsonify(response), err.code
