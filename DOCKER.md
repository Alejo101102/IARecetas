# IARecetas - Configuración Docker

## 📦 Estructura del Proyecto Dockerizado

El proyecto incluye:
- **Backend**: Flask + Python con Firebase Admin
- **Frontend**: React + Vite servido con Nginx
- **docker-compose.yml**: Orquestación de servicios

## 🚀 Uso Rápido

### Levantar todo el proyecto
```bash
docker-compose up -d
```

### Ver logs
```bash
# Todos los servicios
docker-compose logs -f

# Solo backend
docker-compose logs -f backend

# Solo frontend
docker-compose logs -f frontend
```

### Detener servicios
```bash
docker-compose down
```

### Reconstruir imágenes (después de cambios en el código)
```bash
docker-compose up -d --build
```

## 🌐 Acceso a los Servicios

- **Frontend**: http://localhost:3000
- **Backend**: http://localhost:5000
- **Health Check Backend**: http://localhost:5000/

## 📝 Comandos Útiles

### Entrar a un contenedor
```bash
# Backend
docker exec -it iarecetas-backend bash

# Frontend
docker exec -it iarecetas-frontend sh
```

### Ver estado de los contenedores
```bash
docker-compose ps
```

### Limpiar todo (contenedores, imágenes, volúmenes)
```bash
docker-compose down -v
docker system prune -a
```

## 🔧 Configuración de Variables de Entorno

Si necesitas variables de entorno adicionales, puedes:

1. Crear un archivo `.env` en la raíz:
```env
FLASK_ENV=production
VITE_API_URL=http://localhost:5000
```

2. Modificar `docker-compose.yml` para usar el archivo:
```yaml
services:
  backend:
    env_file:
      - .env
```

## 🔐 Credenciales de Firebase

El archivo `iarecetas-4e7a5-firebase-adminsdk.json` se monta como volumen de solo lectura en el contenedor del backend.

**IMPORTANTE**: Nunca subas este archivo a un repositorio público.

## 📊 DevOps: CI/CD Pipeline

### GitHub Actions (ejemplo)

Crea `.github/workflows/docker.yml`:

```yaml
name: Docker Build and Push

on:
  push:
    branches: [ main ]

jobs:
  build:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      
      - name: Build Backend
        run: docker build -t iarecetas-backend:latest ./Backend
      
      - name: Build Frontend
        run: docker build -t iarecetas-frontend:latest ./Frontend
      
      - name: Run tests
        run: docker-compose up -d && sleep 10 && curl http://localhost:5000/
```

## 🐳 Docker Hub / Registry

### Tagear y subir imágenes
```bash
# Backend
docker tag iarecetas-backend:latest usuario/iarecetas-backend:1.0
docker push usuario/iarecetas-backend:1.0

# Frontend
docker tag iarecetas-frontend:latest usuario/iarecetas-frontend:1.0
docker push usuario/iarecetas-frontend:1.0
```

## 🔍 Troubleshooting

### El backend no se conecta a Firebase
Verifica que el archivo JSON de credenciales existe y tiene los permisos correctos.

### El frontend no puede llamar al backend
1. Verifica que CORS esté habilitado en Flask
2. Asegúrate de usar la URL correcta en las llamadas API del frontend

### Puerto ya en uso
Si los puertos 3000 o 5000 están ocupados, modifica `docker-compose.yml`:
```yaml
ports:
  - "8080:80"  # Frontend en puerto 8080
  - "8000:5000"  # Backend en puerto 8000
```

## 📈 Monitoreo y Logs

### Logs en tiempo real con filtros
```bash
docker-compose logs -f --tail=100 backend
```

### Ver uso de recursos
```bash
docker stats
```

## 🚀 Producción

Para producción, considera:

1. **Usar volúmenes para persistencia**
2. **Configurar secrets de Docker** para credenciales
3. **Usar Docker Swarm o Kubernetes** para orquestación
4. **Implementar reverse proxy** (Traefik, Nginx)
5. **Configurar SSL/TLS** con Let's Encrypt
6. **Monitoreo** con Prometheus + Grafana

### Ejemplo con secrets:
```bash
docker secret create firebase_creds iarecetas-4e7a5-firebase-adminsdk.json
```

## 📚 Recursos Adicionales

- [Docker Docs](https://docs.docker.com/)
- [Docker Compose Docs](https://docs.docker.com/compose/)
- [Best Practices](https://docs.docker.com/develop/dev-best-practices/)
