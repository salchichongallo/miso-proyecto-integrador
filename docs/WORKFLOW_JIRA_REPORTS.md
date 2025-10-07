# 🚀 GitHub Actions Workflow - Jira Reports Generator

Este workflow de GitHub Actions permite generar automáticamente los 4 tipos de reportes de Jira en un solo archivo ZIP descargable usando secrets y variables de entorno para mayor seguridad.

## 📋 Reportes Generados

1. **🔥 Burndown Chart** - Progreso del sprint vs línea ideal
2. **📈 Velocity Chart** - Velocidad del equipo por semanas  
3. **💰 Business Value Chart** - Valor de negocio acumulado por sprints
4. **📉 Release Burndown Chart** - Story points restantes por sprint

## 🔐 Configuración de Secrets

### Paso 1: Configurar Repository Secrets
Ve a **Settings → Secrets and variables → Actions** y crea los siguientes secrets:

| Secret Name | Descripción | Ejemplo |
|-------------|-------------|---------|
| `JIRA_SERVER_URL` | URL de tu instancia de Jira | `https://your-company.atlassian.net` |
| `JIRA_USERNAME` | Tu email/username de Jira | `tu-email@empresa.com` |
| `JIRA_API_TOKEN` | Token de API de Jira | `ATATT3xFfGF0T8...` |
| `JIRA_PROJECT_KEY` | Clave del proyecto | `PROJ` |

### Paso 2: Crear los Secrets
1. En GitHub, ve a tu repositorio
2. Haz clic en **Settings**
3. En el sidebar izquierdo, haz clic en **Secrets and variables → Actions**
4. Haz clic en **New repository secret** para cada uno
5. Ingresa el nombre exacto del secret y su valor

## 🎯 Cómo Ejecutar el Workflow

### Ejecución Manual
1. Ve a tu repositorio en GitHub
2. Haz clic en la pestaña **"Actions"**
3. Busca el workflow **"Generate Jira Reports"**
4. Haz clic en **"Run workflow"**
5. Confirma la ejecución (no necesitas ingresar parámetros)

### Ejecución Programada (Opcional)
Puedes configurar ejecución automática editando el trigger en `.github/workflows/generate-reports.yml`:

```yaml
on:
  workflow_dispatch:  # Ejecución manual
```

## 📦 Descargar Reportes

Una vez completado el workflow, encontrarás un **archivo ZIP único** en la sección **"Artifacts"**:

### 🎯 Artefacto Principal
- **`jira-reports-archive`** - Archivo ZIP con timestamp que contiene todos los PDFs generados

### 📁 Contenido del ZIP
El archivo ZIP incluye (cuando están disponibles):
- `burndown_chart_YYYYMMDD_HHMMSS.pdf`
- `velocity_chart_YYYYMMDD_HHMMSS.pdf`
- `business_value_chart_YYYYMMDD_HHMMSS.pdf`
- `release_burndown_chart_YYYYMMDD_HHMMSS.pdf`

### 💡 Ventajas del ZIP Único
- ✅ **Una sola descarga** - Todos los reportes en un archivo
- ✅ **Timestamp único** - Identificación clara de la ejecución
- ✅ **Organización** - Más fácil de gestionar y distribuir
- ✅ **Eficiencia** - Menor consumo de storage y bandwidth

## 🔧 Cómo Obtener el API Token de Jira

1. Ve a [Atlassian Account Settings](https://id.atlassian.com/manage-profile/security/api-tokens)
2. Haz clic en **"Create API token"**
3. Dale un nombre descriptivo (ej: "GitHub Actions Reports")
4. Copia el token generado (guárdalo en lugar seguro)
5. Úsalo como valor del secret **JIRA_API_TOKEN**

## 🔒 Seguridad y Mejores Prácticas

### Seguridad Mejorada
- ✅ **Credenciales encriptadas** - Los secrets están encriptados en GitHub
- ✅ **No visible en logs** - Los secrets se enmascaran automáticamente
- ✅ **Acceso controlado** - Solo usuarios con permisos pueden ver/editar secrets
- ✅ **No hardcodeado** - Credenciales nunca aparecen en el código fuente
- ✅ **Variables de entorno** - Uso directo sin archivos temporales

### Conveniencia
- ✅ **Una sola configuración** - Configuras una vez y funciona siempre
- ✅ **Ejecución on-demand** - Ejecuta cuando lo necesites
- ✅ **Sin intervención manual** - No necesitas ingresar datos cada vez
- ✅ **Archivos organizados** - ZIP con timestamp único

## ⚠️ Consideraciones Importantes

### Seguridad
- **NO** hardcodees credenciales en el código fuente
- **SÍ** usa GitHub Secrets para información sensible
- Los tokens se pasan como variables de entorno durante la ejecución
- Los artifacts se eliminan automáticamente después de 90 días

### Limitaciones
- Requiere acceso a la API de Jira con permisos de lectura
- Los campos customizados deben estar configurados correctamente
- La configuración de sprints debe seguir la convención esperada

## 🛠️ Características Técnicas

### Entorno de Ejecución
- **OS**: Ubuntu Latest
- **Python**: 3.9
- **Dependencies**: Automáticamente instaladas desde `requirements.txt`
- **Artifacts**: `actions/upload-artifact@v4`

### Tolerancia a Fallos
- ✅ Cada reporte se genera independientemente
- ✅ Si un reporte falla, los otros continúan
- ✅ Resumen detallado del estado de cada reporte
- ✅ ZIP se crea incluso si algunos reportes fallan

### Optimizaciones
- **Caché de dependencias** para ejecuciones más rápidas
- **Archivo ZIP único** para eficiencia de descarga
- **Retention policy** de 90 días para artifacts
- **Continue-on-error** para mayor robustez

## 📊 Monitoreo y Logs

El workflow genera un **resumen visual** que incluye:
- ✅/❌ Estado de cada reporte generado
- 📁 Información del archivo ZIP creado
- 🕒 Timestamp de generación
- 📋 Información del proyecto Jira
- 📊 Cantidad de reportes incluidos en el ZIP

## 🔄 Personalización Avanzada

### Modificar Retención de Artifacts
```yaml
retention-days: 90  # Cambiar según necesidades
```

### Agregar Ejecución Programada
```yaml
on:
  schedule:
    - cron: '0 9 * * 1'  # Lunes 9:00 AM UTC
```

### Configurar Notificaciones (Futuro)
El workflow se puede extender para:
- **Notificaciones** por email o Slack
- **Publicación** en GitHub Pages
- **Integración** con otros sistemas de reporting

## 🎯 Ejemplo de Configuración

```yaml
# Secrets requeridos en GitHub
JIRA_SERVER_URL: "https://miempresa.atlassian.net"
JIRA_USERNAME: "desarrollador@miempresa.com"  
JIRA_API_TOKEN: "ATATT3xFfGF0T8..."
JIRA_PROJECT_KEY: "MISO"
```

### Resultado Esperado
- **Archivo ZIP**: `jira_reports_20251007_143022.zip`
- **Contenido**: 4 PDFs con reportes actualizados
- **Ubicación**: Artifacts section en GitHub Actions
- **Retención**: 90 días automáticamente

---

## 📚 Documentación Adicional

- **Código fuente**: `.github/workflows/generate-reports.yml`
- **Scripts de reportes**: `reports/` directory
- **Configuración**: Este documento
- **Troubleshooting**: Ver logs del workflow en Actions tab

> 💡 **Tip**: Este workflow está optimizado para el proyecto MISO pero puede adaptarse fácilmente a otros proyectos de Jira cambiando los secrets correspondientes.