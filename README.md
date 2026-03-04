# 🍳 IARecetas

![CI/CD Pipeline](https://github.com/TU_USUARIO/IARecetas/actions/workflows/docker-ci.yml/badge.svg)
![Backend Tests](https://img.shields.io/badge/tests-pytest-blue)
![Frontend Tests](https://img.shields.io/badge/tests-jest-green)

Sistema de gestión de recetas con inteligencia artificial.

## 📋 Descripción

IARecetas es una aplicación web que permite gestionar inventarios, historial y favoritos de recetas utilizando Firebase y una arquitectura cliente-servidor.

- **Backend**: Flask + Python + Firebase Admin SDK
- **Frontend**: React + Vite + Firebase Auth

## 🚀 Inicio Rápido con Docker

### Prerrequisitos
- Docker
- Docker Compose

### Levantar el proyecto
```bash
# Clonar el repositorio
git clone <tu-repo>
cd IARecetas

# Levantar servicios
docker-compose up -d

# Ver logs
docker-compose logs -f
```

El frontend estará disponible en http://localhost:3000 y el backend en http://localhost:5000

### Comandos útiles (con Makefile)
```bash
make help      # Ver todos los comandos disponibles
make up        # Levantar servicios
make down      # Detener servicios
make logs      # Ver logs
make rebuild   # Reconstruir imágenes
make ps        # Estado de contenedores
```

## 🛠️ Desarrollo Local (sin Docker)

### Backend
```bash
cd Backend
pip install -r requirements.txt
flask run
```

### Frontend
```bash
cd Frontend
npm install
npm run dev
```

## 📁 Estructura del Proyecto

```
IARecetas/
├── Backend/
│   ├── app.py                          # Aplicación Flask principal
│   ├── requirements.txt                # Dependencias Python
│   ├── Dockerfile                      # Imagen Docker del backend
│   ├── initFirebase.py                 # Inicialización de Firebase
│   └── routes/                         # Endpoints de la API
│       ├── inventory.py
│       ├── history.py
│       └── favorites.py
├── Frontend/
│   ├── src/                            # Código fuente React
│   ├── public/                         # Archivos estáticos
│   ├── Dockerfile                      # Imagen Docker del frontend
│   ├── nginx.conf                      # Configuración Nginx
│   └── package.json                    # Dependencias Node.js
├── docker-compose.yml                  # Orquestación de servicios
├── Makefile                            # Comandos útiles
├── DOCKER.md                           # Documentación Docker completa
└── .github/workflows/docker-ci.yml     # Pipeline CI/CD
```

## 🔐 Configuración

### 1. Credenciales de Firebase

Coloca tu archivo de credenciales de Firebase Admin SDK en:
```
Backend/iarecetas-4e7a5-firebase-adminsdk.json
```

**⚠️ IMPORTANTE**: Este archivo NO debe subirse al repositorio.

### 2. Variables de entorno

Copia el archivo de ejemplo:
```bash
cp .env.example .env
```

Edita las variables según tu configuración.

## 🌐 API Endpoints

### Inventario
- `POST /api/inventory/add` - Agregar producto
- `GET /api/inventory/list` - Listar productos
- `PUT /api/inventory/update/<id>` - Actualizar producto
- `DELETE /api/inventory/delete/<id>` - Eliminar producto

### Historial
- `POST /api/history/add` - Agregar al historial
- `GET /api/history/list` - Listar historial

### Favoritos
- `POST /api/favorites/add` - Agregar favorito
- `GET /api/favorites/list` - Listar favoritos
- `DELETE /api/favorites/delete/<id>` - Eliminar favorito

Documentación completa: http://localhost:5000/api/docs

## 🐳 DevOps

### CI/CD con GitHub Actions

El proyecto incluye un pipeline CI/CD que:
1. ✅ Hace linting del código
2. 🔨 Construye las imágenes Docker
3. 🧪 Ejecuta tests
4. 📦 Publica en Docker Hub (en rama main)

Para configurar:
1. Crea los secrets en GitHub:
   - `DOCKERHUB_USERNAME`
   - `DOCKERHUB_TOKEN`

### Despliegue en Producción

Ver [DOCKER.md](DOCKER.md) para guías detalladas sobre:
- Despliegue en servidores
- Configuración SSL/TLS
- Secrets de Docker
- Monitoreo y logs
- Troubleshooting

## 🧪 Testing

```bash
# Ejecutar todos los tests
.\test.ps1

# Solo backend (pytest)
.\test.ps1 backend

# Solo frontend (jest)
.\test.ps1 frontend
```

Ver [TESTING.md](TESTING.md) para documentación completa sobre testing.

## 📊 Monitoreo

```bash
# Ver uso de recursos
docker stats

# Logs en tiempo real
docker-compose logs -f

# Health check
curl http://localhost:5000/
```

## 🧪 Testing

```bash
# Backend
cd Backend
pytest

# Frontend
cd Frontend
npm test
```

## 🤝 Contribuir

1. Fork el proyecto
2. Crea una rama para tu feature (`git checkout -b feature/AmazingFeature`)
3. Commit tus cambios (`git commit -m 'Add: AmazingFeature'`)
4. Push a la rama (`git push origin feature/AmazingFeature`)
5. Abre un Pull Request

## 📝 Licencia

Este proyecto es privado y confidencial.

## 👥 Equipo

[Tu información de contacto]

## 📚 Recursos Adicionales

- [Documentación Docker](DOCKER.md)
- [Documentación de la API](http://localhost:5000/api/docs)
- [Guía de Frontend](Frontend/README.md)
