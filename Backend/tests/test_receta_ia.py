import pytest
import json
from unittest.mock import patch, MagicMock

class TestRecetasIAEndpoints:
    
    @patch('routes.recetas_ia.genai.GenerativeModel')
    def test_generar_receta_exito(self, mock_model, client):
        """Prueba la generación de receta exitosa simulando la respuesta de Gemini"""
        
        # Simular la respuesta de Gemini
        mock_response = MagicMock()
        mock_response.text = '''```json
        {
            "titulo": "Pollo con Arroz Saludable",
            "descripcion": "Un plato sencillo y nutritivo",
            "tiempo_estimado": 30,
            "porciones": "2",
            "dificultad": "Fácil",
            "calorias": 400,
            "proteina": 25,
            "carbos": 35,
            "grasas": 12,
            "ingredientes": [{"nombre": "pollo", "cantidad": "200g"}, {"nombre": "arroz", "cantidad": "1 taza"}],
            "instrucciones": ["Paso 1", "Paso 2"]
        }
        ```'''
        mock_model.return_value.generate_content.return_value = mock_response

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
        mock_model.return_value.generate_content.assert_called_once()
        
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

    @patch('routes.recetas_ia.genai.GenerativeModel')
    def test_generar_receta_respuesta_invalida(self, mock_model, client):
        """Prueba cuando Gemini devuelve un JSON inválido"""
        # Simular respuesta de Gemini con JSON inválido
        mock_response = MagicMock()
        mock_response.text = "Esto no es un JSON"
        mock_model.return_value.generate_content.return_value = mock_response

        payload = {
            'ingredientes': 'pollo, arroz'
        }

        response = client.post('/api/recipes/generate', json=payload)
        
        assert response.status_code == 500
        data = json.loads(response.data)
        assert 'error' in data
        assert 'formato JSON válido' in data['error']

    @patch('routes.recetas_ia.genai.GenerativeModel')
    def test_generar_receta_error_general(self, mock_model, client):
        """Prueba cuando ocurre un error general (ej. falla la conexión a la API)"""
        # Simular una excepción al llamar a Gemini
        mock_model.return_value.generate_content.side_effect = Exception("Error de conexión a la API")

        payload = {
            'ingredientes': 'pollo, arroz'
        }

        response = client.post('/api/recipes/generate', json=payload)
        
        assert response.status_code == 500
        data = json.loads(response.data)
        assert 'error' in data
        assert 'Error de conexión a la API' in data['error']

    @patch('routes.recetas_ia.genai.GenerativeModel')
    def test_generar_receta_con_preferencias_bajo_calorias(self, mock_model, client):
        """Prueba la generación de receta con restricción de bajo en calorías"""
        mock_response = MagicMock()
        mock_response.text = json.dumps({
            "titulo": "Ensalada Ligera",
            "descripcion": "Una ensalada saludable y baja en calorías",
            "tiempo_estimado": 15,
            "porciones": 2,
            "dificultad": "Fácil",
            "calorias": 250,
            "proteina": 15,
            "carbos": 25,
            "grasas": 8,
            "ingredientes": [{"nombre": "lechuga", "cantidad": "200g"}],
            "instrucciones": ["Mezclar todos los ingredientes"]
        })
        
        mock_model.return_value.generate_content.return_value = mock_response

        payload = {
            'ingredientes': 'lechuga, tomate, cebolla',
            'bajo_calorias': True,
            'uid': 'test_user_123'
        }

        response = client.post('/api/recipes/generate', json=payload)
        
        assert response.status_code == 200
        data = json.loads(response.data)
        assert data['receta']['calorias'] <= 400
        assert 'receta_id' in data

    @patch('routes.recetas_ia.genai.GenerativeModel')
    def test_generar_receta_con_preferencia_una_olla(self, mock_model, client):
        """Prueba la generación de receta para cocinar en una sola olla"""
        mock_response = MagicMock()
        mock_response.text = json.dumps({
            "titulo": "Arroz con Verduras",
            "descripcion": "Todo en una sola olla",
            "tiempo_estimado": 25,
            "porciones": 3,
            "dificultad": "Fácil",
            "calorias": 350,
            "proteina": 12,
            "carbos": 45,
            "grasas": 10,
            "ingredientes": [{"nombre": "arroz", "cantidad": "2 tazas"}],
            "instrucciones": ["Todo en una olla"]
        })
        
        mock_model.return_value.generate_content.return_value = mock_response

        payload = {
            'ingredientes': 'arroz, agua, sal, cebolla',
            'solo_una_olla': True
        }

        response = client.post('/api/recipes/generate', json=payload)
        
        assert response.status_code == 200
        data = json.loads(response.data)
        assert 'receta' in data

    def test_obtener_historial_sin_uid(self, client):
        """Prueba obtener historial sin UID requerido"""
        payload = {
            'uid': ''
        }
        response = client.post('/api/recipes/history', json=payload)
        
        assert response.status_code == 400
        data = json.loads(response.data)
        assert 'error' in data
        assert 'UID requerido' in data['error']

    def test_obtener_historial_sin_datos(self, client):
        """Prueba obtener historial sin enviar datos"""
        response = client.post('/api/recipes/history')
        
        assert response.status_code == 400
        data = json.loads(response.data)
        assert 'error' in data
        assert 'UID requerido' in data['error']

    @patch('routes.recetas_ia.firebase_available', False)
    def test_obtener_historial_firebase_no_disponible(self, client):
        """Prueba obtener historial cuando Firebase no está disponible"""
        payload = {
            'uid': 'user_123'
        }
        response = client.post('/api/recipes/history', json=payload)
        
        assert response.status_code == 200
        data = json.loads(response.data)
        assert 'recetas' in data
        assert data['recetas'] == []

    def test_agregar_receta_biblioteca_sin_datos(self, client):
        """Prueba agregar receta a biblioteca sin datos"""
        response = client.post('/api/recipes/biblioteca')
        
        assert response.status_code == 400
        data = json.loads(response.data)
        assert 'error' in data

    def test_agregar_receta_biblioteca_sin_uid(self, client):
        """Prueba agregar receta a biblioteca sin UID"""
        payload = {
            'receta_id': 'recipe_123',
            'accion': 'add'
        }
        response = client.post('/api/recipes/biblioteca', json=payload)
        
        assert response.status_code == 400
        data = json.loads(response.data)
        assert 'error' in data
        assert 'UID y receta_id requeridos' in data['error']

    def test_agregar_receta_biblioteca_sin_receta_id(self, client):
        """Prueba agregar receta a biblioteca sin receta_id"""
        payload = {
            'uid': 'user_123',
            'accion': 'add'
        }
        response = client.post('/api/recipes/biblioteca', json=payload)
        
        assert response.status_code == 400
        data = json.loads(response.data)
        assert 'error' in data
        assert 'UID y receta_id requeridos' in data['error']

    @patch('routes.recetas_ia.firebase_available', False)
    def test_agregar_receta_biblioteca_firebase_no_disponible(self, client):
        """Prueba agregar receta a biblioteca cuando Firebase no está disponible"""
        payload = {
            'uid': 'user_123',
            'receta_id': 'recipe_123',
            'accion': 'add'
        }
        response = client.post('/api/recipes/biblioteca', json=payload)
        
        assert response.status_code == 200
        data = json.loads(response.data)
        assert 'addida localmente' in data['mensaje']

    @patch('routes.recetas_ia.firebase_available', False)
    def test_remover_receta_biblioteca_firebase_no_disponible(self, client):
        """Prueba remover receta de biblioteca cuando Firebase no está disponible"""
        payload = {
            'uid': 'user_123',
            'receta_id': 'recipe_123',
            'accion': 'remove'
        }
        response = client.post('/api/recipes/biblioteca', json=payload)
        
        assert response.status_code == 200
        data = json.loads(response.data)
        assert 'removeida localmente' in data['mensaje']

    @patch('routes.recetas_ia.firebase_available', False)
    def test_agregar_receta_biblioteca_accion_invalida(self, client):
        """Prueba agregar receta a biblioteca con acción inválida - en modo offline"""
        payload = {
            'uid': 'user_123',
            'receta_id': 'recipe_123',
            'accion': 'invalid'
        }
        # En modo offline (firebase_available=False), retorna 200 con mensaje genérico
        response = client.post('/api/recipes/biblioteca', json=payload)
        
        assert response.status_code == 200
        data = json.loads(response.data)
        assert 'invalidida localmente' in data['mensaje']

    @patch('routes.recetas_ia.genai.GenerativeModel')
    def test_generar_receta_estructura_completa(self, mock_model, client):
        """Prueba que la receta generada tenga la estructura completa esperada"""
        mock_response = MagicMock()
        mock_response.text = json.dumps({
            "titulo": "Pollo al Horno",
            "descripcion": "Pollo tierno y jugoso",
            "tiempo_estimado": 45,
            "porciones": 4,
            "dificultad": "Medio",
            "calorias": 380,
            "proteina": 40,
            "carbos": 35,
            "grasas": 12,
            "ingredientes": [
                {"nombre": "pecho de pollo", "cantidad": "800g"},
                {"nombre": "aceite de oliva", "cantidad": "3 cdas"}
            ],
            "instrucciones": [
                "Precalentar horno a 180°C",
                "Colocar pollo en bandeja",
                "Hornear 40 minutos"
            ]
        })
        
        mock_model.return_value.generate_content.return_value = mock_response

        payload = {
            'ingredientes': 'pollo, aceite, sal',
            'objetivo': 'Equilibrado',
            'tiempo': '45 min'
        }

        response = client.post('/api/recipes/generate', json=payload)
        
        assert response.status_code == 200
        data = json.loads(response.data)
        receta = data['receta']
        
        # Verificar estructura completa
        assert 'titulo' in receta
        assert 'descripcion' in receta
        assert 'tiempo_estimado' in receta
        assert 'porciones' in receta
        assert 'dificultad' in receta
        assert 'calorias' in receta
        assert 'proteina' in receta
        assert 'carbos' in receta
        assert 'grasas' in receta
        assert 'ingredientes' in receta
        assert 'instrucciones' in receta
        assert len(receta['ingredientes']) > 0
        assert len(receta['instrucciones']) > 0