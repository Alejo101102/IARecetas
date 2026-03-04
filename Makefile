.PHONY: help build up down restart logs clean rebuild

help: ## Muestra este mensaje de ayuda
	@echo "Comandos disponibles:"
	@grep -E '^[a-zA-Z_-]+:.*?## .*$$' $(MAKEFILE_LIST) | awk 'BEGIN {FS = ":.*?## "}; {printf "  \033[36m%-15s\033[0m %s\n", $$1, $$2}'

build: ## Construir las imágenes Docker
	docker-compose build

up: ## Levantar los servicios (producción)
	docker-compose up -d
	@echo "✅ Servicios iniciados"
	@echo "Frontend: http://localhost:3000"
	@echo "Backend: http://localhost:5001"

up-dev: ## Levantar los servicios en modo desarrollo (con hot-reload)
	docker-compose -f docker-compose.dev.yml up
	@echo "✅ Servicios de desarrollo iniciados"
	@echo "Frontend: http://localhost:3000"
	@echo "Backend: http://localhost:5001"

down: ## Detener los servicios
	docker-compose down
	docker-compose -f docker-compose.dev.yml down

restart: down up ## Reiniciar los servicios

logs: ## Ver logs de todos los servicios
	docker-compose logs -f

logs-backend: ## Ver logs del backend
	docker-compose logs -f backend

logs-frontend: ## Ver logs del frontend
	docker-compose logs -f frontend

clean: ## Detener y eliminar contenedores, imágenes y volúmenes
	docker-compose down -v
	docker system prune -f

rebuild: ## Reconstruir y reiniciar todo
	docker-compose down
	docker-compose build --no-cache
	docker-compose up -d

ps: ## Ver estado de los contenedores
	docker-compose ps

shell-backend: ## Abrir shell en el contenedor del backend
	docker exec -it iarecetas-backend bash

shell-frontend: ## Abrir shell en el contenedor del frontend
	docker exec -it iarecetas-frontend sh

dev: ## Modo desarrollo (sin Docker)
	@echo "Iniciando modo desarrollo..."
	@echo "Backend: cd Backend && flask run"
	@echo "Frontend: cd Frontend && npm run dev"
