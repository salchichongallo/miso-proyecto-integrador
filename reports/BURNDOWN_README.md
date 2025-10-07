# Burndown Chart Generator - Instrucciones de Uso

## Descripción
Script en Python para generar burndown charts automáticamente desde Jira. Obtiene datos de sprints y issues usando la API REST de Jira y genera gráficos visuales del progreso del sprint.

## Características
- 🔗 Conexión automática a Jira via API REST
- 📊 Generación de burndown charts con línea ideal vs real
- 🎨 Gráficos profesionales con matplotlib
- 📈 Métricas de progreso y completitud
- 🔧 Configuración flexible via variables de entorno
- 💼 Soporte para múltiples sprints y proyectos

## Instalación

### 1. Configurar entorno virtual (recomendado)
```bash
# Crear entorno virtual
python3 -m venv venv

# Activar entorno virtual
# En macOS/Linux:
source venv/bin/activate
# En Windows:
# venv\Scripts\activate

# Verificar que el entorno esté activo (debe mostrar (venv) al inicio)
which python
```

### 2. Instalar dependencias
```bash
pip install -r requirements.txt
```

### 3. Configurar credenciales de Jira
Copia el archivo de ejemplo y configura tus credenciales:
```bash
cp .env.example .env
```

Edita `.env` con tus datos (sin comillas ni export):
```bash
JIRA_SERVER_URL=https://tu-dominio.atlassian.net
JIRA_USERNAME=tu.email@empresa.com
JIRA_API_TOKEN=tu-api-token
JIRA_PROJECT_KEY=MISO
```

### 4. Generar API Token en Jira
1. Ve a https://id.atlassian.com/manage-profile/security/api-tokens
2. Clic en "Create API token"
3. Copia el token generado al archivo `.env`

## Uso

### Ejecutar el script
El script carga automáticamente las variables del archivo `.env`:
```bash
python burndown_chart.py
```

### Ejemplo de ejecución
```
🔥 Generador de Burndown Chart para Jira
==================================================
📋 Obteniendo sprints del proyecto: MISO

✅ Se encontraron 2 sprint(s):
1. 🟢 Sprint 1 - Desarrollo Core (active)
   📅 01/10/2025 - 15/10/2025
2. 🔵 Sprint 2 - Features Avanzadas (closed)
   📅 16/10/2025 - 30/10/2025

🎯 Selecciona un sprint (1-2): 1
📊 Obteniendo issues del sprint: Sprint 1 - Desarrollo Core
✅ Se encontraron 12 issue(s)

📈 Resumen:
   • Total Story Points: 34
   • Story Points Completados: 18
   • Issues Completados: 7/12

📊 Generando burndown chart...
Burndown chart guardado como: burndown_chart_Sprint_1_Desarrollo_Core_20251007_143025.pdf

✅ ¡Burndown chart generado exitosamente!
📁 Archivo: burndown_chart_Sprint_1_Desarrollo_Core_20251007_143025.pdf
```

## Estructura del Output

El script genera:
- **Gráfico PDF**: Burndown chart limpio con línea ideal vs real
- **Formato profesional**: PDF de alta calidad listo para presentaciones

## Formato del Gráfico

- **Línea Verde (punteada)**: Burndown ideal basado en días laborables
- **Línea Azul (sólida)**: Burndown real basado en issues completados
- **Diseño limpio**: Sin elementos adicionales, enfocado en los datos

## Configuración Avanzada

### Custom Fields para Story Points
El script detecta automáticamente story points en estos campos:
- `customfield_10016` (Jira Cloud default)
- `customfield_10004` (Jira Server común)
- `customfield_10008` (Alternativo)

### Estados de Issues Completados
Por defecto considera estos estados como "completado":
- Done
- Closed  
- Resolved

## Troubleshooting

### Error de autenticación
- Verifica que el API token sea correcto
- Asegúrate de usar tu email como username
- Confirma que la URL del servidor sea correcta

### No se encuentran sprints
- Verifica que la clave del proyecto sea correcta
- Asegúrate de tener permisos para ver el proyecto
- Confirma que existan sprints en el proyecto

### Issues sin story points
- El script asigna 0 puntos a issues sin story points
- Verifica la configuración de custom fields en Jira

## Ejemplos de Variables de Entorno

### Jira Cloud (.env)
```bash
JIRA_SERVER_URL=https://miempresa.atlassian.net
JIRA_USERNAME=juan.perez@empresa.com
JIRA_API_TOKEN=ATATT3xFfGF0123...
JIRA_PROJECT_KEY=MISO
```

### Jira Server On-Premise (.env)
```bash
JIRA_SERVER_URL=https://jira.empresa.com
JIRA_USERNAME=jperez
JIRA_API_TOKEN=password123
JIRA_PROJECT_KEY=PROJ
```

## Dependencias

- **requests**: Comunicación con API REST de Jira
- **matplotlib**: Generación de gráficos PDF de alta calidad
- **pandas**: Manipulación de datos
- **numpy**: Cálculos numéricos
- **python-dotenv**: Carga automática de variables de entorno

## Compatibilidad

- ✅ Jira Cloud
- ✅ Jira Server 8.0+
- ✅ Jira Data Center
- ✅ Python 3.7+
- ✅ macOS, Linux, Windows

## Contribuir

1. Fork el repositorio
2. Crea una branch para tu feature
3. Commit tus cambios
4. Push a la branch
5. Crea un Pull Request

## Licencia

MIT License - Ver archivo LICENSE para detalles.