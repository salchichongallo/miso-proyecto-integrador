FROM public.ecr.aws/docker/library/python:3.12-alpine

WORKDIR /app

RUN apk add --no-cache curl

# Evita generar archivos .pyc y habilita logs en tiempo real
ENV PYTHONDONTWRITEBYTECODE=1
ENV PYTHONUNBUFFERED=1

COPY requirements.txt ./
RUN pip install --no-cache-dir --disable-pip-version-check -r requirements.txt

COPY . .

EXPOSE 3005

CMD ["gunicorn", "--bind", "0.0.0.0:3005", "src.main:app"]
