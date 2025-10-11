# Usa una imagen base ligera de Python
FROM python:3.10-alpine

# Establece el directorio de trabajo dentro del contenedor
WORKDIR /usr/src/app

# Evita generar archivos .pyc y habilita logs en tiempo real
ENV PYTHONDONTWRITEBYTECODE=1
ENV PYTHONUNBUFFERED=1

# Copia el archivo requirements.txt primero (para aprovechar la caché de Docker)
COPY requirements.txt ./

# Instala las dependencias del proyecto
RUN pip install --no-cache-dir -r requirements.txt

# Copia el resto del código fuente
COPY . .

# Variables de entorno para Flask
ENV FLASK_APP=./src/main.py
ENV FLASK_RUN_PORT=3000
ENV FLASK_RUN_HOST=0.0.0.0
ENV VERSION='1.0'

# Expone el puerto de Flask
EXPOSE 3000

# Comando de ejecución
CMD ["flask", "run"]
