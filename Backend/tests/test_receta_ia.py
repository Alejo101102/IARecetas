import pytest
import json
from unittest.mock import patch, MagicMock

class TestRecetasIAEndpoints:
    
    @patch('routes.recetas_ia.client.models.generate_content')
    def test_generar_receta_exito(self, mock_generate, client):
        """Prueba la generación de receta exitosa simulando la respuesta de Gemini"""
        
        # Simular la respuesta de Gemini
        mock_response = MagicMock()
        mock_response.text = '''```json
        {
            "titulo": "Pollo con Arroz Saludable",
            "descripcion": "Un plato sencillo y nutritivo",
            "tiempo_estimado": "30 min",
            "porciones": "2",
            "dificultad": "Fácil",
            "calorias_estimadas": "400",
            "ingredientes": ["pollo", "arroz", "cebolla", "tomate"],
            "instrucciones": ["Paso 1", "Paso 2"]
        }
        ```'''
        mock_generate.return_value = mock_response

        # Datos de prueba
        payload = {
            'ingredientes': 'pollo, arroz, cebolla, tomate',
            'objetivo': 'Equilibrado',
            'tiempo': '30 min',
            'bajo_calorias': True,
            'solo_una_olla': True
        }

        response = client.post('/api/recipes/generate', json=payload)
        
        # Verificaciones
        assert response.status_code == 200
        data = json.loads(response.data)
        assert data['mensaje'] == 'Receta generada con éxito'
        assert 'receta' in data
        assert data['receta']['titulo'] == 'Pollo con Arroz Saludable'
        mock_generate.assert_called_once()
        
    def test_generar_receta_sin_datos(self, client):
        """Prueba cuando no se envían datos en el cuerpo de la petición"""
        # Enviamos un post sin json para forzar que data=request.json sea None
        response = client.post('/api/recipes/generate')
        
        assert response.status_code == 400
        data = json.loads(response.data)
        assert 'error' in data
        assert data['error'] == 'No se proporcionaron los datos'

    def test_generar_receta_sin_ingredientes(self, client):
        """Prueba cuando se envían datos pero no hay ingredientes"""
        payload = {
            'objetivo': 'Equilibrado',
            'ingredientes': ''
        }
        response = client.post('/api/recipes/generate', json=payload)
        
        assert response.status_code == 400
        data = json.loads(response.data)
        assert 'error' in data
        assert 'La despensa está vacía' in data['error']

    @patch('routes.recetas_ia.client.models.generate_content')
    def test_generar_receta_respuesta_invalida(self, mock_generate, client):
        """Prueba cuando Gemini devuelve un JSON inválido"""
        # Simular respuesta de Gemini con JSON inválido
        mock_response = MagicMock()
        mock_response.text = "Esto no es un JSON"
        mock_generate.return_value = mock_response

        payload = {
            'ingredientes': 'pollo, arroz'
        }

        response = client.post('/api/recipes/generate', json=payload)
        
        assert response.status_code == 500
        data = json.loads(response.data)
        assert 'error' in data
        assert 'formato JSON válido' in data['error']

    @patch('routes.recetas_ia.client.models.generate_content')
    def test_generar_receta_error_general(self, mock_generate, client):
        """Prueba cuando ocurre un error general (ej. falla la conexión)"""
        # Simular una excepción al llamar a Gemini
        mock_generate.side_effect = Exception("Error de conexión a la API")

        payload = {
            'ingredientes': 'pollo, arroz'
        }

        response = client.post('/api/recipes/generate', json=payload)
        
        assert response.status_code == 500
        data = json.loads(response.data)
        assert 'error' in data
        assert 'Error de conexión a la API' in data['error']