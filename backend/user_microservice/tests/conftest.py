import os
import pytest
from flask import Flask
from dotenv import load_dotenv, find_dotenv
# from src.models.db import db, init_db, setup_database
from src.main import app as users_app

os.environ['ENV'] = 'test'

def pytest_configure(config):
  env_file = find_dotenv('../.env.test')
  load_dotenv(env_file)
  return config


"""
  Use this fixture to test commands.
  It creates an application context with a database connection.
  After the test is executed, the database is deleted.
"""
@pytest.fixture
def app_commands():
    flask_app = Flask(__name__)
    # init_db(flask_app)
    # setup_database(flask_app)

    with flask_app.app_context():
        try:
          yield flask_app
        finally:
          # db.session.remove()
          # db.drop_all()
          print("Tearing down the database...")


"""
  Use this fixture to test blueprints.
  It creates a test client to simulate HTTP requests using the "real" application.
  After the test is executed, the database is deleted.
"""
@pytest.fixture
def test_client():
    # init_db(users_app)
    # setup_database(users_app)
    users_app.config['SKIP_USER_VERIFICATION'] = True
    with users_app.test_client() as client:
        try:
            yield client
        finally:
            with users_app.app_context():
              # db.session.remove()
              # db.drop_all()
              print("Tearing down the database...")
