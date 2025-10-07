# 🚀 GitHub Actions Workflow - Jira Reports Generator

Este workflow de GitHub Actions permite generar automáticamente los 4 tipos de reportes de Jira usando secrets y variables de entorno para mayor seguridad.

## 📋 Reportes Generados

1. **🔥 Burndown Chart** - Progreso del sprint vs línea ideal
2. **📈 Velocity Chart** - Velocidad del equipo por semanas
3. **💰 Business Value Chart** - Valor de negocio acumulado
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

### Ejecución Automática
El workflow también se ejecuta automáticamente:
- **Todos los lunes a las 8:00 AM UTC**
- Puedes modificar el schedule en el archivo `.github/workflows/generate-reports.yml`

## 📁 Descargar Reportes

Una vez completado el workflow, encontrarás los PDFs generados en la sección **"Artifacts"**:

- **`burndown-chart`** - PDF del Burndown Chart
- **`velocity-chart`** - PDF del Velocity Chart  
- **`business-value-chart`** - PDF del Business Value Chart
- **`release-burndown-chart`** - PDF del Release Burndown Chart
- **`all-jira-reports`** - ZIP con todos los reportes

## 🔧 Cómo Obtener el API Token de Jira

1. Ve a [Atlassian Account Settings](https://id.atlassian.com/manage-profile/security/api-tokens)
2. Haz clic en **"Create API token"**
3. Dale un nombre descriptivo (ej: "GitHub Actions Reports")
4. Copia el token generado (guárdalo en lugar seguro)
5. Úsalo como valor del secret **JIRA_API_TOKEN**

## 🔒 Ventajas de Usar Secrets

### Seguridad Mejorada
- ✅ **Credenciales encriptadas** - Los secrets están encriptados en GitHub
- ✅ **No visible en logs** - Los secrets se enmascaran automáticamente en logs
- ✅ **Acceso controlado** - Solo usuarios con permisos pueden ver/editar secrets
- ✅ **No hardcodeado** - Credenciales nunca aparecen en el código fuente

### Conveniencia
- ✅ **Una sola configuración** - Configuras una vez y funciona siempre
- ✅ **Ejecución automática** - Programada para ejecutarse semanalmente
- ✅ **Sin intervención manual** - No necesitas ingresar datos cada vez

## ⚠️ Consideraciones de Seguridad

- **NO** hardcodees credenciales en el código fuente
- **SÍ** usa GitHub Secrets para información sensible
- Los tokens se pasan como variables de entorno temporales durante la ejecución
- Los artifacts se eliminan automáticamente después de 30 días
- Solo usuarios con acceso de escritura al repo pueden ver los secrets

## 🛠️ Características Técnicas

### Entorno
- **OS**: Ubuntu Latest
- **Python**: 3.9
- **Dependencies**: Automáticamente instaladas desde `requirements.txt`

### Tolerancia a Fallos
- Cada reporte se genera independientemente
- Si un reporte falla, los otros continúan
- Resumen detallado del estado de cada reporte

### Optimizaciones
- **Caché de dependencias** para ejecuciones más rápidas
- **Parallel uploads** de artifacts
- **Retention policy** de 30 días para artifacts

## 📊 Monitoreo y Logs

El workflow genera un **resumen visual** que incluye:
- ✅/❌ Estado de cada reporte
- 📁 Links de descarga
- 🕒 Timestamp de generación
- 📋 Información del proyecto

## 🔄 Automatización Futura

Este workflow se puede extender fácilmente para:
- **Ejecución programada** (cron schedule)
- **Triggers por commits** o releases
- **Notificaciones** por email o Slack
- **Publicación** en GitHub Pages o SharePoint

---

## 🎯 Ejemplo de Uso

```yaml
# Parámetros de ejemplo para el workflow
Jira Server URL: https://miempresa.atlassian.net
Jira Username: desarrollador@miempresa.com
Jira API Token: ATATT3xFfGF0T8...
Jira Project Key: MISO
```

Esto generará reportes para el proyecto "MISO" y los subirá como artifacts descargables.