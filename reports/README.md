# Generador de Reportes Jira - MISO

Conjunto de scripts en Python para generar reportes automáticamente desde Jira. Obtiene datos de sprints y issues usando la API REST de Jira y genera gráficos visuales profesionales.

## 📊 Reportes Disponibles

### 1. 🔥 Burndown Chart
- **Propósito**: Mostrar el progreso del sprint actual vs línea ideal
- **Eje X**: Fechas (todos los días del sprint)
- **Eje Y**: Story Points restantes
- **Características**: 
  - Línea ideal vs progreso real
  - Labels con valores en puntos clave
  - Incluye fines de semana en el cálculo

### 2. 📈 Velocity Chart  
- **Propósito**: Mostrar la velocidad del equipo por semanas
- **Eje X**: Semanas consecutivas (Semana 1, 2, 3... hasta 8)
- **Eje Y**: Story Points
- **Características**:
  - Barras comparativas: Planeado vs Real
  - Análisis de hasta 8 semanas anteriores
  - Línea de tendencia para velocidad real
  - Labels con valores en cada barra

## 🚀 Instalación y Configuración

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
```bash
# Copiar archivo de ejemplo
cp .env.example .env

# Editar .env con tus credenciales (sin comillas)
JIRA_SERVER_URL=https://tu-dominio.atlassian.net
JIRA_USERNAME=tu.email@empresa.com
JIRA_API_TOKEN=tu-api-token
JIRA_PROJECT_KEY=MISO
```

### 4. Generar API Token en Jira
1. Ve a https://id.atlassian.com/manage-profile/security/api-tokens
2. Clic en "Create API token"
3. Copia el token generado al archivo `.env`

## 📱 Uso de los Scripts

### Opción 1: Script Principal (Recomendado)
```bash
python generate_reports.py
```

Este script muestra un menú interactivo para seleccionar el tipo de reporte:
```
📊 Generador de Reportes Jira - MISO
========================================
Selecciona el tipo de reporte a generar:

1. 🔥 Burndown Chart
   - Progreso del sprint actual vs línea ideal
   - Muestra story points restantes por día

2. 📈 Velocity Chart
   - Velocidad del equipo por semanas (hasta 8)
   - Compara puntos planeados vs completados

0. ❌ Salir
```

### Opción 2: Scripts Individuales
```bash
# Para burndown chart
python burndown_chart.py

# Para velocity chart  
python velocity_chart.py
```

## 📁 Estructura de Archivos

```
reports/
├── .env.example              # Plantilla de configuración
├── .gitignore               # Exclusiones para git
├── requirements.txt         # Dependencias del proyecto
├── generate_reports.py      # Script principal con menú
├── burndown_chart.py       # Generador de burndown chart
├── velocity_chart.py       # Generador de velocity chart
└── README.md               # Esta documentación
```

## 📊 Output Generado

Todos los reportes se generan como archivos PDF de alta calidad:

- **burndown_chart_[sprint]_[timestamp].pdf**: Gráfico de burndown
- **velocity_chart_[timestamp].pdf**: Gráfico de velocidad

## 🛠 Configuración Avanzada

### Custom Fields para Story Points
Los scripts detectan automáticamente story points en estos campos:
- `customfield_10016` (Jira Cloud default)
- `customfield_10004` (Jira Server común)
- `customfield_10008` (Alternativo)

### Estados de Issues Completados
Por defecto considera estos estados como "completado":
- Done
- Closed  
- Resolved

### Ejemplos de Configuración

#### Jira Cloud (.env)
```bash
JIRA_SERVER_URL=https://miempresa.atlassian.net
JIRA_USERNAME=juan.perez@empresa.com
JIRA_API_TOKEN=ATATT3xFfGF0123...
JIRA_PROJECT_KEY=MISO
```

#### Jira Server On-Premise (.env)
```bash
JIRA_SERVER_URL=https://jira.empresa.com
JIRA_USERNAME=jperez
JIRA_API_TOKEN=password123
JIRA_PROJECT_KEY=PROJ
```

## 🔧 Dependencias

- **requests**: Comunicación con API REST de Jira
- **matplotlib**: Generación de gráficos PDF de alta calidad
- **pandas**: Manipulación de datos (burndown chart)
- **numpy**: Cálculos numéricos
- **python-dotenv**: Carga automática de variables de entorno

## 🚨 Troubleshooting

### Error de autenticación
- Verifica que el API token sea correcto
- Asegúrate de usar tu email como username
- Confirma que la URL del servidor sea correcta

### No se encuentran sprints
- Verifica que la clave del proyecto sea correcta
- Asegúrate de tener permisos para ver el proyecto
- Confirma que existan sprints en el proyecto

### Issues sin story points
- Los scripts asignan 0 puntos a issues sin story points
- Verifica la configuración de custom fields en Jira

## 🔮 Próximos Reportes

La arquitectura está preparada para agregar fácilmente nuevos tipos de reportes:
- Cumulative Flow Diagram
- Sprint Retrospective Charts
- Team Performance Reports
- Release Burnup Charts

## 🤝 Contribuir

1. Fork el repositorio
2. Crea una branch para tu feature
3. Commit tus cambios
4. Push a la branch
5. Crea un Pull Request

## ⚙️ Compatibilidad

- ✅ Jira Cloud
- ✅ Jira Server 8.0+
- ✅ Jira Data Center
- ✅ Python 3.7+
- ✅ macOS, Linux, Windows

## 📄 Licencia

MIT License - Ver archivo LICENSE para detalles.