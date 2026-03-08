import json
from unittest.mock import patch, MagicMock


class TestFavoritesRoutes:

    @patch('routes.favorites.db')
    def test_get_favorites_exito(self, mock_db, client):
        """Verifica obtener favoritos correctamente."""

        mock_doc = MagicMock()
        mock_doc.to_dict.return_value = {
            "fav_id": "fav_1",
            "original_history_id": "hist_1",
            "recipe": {"titulo": "Hamburguesa"}
        }

        mock_db.collection.return_value\
            .document.return_value\
            .collection.return_value\
            .stream.return_value = [mock_doc]

        response = client.post('/api/favorites/', json={
            "uid": "user_123"
        })

        data = json.loads(response.data)

        assert response.status_code == 200
        assert len(data) == 1
        assert data[0]["recipe"]["titulo"] == "Hamburguesa"


    @patch('routes.favorites.db')
    def test_get_favorites_vacio(self, mock_db, client):
        """Verifica respuesta cuando no hay favoritos."""

        mock_db.collection.return_value\
            .document.return_value\
            .collection.return_value\
            .stream.return_value = []

        response = client.post('/api/favorites/', json={
            "uid": "user_123"
        })

        data = json.loads(response.data)

        assert response.status_code == 200
        assert data == []


    @patch('routes.favorites.db')
    def test_delete_favorite_exito(self, mock_db, client):
        """Verifica eliminar favorito correctamente."""

        mock_fav_ref = MagicMock()

        mock_doc = MagicMock()
        mock_doc.exists = True

        mock_fav_ref.get.return_value = mock_doc

        mock_db.collection.return_value\
            .document.return_value\
            .collection.return_value\
            .document.return_value = mock_fav_ref

        response = client.delete('/api/favorites/delete', json={
            "uid": "user_123",
            "fav_id": "fav_123"
        })

        data = json.loads(response.data)

        assert response.status_code == 200
        assert "eliminado correctamente" in data["message"]


    def test_delete_favorite_parametros_faltantes(self, client):
        """Verifica validación de parámetros."""

        response = client.delete('/api/favorites/delete', json={
            "uid": "user_123"
        })

        data = json.loads(response.data)

        assert response.status_code == 400
        assert "UID y fav_id son requeridos" in data["error"]