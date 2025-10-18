import os
import logging
from flask import Flask, jsonify
from flask_cors import CORS
from dotenv import load_dotenv
# from .models.db import init_db
from flask_cognito import CognitoAuth
from .blueprints.products import products_blueprint
from .errors.errors import ApiError

# Cargar variables de entorno
load_dotenv()

# Inicialización de Flask
app = Flask("products_microservice")

# Configurar CORS antes de registrar blueprints
CORS(app, resources={r"/*": {"origins": "*"}})

app.config.update({
    "COGNITO_REGION": os.getenv("AWS_REGION", "us-east-1"),
    "COGNITO_USERPOOL_ID": os.getenv("APP_COGNITO_USER_POOL_ID", ""),
    "COGNITO_CHECK_TOKEN_EXPIRATION": True,
    "COGNITO_JWT_HEADER_NAME": "Authorization",
    "COGNITO_JWT_HEADER_PREFIX": "Bearer",
})
app.register_blueprint(products_blueprint)

# Inicializar CognitoAuth
cognito = CognitoAuth(app)

# init_db()

@app.get("/health")
def health():
    return {"status": "up", "app": app.name}

@app.errorhandler(ApiError)
def handle_exception(err):
    response = {
      'mssg': err.description,
      'version': os.getenv("VERSION", "1.0.0")
    }
    return jsonify(response), err.code

# Configuración de logs (para producción con Gunicorn)
if __name__ != "__main__":
    gunicorn_logger = logging.getLogger("gunicorn.error")
    app.logger.handlers = gunicorn_logger.handlers
    app.logger.setLevel(gunicorn_logger.level)
    logging.basicConfig(level=gunicorn_logger.level)
