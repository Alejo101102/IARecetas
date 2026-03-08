import json
from unittest.mock import patch, MagicMock

class TestHistoryRoutes:

    @patch('routes.history.db')
    def test_historial_exito(self, mock_db, client):
        """Verifica que se devuelva el historial correctamente."""

        mock_doc = MagicMock()
        mock_doc.id = "hist_1"
        mock_doc.to_dict.return_value = {
            "recipe": {"titulo": "Pizza"}
        }

        mock_db.collection.return_value\
            .document.return_value\
            .collection.return_value\
            .order_by.return_value\
            .stream.return_value = [mock_doc]

        response = client.post('/api/history/', json={
            "uid": "user_123"
        })

        data = json.loads(response.data)

        assert response.status_code == 200
        assert len(data) == 1
        assert data[0]["recipe"]["titulo"] == "Pizza"


    def test_historial_uid_requerido(self, client):
        """Verifica que el endpoint requiera UID."""

        response = client.post('/api/history/', json={})

        data = json.loads(response.data)

        assert response.status_code == 400
        assert "UID requerido" in data["error"]


    @patch('routes.history.db')
    def test_historial_vacio(self, mock_db, client):
        """Verifica respuesta cuando el historial está vacío."""

        mock_db.collection.return_value\
            .document.return_value\
            .collection.return_value\
            .order_by.return_value\
            .stream.return_value = []

        response = client.post('/api/history/', json={
            "uid": "user_123"
        })

        data = json.loads(response.data)

        assert response.status_code == 200
        assert data == []