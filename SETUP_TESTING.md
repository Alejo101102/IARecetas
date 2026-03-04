# 📝 Guía Rápida de Setup para Testing

Este documento te ayudará a configurar el entorno para ejecutar los tests.

## ⚙️ Setup Inicial

### Backend (pytest)

```powershell
# 1. Navegar al directorio Backend
cd Backend

# 2. Crear y activar entorno virtual (recomendado)
python -m venv venv
.\venv\Scripts\Activate.ps1

# 3. Instalar dependencias
pip install -r requirements.txt

# 4. Ejecutar tests
pytest -v
```

### Frontend (jest)

```powershell
# 1. Navegar al directorio Frontend
cd Frontend

# 2. Instalar dependencias
npm install

# 3. Ejecutar tests
npm test
```

## 🚀 Ejecutar Tests

### Opción 1: Con script PowerShell (requiere setup previo)

```powershell
# Todos los tests
.\test.ps1

# Solo backend
.\test.ps1 backend

# Solo frontend
.\test.ps1 frontend
```

### Opción 2: Manual

```powershell
# Backend
cd Backend
pytest -v --cov=. --cov-report=html

# Frontend
cd Frontend
npm test -- --coverage
```

### Opción 3: En Docker (sin instalar nada local)

```powershell
# Build y test del backend
docker build -t iarecetas-backend-test ./Backend
docker run iarecetas-backend-test pytest -v

# Build y test del frontend
docker build -t iarecetas-frontend-test -f Frontend/Dockerfile.dev ./Frontend
docker run iarecetas-frontend-test npm test
```

## ✅ Verificar que todo funciona

```powershell
# 1. Backend
cd Backend
pytest --collect-only  # Lista todos los tests sin ejecutarlos

# 2. Frontend
cd Frontend
npm test -- --listTests  # Lista todos los tests
```

## 🔧 Troubleshooting

### Backend

**Error: ModuleNotFoundError**
```powershell
# Solución: Instalar dependencias
pip install -r requirements.txt
```

**Error: No module named 'flask_cors'**
```powershell
# Solución: Instalar flask-cors
pip install flask-cors
```

**Error: Firebase credentials**
```
# Los tests mockean Firebase, no necesitas credenciales reales
# Si ves este error, verifica que el mock esté en el test
```

### Frontend

**Error: Cannot find module 'jest'**
```powershell
# Solución: Instalar dependencias
npm install
```

**Error: Unexpected token 'export'**
```powershell
# Solución: Verifica que .babelrc existe
# Si no, créalo con preset-react y preset-env
```

**Error: Test suite failed to run**
```powershell
# Solución: Limpia cache
npm test -- --clearCache
```

## 📊 Coverage Reports

Después de ejecutar tests con coverage:

- **Backend**: Abre `Backend/htmlcov/index.html`
- **Frontend**: Abre `Frontend/coverage/lcov-report/index.html`

## 🎯 GitHub Actions

Los tests se ejecutan automáticamente en cada push/PR.
Ver: `.github/workflows/docker-ci.yml`

No necesitas instalar nada para que funcione GitHub Actions, solo asegúrate de que:
- Los archivos de test existan
- `requirements.txt` y `package.json` estén actualizados
