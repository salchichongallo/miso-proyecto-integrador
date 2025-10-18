# 🧩 MISO - Proyecto Integrador

Este repositorio contiene los **microservicios del backend** del proyecto integrador.
Cada microservicio es independiente y puede ejecutarse localmente o dentro de contenedores Docker.

---

## ⚙️ Configuración Inicial (Modo Local)

### 1️⃣ Crear y activar entorno virtual

```bash
# Crear entorno virtual
python -m venv env

# Activar entorno virtual
source env/bin/activate     # macOS / Linux
env\Scripts\activate        # Windows
```

### 2️⃣ Instalar dependencias

```bash
pip install -r requirements.txt
```

---

## 📂 Estructura del Proyecto

```
backend/
│
├── client_microservice/
├── vendor_microservice/
├── user_microservice/
├── docker-compose.yml
└── README.md
```

Cada microservicio incluye su propio `Dockerfile`, `requirements.txt` y carpeta `src/` con la aplicación Flask.

---

## 🚀 Ejecutar un microservicio manualmente (sin Docker)

Ejemplo con **user_microservice**:

```bash
cd backend/user_microservice
FLASK_APP=src/main.py flask run -h 0.0.0.0 -p 3000
```

💡 Cambia el puerto (`-p`) según el microservicio:

| Microservicio       | Puerto |
| ------------------- | ------ |
| user_microservice   | 3000   |
| client_microservice | 3001   |
| vendor_microservice | 3002   |

---

## 🧪 Ejecutar Tests

Desde la carpeta del microservicio:

### ✅ Pruebas unitarias

```bash
pytest tests/unit -v --cov --cov-report=term-missing --cov-report=html --cov-fail-under=70 --color=yes --cov-config unit.coveragerc
```

### 🔄 Pruebas de integración

```bash
pytest tests/integration -v --cov --cov-config integration.coveragerc --cov-report=term-missing --cov-report=html --cov-fail-under=70 --color=yes
```

### 🧩 Todos los tests juntos

```bash
pytest tests -v --cov=src --cov-report=html --cov-fail-under=70
```

Los reportes HTML se generan en la carpeta `htmlcov/`.

---

## 🐳 Ejecución con Docker Compose

Para levantar **todos los microservicios y DynamoDB Local**, desde la carpeta raíz del backend:

```bash
cd backend
docker compose up --build
```

### 🧹 Si deseas limpiar la caché y reconstruir todo

```bash
docker compose down -v --remove-orphans
docker compose build --no-cache
docker compose up
```

---

## 🔎 Servicios Disponibles

| Servicio              | Puerto Local | Descripción                             |
| --------------------- | ------------ | --------------------------------------- |
| `user_microservice`   | 3000         | Gestión de usuarios                     |
| `client_microservice` | 3001         | Gestión de clientes institucionales     |
| `vendor_microservice` | 3002         | Gestión de vendedores                   |
| `dynamodb-local`      | 8000         | Base de datos local simulada            |
| `dynamodb-admin`      | 8001         | Interfaz web para visualizar las tablas |

---

## 🌍 Acceso a DynamoDB Admin

Abre en tu navegador:
👉 [http://localhost:8001](http://localhost:8001)

Podrás ver las tablas creadas (`Clients`, `Vendors`, etc.) desde DynamoDB Local.

---

## 🧾 Notas

- Cada microservicio se conecta automáticamente a DynamoDB local o AWS dependiendo de las variables de entorno.
- Los logs de Flask se muestran en consola.
- En producción, recuerda usar un servidor WSGI (ej. Gunicorn) en lugar del `flask run` de desarrollo.

---

✍️ **Autor:** Jhorman Andrés Galindo Polanía
🎓 _Universidad de los Andes — Maestría en Ingeniería de Software_
