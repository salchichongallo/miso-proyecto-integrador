# Usa la imagen base de Python
FROM python:3.11-slim

# Crea y define el directorio de trabajo
WORKDIR /app

# Copia dependencias y las instala
COPY requirements.txt /app/requirements.txt
RUN pip install --no-cache-dir -r /app/requirements.txt

# Copia el resto del código
COPY . /app

# Define variables de entorno
ENV FLASK_APP=src/main.py
ENV FLASK_RUN_HOST=0.0.0.0
ENV FLASK_RUN_PORT=3001
ENV FLASK_ENV=development

# Expone el puerto del microservicio
EXPOSE 3001

# Comando de ejecución (el mismo que usas tú)
CMD ["flask", "run"]
