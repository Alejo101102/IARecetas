"""
Tests unitarios para el endpoint principal de la aplicación
"""
import pytest
import json

class TestMainEndpoints:
    """Tests para los endpoints principales"""
    
    def test_home_endpoint(self, client):
        """Test que verifica que el endpoint principal responde correctamente"""
        response = client.get('/')
        assert response.status_code == 200
        
        data = json.loads(response.data)
        assert 'message' in data
        assert 'Backend funcionando' in data['message']
    
    def test_openapi_spec_endpoint(self, client):
        """Test que verifica que la especificación OpenAPI está disponible"""
        response = client.get('/api/openapi.json')
        assert response.status_code == 200
        
        data = json.loads(response.data)
        assert 'openapi' in data
        assert data['openapi'] == '3.0.3'
        assert 'info' in data
        assert 'paths' in data
    
    def test_api_docs_endpoint(self, client):
        """Test que verifica que la documentación API está disponible"""
        response = client.get('/api/docs')
        assert response.status_code == 200
        assert b'IARecetas API Docs' in response.data
