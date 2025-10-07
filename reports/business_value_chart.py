#!/usr/bin/env python3
"""
Business Value Chart Generator for Jira Sprint

Este script genera un business value chart basado en los datos de múltiples sprints de Jira.
Muestra el valor de negocio acumulado real vs planeado por semana durante un período de 8 semanas.

Autor: Proyecto Integrador MISO
Fecha: Octubre 2025
"""

import os
import sys
import datetime
from typing import Dict, List, Optional
from dataclasses import dataclass

import requests
from requests.auth import HTTPBasicAuth
import matplotlib.pyplot as plt
import numpy as np
from dotenv import load_dotenv


@dataclass
class JiraConfig:
    """Configuración para conectar con Jira"""
    server_url: str
    username: str
    api_token: str
    project_key: str
    
    @classmethod
    def from_env(cls) -> 'JiraConfig':
        """Crea configuración desde variables de entorno"""
        # Cargar variables desde archivo .env
        load_dotenv()
        
        return cls(
            server_url=os.getenv('JIRA_SERVER_URL', 'https://your-domain.atlassian.net'),
            username=os.getenv('JIRA_USERNAME', ''),
            api_token=os.getenv('JIRA_API_TOKEN', ''),
            project_key=os.getenv('JIRA_PROJECT_KEY', '')
        )


@dataclass
class SprintBusinessValue:
    """Datos de valor de negocio de un sprint"""
    sprint_name: str
    week_number: int
    planned_value: float
    delivered_value: float
    start_date: datetime.datetime
    end_date: datetime.datetime


class JiraBusinessValueGenerator:
    """Generador de business value chart para Jira"""
    
    def __init__(self, config: JiraConfig):
        self.config = config
        self.session = requests.Session()
        self.session.auth = HTTPBasicAuth(config.username, config.api_token)
        self.session.headers.update({
            'Accept': 'application/json',
            'Content-Type': 'application/json'
        })
        self.business_value_field = None  # Cache del campo detectado
    
    def detect_business_value_field(self) -> Optional[str]:
        """Detecta automáticamente el campo de Business Value"""
        if self.business_value_field:
            return self.business_value_field
            
        try:
            # Obtener metadatos de creación para el tipo Story
            url = f"{self.config.server_url}/rest/api/2/issue/createmeta"
            params = {
                'projectKeys': self.config.project_key,
                'issuetypeNames': 'Story',
                'expand': 'projects.issuetypes.fields'
            }
            
            response = self.session.get(url, params=params)
            response.raise_for_status()
            
            data = response.json()
            projects = data.get('projects', [])
            
            for project in projects:
                issue_types = project.get('issuetypes', [])
                for issue_type in issue_types:
                    if issue_type.get('name', '').lower() == 'story':
                        fields = issue_type.get('fields', {})
                        
                        # Buscar campo que contenga "business value"
                        for field_key, field_info in fields.items():
                            field_name = field_info.get('name', '').lower()
                            if 'business value' in field_name or 'businessvalue' in field_name.replace(' ', ''):
                                print(f"✅ Campo Business Value detectado: {field_key} ({field_info.get('name')})")
                                self.business_value_field = field_key
                                return field_key
                                
            print("⚠️  No se detectó campo Business Value automáticamente, usando métodos alternativos")
            return None
            
        except Exception:
            print("⚠️  Error al detectar campo Business Value, usando métodos alternativos")
            return None
    
    def get_all_sprints_including_backlog(self, max_weeks: int = 8) -> List[Dict]:
        """Obtiene todos los sprints del proyecto incluyendo los del backlog"""
        url = f"{self.config.server_url}/rest/agile/1.0/board"
        
        try:
            # Obtener boards del proyecto
            response = self.session.get(url)
            response.raise_for_status()
            
            boards = response.json().get('values', [])
            project_boards = [
                board for board in boards 
                if self.config.project_key.lower() in board.get('location', {}).get('projectKey', '').lower()
            ]
            
            if not project_boards:
                print(f"No se encontraron boards para el proyecto {self.config.project_key}")
                return []
            
            # Obtener sprints del primer board encontrado
            board_id = project_boards[0]['id']
            sprint_url = f"{self.config.server_url}/rest/agile/1.0/board/{board_id}/sprint"
            
            # Obtener todos los sprints: activos, cerrados y futuros
            response = self.session.get(sprint_url, params={'state': 'active,closed,future'})
            response.raise_for_status()
            
            sprints_data = response.json().get('values', [])
            
            # Separar sprints completados/activos vs sprints del backlog
            completed_sprints = []
            backlog_sprints = []
            
            for sprint_info in sprints_data:
                sprint_name = sprint_info.get('name', '').lower()
                sprint_state = sprint_info.get('state', '').lower()
                
                # Sprints del backlog (Sprint X o futuros)
                if 'sprint' in sprint_name and (sprint_state == 'future' or not sprint_info.get('startDate')):
                    backlog_sprints.append(sprint_info)
                # Sprints completados o activos con fechas
                elif sprint_info.get('startDate') and sprint_info.get('endDate'):
                    sprint_info['startDate_parsed'] = self._parse_jira_date(sprint_info['startDate'])
                    sprint_info['endDate_parsed'] = self._parse_jira_date(sprint_info['endDate'])
                    completed_sprints.append(sprint_info)
            
            # Ordenar sprints completados por fecha de inicio (más reciente primero)
            completed_sprints.sort(key=lambda x: x['startDate_parsed'], reverse=True)
            
            # Ordenar sprints del backlog por nombre (Sprint 1, Sprint 2, etc.)
            backlog_sprints.sort(key=lambda x: x.get('name', ''))
            
            # Combinar: primero los completados (hasta max_weeks), luego los del backlog
            all_sprints = completed_sprints[:max_weeks-len(backlog_sprints)] + backlog_sprints
            
            print(f"📊 Sprints completados/activos: {len(completed_sprints)}")
            print(f"📋 Sprints en backlog: {len(backlog_sprints)}")
            
            return all_sprints[:max_weeks]
            
        except requests.exceptions.RequestException as e:
            print(f"Error al obtener sprints: {e}")
            return []
    
    def get_sprint_business_value_data(self, sprint_info: Dict, week_number: int) -> SprintBusinessValue:
        """Obtiene los datos de valor de negocio para un sprint específico"""
        sprint_id = sprint_info['id']
        sprint_name = sprint_info['name']
        sprint_state = sprint_info.get('state', '').lower()
        
        # Para sprints del backlog, usar fechas estimadas
        if sprint_state == 'future' or not sprint_info.get('startDate'):
            # Crear fechas dummy para sprints del backlog
            base_date = datetime.datetime.now()
            start_date = base_date + datetime.timedelta(weeks=week_number-1)
            end_date = start_date + datetime.timedelta(weeks=1)
        else:
            start_date = sprint_info['startDate_parsed']
            end_date = sprint_info['endDate_parsed']
        
        # Obtener issues del sprint
        url = f"{self.config.server_url}/rest/agile/1.0/sprint/{sprint_id}/issue"
        
        try:
            all_issues = []
            start_at = 0
            max_results = 50
            
            while True:
                params = {
                    'startAt': start_at,
                    'maxResults': max_results,
                    'fields': 'summary,status,issuetype,description,*all'  # Obtener todos los campos incluyendo description fields
                }
                
                response = self.session.get(url, params=params)
                response.raise_for_status()
                
                data = response.json()
                issues = data.get('issues', [])
                
                if not issues:
                    break
                
                all_issues.extend(issues)
                
                # Verificar si hay más páginas
                if start_at + max_results >= data['total']:
                    break
                
                start_at += max_results
            
            # Calcular valor de negocio planeado y entregado
            planned_value = 0
            delivered_value = 0
            
            for issue in all_issues:
                fields = issue['fields']
                issue_type = fields.get('issuetype', {}).get('name', '').lower()
                
                # Solo procesar si es una Story
                if 'story' in issue_type:
                    business_value = self._extract_business_value(fields, issue)
                    status = fields['status']['name'].lower()
                    
                    # Siempre sumar al valor planeado
                    planned_value += business_value
                    
                    # Para sprints del backlog, el valor entregado es 0
                    # Para sprints completados/activos, SOLO contar cuando el estado es "Done"
                    if sprint_state not in ['future'] and status == 'done':
                        delivered_value += business_value
            
            print(f"   📊 {sprint_name}: Planeado={planned_value:.1f}, Entregado={delivered_value:.1f} (Estado: {sprint_state})")
            
            return SprintBusinessValue(
                sprint_name=sprint_name,
                week_number=week_number,
                planned_value=planned_value,
                delivered_value=delivered_value,
                start_date=start_date,
                end_date=end_date
            )
            
        except requests.exceptions.RequestException as e:
            print(f"Error al obtener datos del sprint {sprint_name}: {e}")
            return SprintBusinessValue(sprint_name, week_number, 0, 0, 
                                    start_date, end_date)
    
    def generate_business_value_chart(self, business_values: List[SprintBusinessValue], output_file: str = None) -> str:
        """Genera el business value chart en formato PDF"""
        
        plt.figure(figsize=(14, 8))
        
        # Definir la estructura de sprints con sus duraciones
        sprint_structure = {
            1: {'name': 'Sprint 1', 'weeks': 2, 'positions': [1, 2]},
            2: {'name': 'Sprint 2', 'weeks': 2, 'positions': [3, 4]}, 
            3: {'name': 'Sprint 3', 'weeks': 3, 'positions': [5, 6, 7]}
        }
        
        # Crear mapeo de semanas por sprint
        week_to_sprint = {}
        for sprint_num, info in sprint_structure.items():
            for week_pos in info['positions']:
                week_to_sprint[week_pos] = sprint_num
        
        total_weeks = 7  # 2 + 2 + 3 semanas
        all_weeks = list(range(0, total_weeks + 1))  # Iniciar en 0
        
        # Agrupar business_values por sprint
        sprint_data = {}
        for bv in business_values:
            sprint_name = bv.sprint_name.lower()
            if 'sprint 1' in sprint_name:
                sprint_num = 1
            elif 'sprint 2' in sprint_name:
                sprint_num = 2
            elif 'sprint 3' in sprint_name:
                sprint_num = 3
            else:
                continue  # Ignorar sprints que no encajen en la estructura
            
            if sprint_num not in sprint_data:
                sprint_data[sprint_num] = {'planned': 0, 'delivered': 0}
            
            sprint_data[sprint_num]['planned'] += bv.planned_value
            sprint_data[sprint_num]['delivered'] += bv.delivered_value
        
        # Preparar datos acumulados distribuyendo por semanas
        cumulative_planned = [0]  # Iniciar en 0
        cumulative_delivered = [0]  # Iniciar en 0
        
        planned_total = 0
        delivered_total = 0
        
        for week in range(1, total_weeks + 1):
            sprint_num = week_to_sprint[week]
            sprint_info = sprint_structure[sprint_num]
            
            # En la primera semana del sprint, agregar todo el valor del sprint
            if week == sprint_info['positions'][0]:
                if sprint_num in sprint_data:
                    planned_total += sprint_data[sprint_num]['planned']
                    delivered_total += sprint_data[sprint_num]['delivered']
            
            cumulative_planned.append(planned_total)
            cumulative_delivered.append(delivered_total)
        
        # Crear las líneas del gráfico
        x = np.array(all_weeks)
        
        # Línea de valor planeado (acumulativo) - discontinua
        plt.plot(x, cumulative_planned, 'b--o', linewidth=2, 
                label='Planeado', markersize=6)
        
        # Línea de valor entregado (acumulativo)
        plt.plot(x, cumulative_delivered, 'r-s', linewidth=2, 
                label='Real', markersize=6)
        
        # Agregar líneas horizontales discontinuas para valores planeados únicos
        unique_planned_values = sorted(set(cumulative_planned))
        for value in unique_planned_values:
            if value > 0:  # No mostrar línea para el valor 0
                # Encontrar hasta qué semana llega este valor planeado
                max_week_for_value = 0
                for week, planned_val in zip(all_weeks, cumulative_planned):
                    if planned_val == value:
                        max_week_for_value = max(max_week_for_value, week)
                
                # Dibujar línea horizontal solo hasta donde llega el valor planeado
                plt.plot([0, max_week_for_value], [value, value], 
                        color='gray', linestyle=':', alpha=0.6, linewidth=1)
                
                # Agregar etiqueta en el eje Y solo si no es 100 (porque ya está en el eje)
                if value != 100:
                    plt.text(-0.05, value, f'{value:.0f}', 
                            ha='right', va='center', fontsize=9, color='gray')
        
        # Agregar etiquetas solo a los valores entregados (línea real)
        for i, (week, delivered) in enumerate(zip(all_weeks, cumulative_delivered)):
            # Etiqueta solo para valor entregado
            plt.annotate(f'{delivered:.0f}', (week, delivered), 
                        textcoords="offset points", xytext=(0,-15), ha='center', fontsize=9)
        
        # Configuración de ejes
        plt.xlabel('Tiempo', fontsize=12)
        plt.ylabel('Valor de negocio ganado', fontsize=12)
        plt.title('Business Value Chart', fontsize=14, fontweight='bold', pad=20)
        
        # Configurar etiquetas del eje X con sprints y sus semanas
        x_labels = ['\nInicio']  # Semana 0
        
        # Agregar etiquetas para cada sprint con sus semanas
        for sprint_num, info in sprint_structure.items():
            sprint_weeks = info['positions']
            for i, week_pos in enumerate(sprint_weeks):
                if i == 0:  # Primera semana del sprint
                    x_labels.append(f'\n{info["name"]}\nSemana {week_pos}')
                else:
                    x_labels.append(f'\nSemana {week_pos}')
        
        plt.xticks(all_weeks, x_labels, fontsize=10)
        
        # Configurar límites de los ejes para alineación correcta
        plt.xlim(0, max(all_weeks))  # Alinear exactamente con el origen (0,0)
        
        max_value = max(max(cumulative_planned), max(cumulative_delivered))
        if max_value > 0:
            plt.ylim(0, max_value * 1.15)  # 15% extra de espacio arriba
        else:
            plt.ylim(0, 100)  # Valor por defecto si no hay datos
        
        # Grid y leyenda
        plt.grid(True, alpha=0.3)
        plt.legend(loc='upper left')
        
        # Generar nombre de archivo PDF
        if output_file is None:
            timestamp = datetime.datetime.now().strftime('%Y%m%d_%H%M%S')
            output_file = f"business_value_chart_{timestamp}.pdf"
        elif not output_file.lower().endswith('.pdf'):
            output_file += '.pdf'
        
        # Guardar como PDF
        plt.savefig(output_file, format='pdf', dpi=300, bbox_inches='tight')
        print(f"Business value chart guardado como: {output_file}")
        
        return output_file
    
    def _parse_jira_date(self, date_str: str) -> Optional[datetime.datetime]:
        """Parsea fechas de Jira"""
        if not date_str:
            return None
        
        try:
            # Jira usa formato ISO con timezone
            if date_str.endswith('Z'):
                date_str = date_str[:-1] + '+00:00'
            
            return datetime.datetime.fromisoformat(date_str.replace('Z', '+00:00'))
        except ValueError:
            try:
                # Formato alternativo
                return datetime.datetime.strptime(date_str[:19], '%Y-%m-%dT%H:%M:%S')
            except ValueError:
                print(f"No se pudo parsear la fecha: {date_str}")
                return None
    
    def _extract_business_value(self, fields: Dict, issue: Dict = None) -> float:
        """Extrae business value de los campos del issue o description fields"""
        
        # Método 1: Usar el campo detectado automáticamente
        if self.business_value_field:
            value = fields.get(self.business_value_field)
            if value is not None:
                try:
                    return float(value)
                except (ValueError, TypeError):
                    pass
        
        # Método 2: Buscar en campos custom tradicionales (fallback)
        business_value_fields = [
            'customfield_10017',  # Business Value field común
            'customfield_10018',  # Alternativo
            'customfield_10019',  # Alternativo
            'businessValue',
            'business_value'
        ]
        
        for field in business_value_fields:
            value = fields.get(field)
            if value is not None:
                try:
                    return float(value)
                except (ValueError, TypeError):
                    continue
        
        # Método 2: Buscar en description fields del work type Story
        # Esto requiere hacer una llamada adicional para obtener los metadatos del issue type
        if issue:
            try:
                issue_key = issue.get('key', '')
                if issue_key:
                    # Obtener metadatos completos del issue incluyendo description fields
                    metadata_url = f"{self.config.server_url}/rest/api/2/issue/{issue_key}/editmeta"
                    response = self.session.get(metadata_url)
                    
                    if response.status_code == 200:
                        metadata = response.json()
                        
                        # Buscar en los fields del metadata si hay un campo Business Value
                        edit_fields = metadata.get('fields', {})
                        for field_key, field_info in edit_fields.items():
                            field_name = field_info.get('name', '').lower()
                            if 'business value' in field_name or 'businessvalue' in field_name.replace(' ', ''):
                                # Encontramos el campo, ahora obtener su valor del issue actual
                                field_value = fields.get(field_key)
                                if field_value is not None:
                                    try:
                                        return float(field_value)
                                    except (ValueError, TypeError):
                                        continue
                                        
            except Exception:
                # Si falla la búsqueda en metadata, continuar con otros métodos
                pass
        
        # Método 3: Buscar patrón en la descripción (último recurso)
        description = fields.get('description', '')
        if description:
            # Buscar patrones como "Business Value: 5" o "BV: 5" en la descripción
            import re
            patterns = [
                r'business\s*value\s*:?\s*(\d+(?:\.\d+)?)',
                r'bv\s*:?\s*(\d+(?:\.\d+)?)',
                r'valor\s*negocio\s*:?\s*(\d+(?:\.\d+)?)',
                r'valor\s*de\s*negocio\s*:?\s*(\d+(?:\.\d+)?)'
            ]
            
            for pattern in patterns:
                match = re.search(pattern, description.lower())
                if match:
                    try:
                        return float(match.group(1))
                    except (ValueError, TypeError):
                        continue
        
        return 0.0


def main():
    """Función principal"""
    print("💰 Generador de Business Value Chart para Jira")
    print("=" * 50)
    
    # Cargar configuración
    config = JiraConfig.from_env()
    
    # Verificar configuración
    if not all([config.server_url, config.username, config.api_token, config.project_key]):
        print("❌ Error: Configuración incompleta")
        print("\nConfigura las siguientes variables en el archivo .env:")
        print("- JIRA_SERVER_URL: URL de tu servidor Jira")
        print("- JIRA_USERNAME: Tu username de Jira")
        print("- JIRA_API_TOKEN: Token de API de Jira")
        print("- JIRA_PROJECT_KEY: Clave del proyecto (ej: PROJ)")
        return 1
    
    try:
        # Crear generador
        generator = JiraBusinessValueGenerator(config)
        
        # Detectar campo de Business Value
        print("🔍 Detectando campo Business Value...")
        generator.detect_business_value_field()
        
        # Obtener todos los sprints incluyendo backlog
        print(f"📋 Obteniendo todos los sprints del proyecto: {config.project_key}")
        sprints = generator.get_all_sprints_including_backlog(max_weeks=8)
        
        if not sprints:
            print("❌ No se encontraron sprints")
            return 1
        
        print(f"✅ Se encontraron {len(sprints)} sprint(s)")
        
        # Generar datos de valor de negocio
        business_values = []
        
        # Separar sprints completados vs backlog para asignar semanas correctamente
        completed_sprints = [s for s in sprints if s.get('startDate') and s.get('state', '').lower() in ['closed', 'active']]
        backlog_sprints = [s for s in sprints if s.get('state', '').lower() == 'future' or not s.get('startDate')]
        
        # Procesar sprints completados (semanas más tempranas)
        for i, sprint_info in enumerate(completed_sprints):
            week_number = i + 1
            print(f"💼 Procesando {sprint_info['name']} (Semana {week_number}) - Completado")
            
            value_data = generator.get_sprint_business_value_data(sprint_info, week_number)
            business_values.append(value_data)
        
        # Procesar sprints del backlog (semanas siguientes)
        for i, sprint_info in enumerate(backlog_sprints):
            week_number = len(completed_sprints) + i + 1
            if week_number <= 8:  # Solo hasta semana 8
                print(f"� Procesando {sprint_info['name']} (Semana {week_number}) - Backlog")
                
                value_data = generator.get_sprint_business_value_data(sprint_info, week_number)
                business_values.append(value_data)
        
        # Ordenar por semana
        business_values.sort(key=lambda x: x.week_number)
        
        # Mostrar resumen
        print("\n💰 Resumen de valor de negocio:")
        cumulative_planned = 0
        cumulative_delivered = 0
        
        for bv in business_values:
            cumulative_planned += bv.planned_value
            cumulative_delivered += bv.delivered_value
            sprint_type = "📋 Backlog" if bv.delivered_value == 0 and bv.planned_value > 0 else "✅ Completado"
            print(f"  Semana {bv.week_number}: {cumulative_delivered:.1f}/{cumulative_planned:.1f} acumulado - {bv.sprint_name} ({sprint_type})")
        
        total_planned = sum(bv.planned_value for bv in business_values)
        total_delivered = sum(bv.delivered_value for bv in business_values)
        completion_percentage = (total_delivered / total_planned * 100) if total_planned > 0 else 0
        
        print(f"\n📊 Resumen Total:")
        print(f"   • Valor Total Planeado: {total_planned:.1f}")
        print(f"   • Valor Total Entregado: {total_delivered:.1f}")
        print(f"   • Porcentaje Completado: {completion_percentage:.1f}%")
        
        # Generar chart
        print("\n📊 Generando business value chart...")
        output_file = generator.generate_business_value_chart(business_values)
        
        print("\n✅ ¡Business value chart generado exitosamente!")
        print(f"📁 Archivo: {output_file}")
        
        return 0
        
    except Exception as e:
        print(f"\n❌ Error inesperado: {e}")
        return 1


if __name__ == "__main__":
    # Verificar dependencias
    required_packages = ['requests', 'matplotlib', 'numpy', 'dotenv']
    missing_packages = []
    
    for package in required_packages:
        try:
            if package == 'dotenv':
                __import__('dotenv')
            else:
                __import__(package)
        except ImportError:
            if package == 'dotenv':
                missing_packages.append('python-dotenv')
            else:
                missing_packages.append(package)
    
    if missing_packages:
        print("❌ Faltan dependencias requeridas:")
        print(f"Instala con: pip install {' '.join(missing_packages)}")
        sys.exit(1)
    
    sys.exit(main())