import os
import logging
from flask import Flask, jsonify
from dotenv import load_dotenv
from flask_cognito import CognitoAuth
from .blueprints.users import users_blueprint
from .errors.errors import ApiError

# Cargar variables de entorno
load_dotenv()

# Inicialización de Flask
app = Flask("user_microservice")

# Configuración de Cognito
app.config.update({
    "COGNITO_REGION": os.getenv("AWS_REGION", "us-east-1"),
    "COGNITO_USERPOOL_ID": os.getenv("APP_COGNITO_USER_POOL_ID", ""),
    "COGNITO_CHECK_TOKEN_EXPIRATION": True,
    "COGNITO_JWT_HEADER_NAME": "Authorization",
    "COGNITO_JWT_HEADER_PREFIX": "Bearer",
})

# Inicializar CognitoAuth
cognito = CognitoAuth(app)

# Registrar blueprints
app.register_blueprint(users_blueprint)

@app.get("/health")
def health():
    return {"status": "up", "app": app.name}

@app.errorhandler(ApiError)
def handle_exception(err):
    response = {
        "mssg": err.description,
        "version": os.getenv("VERSION", "1.0.0")
    }
    return jsonify(response), err.code

# Configuración de logs (para producción con Gunicorn)
if __name__ != "__main__":
    gunicorn_logger = logging.getLogger("gunicorn.error")
    app.logger.handlers = gunicorn_logger.handlers
    app.logger.setLevel(gunicorn_logger.level)
    logging.basicConfig(level=gunicorn_logger.level)
