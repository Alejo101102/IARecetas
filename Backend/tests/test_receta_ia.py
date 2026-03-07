import pytest
import json
from unittest.mock import patch, MagicMock

# Clase principal para agrupar todas las pruebas de la API de Recetas
class TestRecetasIACompleto:

    def test_generar_receta_error_datos_vacios(self, client):
        """Prueba que el sistema rechace peticiones sin ingredientes."""
        response = client.post('/api/recipes/generate', json={})
        assert response.status_code == 400
        assert "No se proporcionaron los datos" in json.loads(response.data)['error']

    @patch('routes.recetas_ia.genai.GenerativeModel')
    def test_generar_receta_ia_falla(self, mock_model, client):
        """Prueba el manejo de errores cuando la IA devuelve algo que no es JSON."""
        mock_response = MagicMock()
        mock_response.text = "Lo siento, no puedo generar esa receta."
        mock_model.return_value.generate_content.return_value = mock_response

        payload = {'ingredientes': 'piedras'}
        response = client.post('/api/recipes/generate', json=payload)
        
        assert response.status_code == 500
        assert 'formato JSON válido' in json.loads(response.data)['error']

    # --- PRUEBAS DE HISTORIAL ---

    @patch('routes.history.db')
    def test_obtener_historial_exito(self, mock_db, client):
        """Verifica la recuperación de la lista de historial desde Firestore."""
        # Simulamos documentos de Firestore
        mock_doc = MagicMock()
        mock_doc.to_dict.return_value = {'id': '1', 'recipe': {'titulo': 'Pasta'}}
        
        # Mock de la cadena: db.collection().document().collection().order_by().stream()
        mock_db.collection.return_value.document.return_value.collection.return_value.order_by.return_value.stream.return_value = [mock_doc]

        response = client.post('/api/history/', json={'uid': 'user_123'})
        data = json.loads(response.data)

        assert response.status_code == 200
        assert len(data) == 1
        assert data[0]['recipe']['titulo'] == 'Pasta'

    # --- PRUEBAS DE FAVORITOS (BIBLIOTECA) ---

    @patch('routes.favorites.db')
    def test_add_favorite_exito(self, mock_db, client):
        """Prueba que se pueda mover una receta del historial a favoritos."""
        # 1. Mock de la referencia al documento del historial
        mock_hist_doc_ref = MagicMock()
        mock_hist_doc = MagicMock()
        mock_hist_doc.exists = True
        mock_hist_doc.to_dict.return_value = {'recipe': {'titulo': 'Pizza'}}
        mock_hist_doc_ref.get.return_value = mock_hist_doc

        # 2. Mock de la referencia al nuevo documento de favorito
        mock_fav_ref = MagicMock()
        mock_fav_ref.id = "new_fav_id_777"

        # Configuramos la cadena de llamadas de la base de datos
        # Para el GET del historial
        mock_db.collection.return_value.document.return_value.collection.return_value.document.return_value = mock_hist_doc_ref
        # Para la creación del favorito (el segundo document() llamado sin argumentos)
        mock_db.collection.return_value.document.return_value.collection.return_value.document.side_effect = [mock_hist_doc_ref, mock_fav_ref]

        payload = {
            'uid': 'user_123',
            'history_id': 'hist_999'
        }
        response = client.post('/api/favorites/add', json=payload)
        data = json.loads(response.data)
        
        # Ajustado a 201 y verificamos el mensaje según favorites.py
        assert response.status_code == 201
        assert "Receta añadida a favoritos" in data['message']
        assert data['fav_id'] == "new_fav_id_777"

    def test_add_favorite_faltan_parametros(self, client):
        """Verifica que el sistema pida UID e ID de historial."""
        response = client.post('/api/favorites/add', json={'uid': 'solo_uid'})
        assert response.status_code == 400
        assert "UID e ID de historial son requeridos" in json.loads(response.data)['error']

    @patch('routes.favorites.db')
    def test_delete_favorite_no_existe(self, mock_db, client):
        """Prueba que el sistema detecte si un favorito a borrar no existe."""
        mock_fav_ref = MagicMock()
        mock_fav_ref.get.return_value.exists = False
        mock_db.collection.return_value.document.return_value.collection.return_value.document.return_value = mock_fav_ref

        payload = {'uid': 'user_123', 'fav_id': 'id_falso'}
        response = client.delete('/api/favorites/delete', json=payload)
        
        assert response.status_code == 404
        assert "El favorito no existe" in json.loads(response.data)['error']

    # --- PRUEBAS DE LÓGICA DE NEGOCIO (addToHistory.py) ---

    @patch('helper.addToHistory.db')
    def test_logica_limite_historial(self, mock_db):
        """
        Verifica que si hay 6 recetas, se borre la más antigua.
        Este test prueba directamente la función saveRecipe de tus archivos.
        """
        from helper.addToHistory import saveRecipe
        
        # Simulamos que hay 6 documentos en el stream
        mock_docs = [MagicMock() for _ in range(6)]
        mock_ref = mock_db.collection.return_value.document.return_value.collection.return_value
        mock_ref.order_by.return_value.stream.return_value = mock_docs
        
        # Ejecutamos la función
        saveRecipe("user_123", {"titulo": "Receta Nueva"})
        
        # Comprobamos que se llamó a delete() en el primer documento (el más antiguo)
        mock_docs[0].reference.delete.assert_called_once()

    @patch('routes.favorites.db')
    def test_get_favorites_vacio(self, mock_db, client):
        """Verifica que retorne lista vacía si el usuario no tiene favoritos."""
        mock_db.collection.return_value.document.return_value.collection.return_value.stream.return_value = []
        
        response = client.post('/api/favorites/', json={'uid': 'user_sin_favs'})
        assert response.status_code == 200
        assert json.loads(response.data) == []