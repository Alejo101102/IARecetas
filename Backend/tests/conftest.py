import pytest
import sys
import os

# Agregar el directorio padre al path para poder importar los módulos
sys.path.insert(0, os.path.abspath(os.path.join(os.path.dirname(__file__), '..')))

from app import app as flask_app

@pytest.fixture
def app():
    """Fixture que proporciona la aplicación Flask configurada para testing"""
    flask_app.config.update({
        "TESTING": True,
    })
    yield flask_app

@pytest.fixture
def client(app):
    """Fixture que proporciona un cliente de prueba para la aplicación"""
    return app.test_client()

@pytest.fixture
def runner(app):
    """Fixture que proporciona un runner CLI para la aplicación"""
    return app.test_cli_runner()
