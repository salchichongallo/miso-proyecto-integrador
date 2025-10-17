# 🐍 Imagen base ligera
FROM public.ecr.aws/docker/library/python:3.12-alpine

# 📁 Directorio de trabajo
WORKDIR /app

# ⚙️ Configuraciones para evitar archivos .pyc y habilitar logs inmediatos
ENV PYTHONDONTWRITEBYTECODE=1
ENV PYTHONUNBUFFERED=1

# 📦 Instala dependencias
COPY requirements.txt ./
RUN pip install --no-cache-dir --disable-pip-version-check -r requirements.txt

# 📂 Copia el código fuente
COPY . .

# 🔧 Variables de entorno Flask (aunque Gunicorn las usa indirectamente)
ENV FLASK_APP=src/main.py
ENV FLASK_ENV=development

# 🌐 Expone el puerto de tu microservicio (cliente)
EXPOSE 3001

# 🚀 Comando de ejecución con Gunicorn
CMD ["gunicorn", "--bind", "0.0.0.0:3001", "src.main:app"]
