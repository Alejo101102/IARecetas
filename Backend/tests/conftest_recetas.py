"""
Configuración mejorada para pytest - Tests de Recetas

Este archivo contiene fixtures y configuraciones específicas
para los tests del módulo de generación de recetas con IA.
"""

import pytest
import sys
import os
from unittest.mock import patch, MagicMock

# Agregar el directorio padre al path para poder importar los módulos
sys.path.insert(0, os.path.abspath(os.path.join(os.path.dirname(__file__), '..')))

from app import app as flask_app


@pytest.fixture
def app():
    """Fixture que proporciona la aplicación Flask configurada para testing"""
    flask_app.config.update({
        "TESTING": True,
        "SKIP_FIREBASE_INIT": True,
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


@pytest.fixture
def mock_gemini_response():
    """Fixture que proporciona una respuesta mockead de Gemini"""
    mock_response = MagicMock()
    mock_response.text = '''{
        "titulo": "Receta de Prueba",
        "descripcion": "Una receta de prueba para testing",
        "tiempo_estimado": 30,
        "porciones": 2,
        "dificultad": "Fácil",
        "calorias": 350,
        "proteina": 20,
        "carbos": 40,
        "grasas": 12,
        "ingredientes": [
            {"nombre": "ingrediente 1", "cantidad": "100g"},
            {"nombre": "ingrediente 2", "cantidad": "50g"}
        ],
        "instrucciones": [
            "Paso 1 de la receta",
            "Paso 2 de la receta"
        ]
    }'''
    return mock_response


@pytest.fixture
def sample_recipe_payload():
    """Fixture que proporciona un payload de ejemplo para generar receta"""
    return {
        'ingredientes': 'pollo, arroz, cebolla, tomate, aceite',
        'objetivo': 'Equilibrado',
        'tiempo': '30 min',
        'bajo_calorias': False,
        'solo_una_olla': False,
        'uid': 'user_test_123'
    }


@pytest.fixture
def sample_recipe_low_cal():
    """Fixture para receta con restricción de calorías"""
    return {
        'ingredientes': 'lechuga, tomate, pollo, limón',
        'objetivo': 'Bajar de peso',
        'tiempo': '15 min',
        'bajo_calorias': True,
        'solo_una_olla': False,
        'uid': 'user_test_123'
    }


@pytest.fixture
def sample_recipe_one_pot():
    """Fixture para receta de una sola olla"""
    return {
        'ingredientes': 'arroz, agua, sal, cebolla, ajo',
        'objetivo': 'Equilibrado',
        'tiempo': '20 min',
        'bajo_calorias': False,
        'solo_una_olla': True,
        'uid': 'user_test_123'
    }


# Configuración de pytest
def pytest_configure(config):
    """Configuración inicial de pytest"""
    config.addinivalue_line(
        "markers", "integration: marca un test como test de integración"
    )
    config.addinivalue_line(
        "markers", "unit: marca un test como test unitario"
    )
    config.addinivalue_line(
        "markers", "slow: marca un test como lento"
    )


# Hooks para reportes
def pytest_runtest_logreport(report):
    """Hook para personalizar reportes de tests"""
    if report.when == "call":
        if report.outcome == "passed":
            print(f"\n✅ {report.nodeid} - PASSED")
        elif report.outcome == "failed":
            print(f"\n❌ {report.nodeid} - FAILED")
