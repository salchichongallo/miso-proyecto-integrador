FROM python:3.10-alpine

WORKDIR /usr/src/app

# Keeps Python from generating .pyc files in the container
ENV PYTHONDONTWRITEBYTECODE=1

# Turns off buffering for easier container logging
ENV PYTHONUNBUFFERED=1

ENV PIPENV_VENV_IN_PROJECT=1

COPY Pipfile Pipfile.lock ./
RUN pip install pipenv --no-cache-dir && pipenv install --clear --system

COPY . .

ENV FLASK_APP=./src/main.py
ENV FLASK_RUN_PORT=3000
ENV FLASK_RUN_HOST=0.0.0.0
ENV VERSION='1.0'

CMD ["flask", "run"]
