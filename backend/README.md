# 🧩 MISO - Proyecto Integrador

Repositorio con los **microservicios del backend** del proyecto integrador.
Cada microservicio es independiente y debe ejecutarse dentro de su propio entorno virtual.

---

## ⚙️ Configuración inicial

```
# Crear entorno virtual
python -m venv env

# Activar entorno virtual
source env/bin/activate     # macOS / Linux
env\Scripts\activate        # Windows

# Instalar dependencias
pip install -r requirements.txt
```

---

## 📂 Navegar al microservicio

```
cd backend/user_microservice
```

---

## 🚀 Ejecutar el microservicio

```
FLASK_APP=src/main.py flask run -h 0.0.0.0 -p 3000
```

💡 Cambia el puerto (-p) según el microservicio para evitar conflictos.


## Ejecutar Test Backend

Desde la carpeta backend/, vamos a ejecutar:
```
pytest --cov=user_microservice/src --cov-report=html --cov-fail-under=70
```
