# Etapa 1: Build de la aplicación React
FROM node:20-alpine AS build

WORKDIR /app

# Copia los archivos de dependencias
COPY package*.json ./

# Instala las dependencias
RUN npm ci

# Copia el resto del código
COPY . .

# Construye la aplicación para producción
RUN npm run build

# Etapa 2: Servir la aplicación con nginx
FROM nginx:alpine

# Copia los archivos construidos desde la etapa anterior
COPY --from=build /app/dist /usr/share/nginx/html

# Copia configuración personalizada de nginx si la necesitas
COPY nginx.conf /etc/nginx/conf.d/default.conf

# Expone el puerto 80
EXPOSE 80

# Comando por defecto de nginx
CMD ["nginx", "-g", "daemon off;"]
