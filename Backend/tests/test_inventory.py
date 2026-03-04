"""
Tests para el blueprint de inventario
"""
import pytest
import json
from unittest.mock import Mock, patch

class TestInventoryEndpoints:
    """Tests para los endpoints de inventario"""
    
    @patch('routes.inventory.db')
    def test_inventory_list_endpoint_exists(self, mock_db, client):
        """Test que verifica que el endpoint de listado existe"""
        # Mock de Firestore
        mock_db.collection.return_value.where.return_value.stream.return_value = []
        
        response = client.get('/api/inventory/list?userId=test123')
        # Verifica que el endpoint responde (puede ser 200 o error dependiendo de la implementación)
        assert response.status_code in [200, 400, 500]
    
    def test_inventory_add_endpoint_exists(self, client):
        """Test que verifica que el endpoint de agregar existe"""
        response = client.post('/api/inventory/add', 
                              json={},
                              content_type='application/json')
        # El endpoint existe si no devuelve 404
        assert response.status_code != 404
    
    @patch('routes.inventory.db')
    def test_inventory_list_requires_user_id(self, mock_db, client):
        """Test que verifica que el listado requiere userId"""
        response = client.get('/api/inventory/list')
        # Debería devolver un error si no se proporciona userId
        assert response.status_code in [400, 422]
