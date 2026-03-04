# Usa una imagen base de Python
FROM python:3.11-slim

# Establece el directorio de trabajo
WORKDIR /app

# Copia el archivo de dependencias
COPY requirements.txt .

# Instala las dependencias
RUN pip install --no-cache-dir -r requirements.txt

# Copia todo el código del backend
COPY . .

# Expone el puerto donde correrá Flask
EXPOSE 5000

# Variables de entorno
ENV FLASK_APP=app.py
ENV PYTHONUNBUFFERED=1

# Comando para ejecutar la aplicación con gunicorn
CMD ["gunicorn", "--bind", "0.0.0.0:5000", "--workers", "4", "--timeout", "120", "app:app"]
