"""
Tests para el blueprint de inventario
"""
from unittest.mock import patch
from datetime import datetime

class TestInventoryEndpoints:
    """Tests para los endpoints de inventario"""

    def test_inventory_list_requires_uid(self, client):
        """El listado debe requerir uid en el body."""
        response = client.post('/api/inventory/list', json={})
        assert response.status_code == 400

    @patch('routes.inventory._find_duplicate_product', return_value='existing123')
    def test_inventory_add_returns_409_when_duplicate_exists(self, _, client):
        """POST /add devuelve 409 y existing_product_id si ya existe name+category."""
        response = client.post('/api/inventory/add', json={
            "uid": "user1",
            "name": "Harina",
            "quantity": 2,
            "category": "Harinas"
        })

        assert response.status_code == 409
        data = response.get_json()
        assert data["code"] == "PRODUCT_ALREADY_EXISTS"
        assert data["existing_product_id"] == "existing123"

    @patch('routes.inventory._find_duplicate_product', return_value=None)
    @patch('routes.inventory.db')
    def test_inventory_add_creates_product_successfully(self, mock_db, _, client):
        """POST /add crea producto cuando no hay duplicado."""
        product_ref = mock_db.collection.return_value.document.return_value.collection.return_value.document.return_value
        product_ref.id = "new123"

        response = client.post('/api/inventory/add', json={
            "uid": "user1",
            "name": "Leche",
            "quantity": 1,
            "category": "lacteos"
        })

        assert response.status_code == 201
        data = response.get_json()
        assert data["status"] == "success"
        assert data["product_id"] == "new123"
        assert product_ref.set.called

    @patch('routes.inventory.updateIngredient', return_value={
        "id": "abc123",
        "name": "Harina Integral",
        "quantity": 3,
        "category": "Harinas",
        "expiry_date": "2026-04-15",
        "updated_at": datetime(2026, 3, 4, 12, 0, 0).isoformat()
    })
    def test_inventory_put_updates_product(self, _, client):
        """PUT /<id> actualiza producto y retorna 200."""
        response = client.put('/api/inventory/abc123', json={
            "uid": "user1",
            "name": "Harina Integral",
            "quantity": 3,
            "category": "Harinas",
            "expiry_date": "2026-04-15"
        })

        assert response.status_code == 200
        data = response.get_json()
        assert data["status"] == "success"
        assert data["product"]["id"] == "abc123"

    @patch('routes.inventory.deleteIngredient')
    def test_inventory_delete_by_id_with_query_uid(self, mock_delete, client):
        """DELETE /<id>?uid=... elimina correctamente."""
        response = client.delete('/api/inventory/abc123?uid=user1')

        assert response.status_code == 200
        data = response.get_json()
        assert data["status"] == "deleted"
        assert data["product_id"] == "abc123"
        mock_delete.assert_called_once_with("user1", "abc123")

    def test_inventory_delete_by_id_requires_uid(self, client):
        """DELETE /<id> sin uid debe devolver 400."""
        response = client.delete('/api/inventory/abc123')
        assert response.status_code == 400
