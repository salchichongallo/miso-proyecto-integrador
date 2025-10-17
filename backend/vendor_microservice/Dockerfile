# 🐍 Imagen base ligera y moderna
FROM public.ecr.aws/docker/library/python:3.12-alpine

# 📁 Establece el directorio de trabajo dentro del contenedor
WORKDIR /app

# ⚙️ Configuración para evitar archivos .pyc y mostrar logs en tiempo real
ENV PYTHONDONTWRITEBYTECODE=1
ENV PYTHONUNBUFFERED=1

# 📦 Copia e instala dependencias primero (mejor uso del cache de Docker)
COPY requirements.txt ./
RUN pip install --no-cache-dir --disable-pip-version-check -r requirements.txt

# 📂 Copia el resto del código fuente
COPY . .

# 🔧 Variables de entorno
ENV FLASK_APP=src/main.py
ENV FLASK_ENV=development
ENV APP_VERSION="1.0"
ENV APP_PORT=3002

# 🌐 Expone el puerto del microservicio
EXPOSE ${APP_PORT}

# 🚀 Comando de ejecución con Gunicorn
CMD ["sh", "-c", "gunicorn --bind 0.0.0.0:${APP_PORT} src.main:app"]
