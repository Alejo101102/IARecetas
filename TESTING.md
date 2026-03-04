# 🧪 Testing en IARecetas

Este proyecto incluye tests automatizados para backend y frontend con integración continua en GitHub Actions.

## Backend - pytest

### Ejecutar tests

```bash
# Instalar dependencias
cd Backend
pip install -r requirements.txt

# Ejecutar todos los tests
pytest

# Tests con cobertura
pytest --cov=. --cov-report=html

# Tests específicos
pytest tests/test_app.py

# Tests con más detalle
pytest -v

# Solo tests marcados como unitarios
pytest -m unit
```

### Estructura de tests

```
Backend/
├── pytest.ini          # Configuración pytest
├── tests/
│   ├── conftest.py     # Fixtures compartidos
│   ├── test_app.py     # Tests del app principal
│   └── test_inventory.py  # Tests de inventario
```

### Escribir tests

```python
def test_example(client):
    """Test de ejemplo usando el cliente Flask"""
    response = client.get('/api/endpoint')
    assert response.status_code == 200
```

## Frontend - Jest

### Ejecutar tests

```bash
# Instalar dependencias
cd Frontend
npm install

# Ejecutar todos los tests
npm test

# Tests con cobertura
npm run test:coverage

# Tests en modo watch
npm run test:watch
```

### Estructura de tests

```
Frontend/
├── jest.config.js      # Configuración Jest
├── .babelrc            # Configuración Babel
├── __mocks__/          # Mocks globales
└── src/
    ├── setupTests.js   # Setup de Jest
    └── __tests__/      # Tests
        ├── App.test.jsx
        ├── Header.test.jsx
        └── utils.test.js
```

### Escribir tests

```jsx
import { render, screen } from '@testing-library/react';

test('renders component', () => {
  render(<MyComponent />);
  expect(screen.getByText(/Hello/i)).toBeInTheDocument();
});
```

## GitHub Actions CI/CD

El workflow `.github/workflows/docker-ci.yml` ejecuta automáticamente:

1. **Backend Tests**
   - Linting con flake8
   - Tests con pytest
   - Reporte de cobertura

2. **Frontend Tests**
   - Linting con ESLint
   - Tests con Jest
   - Reporte de cobertura

3. **Docker Build**
   - Construcción de imágenes
   - Prueba de docker-compose
   - Health checks

4. **Docker Push** (solo en main)
   - Publicación a Docker Hub

### Configurar Codecov (opcional)

1. Crea cuenta en https://codecov.io
2. Conecta tu repositorio
3. Agrega el secret `CODECOV_TOKEN` en GitHub

## Cobertura de código

### Ver reportes localmente

#### Backend
```bash
cd Backend
pytest --cov=. --cov-report=html
# Abre: htmlcov/index.html
```

#### Frontend
```bash
cd Frontend
npm run test:coverage
# Abre: coverage/lcov-report/index.html
```

## Mejores prácticas

### Backend (pytest)
- ✅ Usa fixtures para código reutilizable
- ✅ Mock Firebase con `@patch`
- ✅ Prueba casos exitosos y errores
- ✅ Usa markers para categorizar tests
- ✅ Nombra tests descriptivamente

### Frontend (Jest)
- ✅ Usa React Testing Library
- ✅ Prueba comportamiento, no implementación
- ✅ Mock dependencias externas
- ✅ Usa `data-testid` para selectores
- ✅ Prueba interacciones de usuario

## Comandos rápidos

```bash
# Backend tests
cd Backend && pytest -v

# Frontend tests
cd Frontend && npm test

# Ambos en Docker (CI local)
docker-compose -f docker-compose.test.yml up --abort-on-container-exit

# Limpiar cache
rm -rf Backend/.pytest_cache Backend/__pycache__
rm -rf Frontend/node_modules/.cache
```

## Troubleshooting

### Backend
- **ImportError**: Verifica que `conftest.py` esté en `tests/`
- **Firebase error**: Los tests mockean Firebase, no necesitas credenciales

### Frontend
- **Transform error**: Verifica `.babelrc` y `babel-jest`
- **Module not found**: Agrega mock en `__mocks__/` o `moduleNameMapper`
- **React error**: Asegúrate de tener `@testing-library/react`

## Recursos

- [pytest docs](https://docs.pytest.org/)
- [Jest docs](https://jestjs.io/)
- [React Testing Library](https://testing-library.com/react)
- [GitHub Actions docs](https://docs.github.com/actions)
