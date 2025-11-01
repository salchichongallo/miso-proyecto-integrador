import os
import logging
import traceback
from flask import Flask, jsonify
from flask_cors import CORS
from dotenv import load_dotenv
from .models.db import init_db
from flask_cognito import CognitoAuth
from .blueprints.orders import orders_blueprint
from .errors.errors import ApiError, ParamError

# Cargar variables de entorno
load_dotenv()

# Inicialización de Flask
app = Flask("orders_microservice")

# Configurar CORS antes de registrar blueprints
CORS(app, resources={r"/*": {"origins": "*"}})

app.config.update({
    "COGNITO_REGION": os.getenv("AWS_REGION", "us-east-1"),
    "COGNITO_USERPOOL_ID": os.getenv("APP_COGNITO_USER_POOL_ID", ""),
    "COGNITO_CHECK_TOKEN_EXPIRATION": True,
    "COGNITO_JWT_HEADER_NAME": "Authorization",
    "COGNITO_JWT_HEADER_PREFIX": "Bearer",
})
app.register_blueprint(orders_blueprint)

# Inicializar CognitoAuth
cognito = CognitoAuth(app)

init_db()


@app.get("/health")
def health():
    return {"status": "up", "app": app.name}


@app.errorhandler(ParamError)
def handle_validation_errors(error: ParamError):
    return jsonify({"error": str(error)}), error.code


@app.errorhandler(ApiError)
def handle_api_errors(err):
    response = {
      'mssg': err.description,
      'version': os.getenv("VERSION", "1.0.0")
    }
    return jsonify(response), err.code


@app.errorhandler(Exception)
def handle_unexpected_errors(error):
    logging.exception("An unexpected error occurred: %s", str(error))
    traceback.print_exc()
    return jsonify({"error": f"Error inesperado: {str(error)}"}), 500


# Configuración de logs (para producción con Gunicorn)
if __name__ != "__main__":
    gunicorn_logger = logging.getLogger("gunicorn.error")
    app.logger.handlers = gunicorn_logger.handlers
    app.logger.setLevel(gunicorn_logger.level)
    logging.basicConfig(level=gunicorn_logger.level)
