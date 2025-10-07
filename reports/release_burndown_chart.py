#!/usr/bin/env python3
"""
Release Burndown Chart Generator for Jira Sprint

Este script genera un release burndown chart basado en los datos de múltiples sprints de Jira.
Muestra la cantidad de story points restantes al inicio de cada sprint para visualizar
el progreso hacia la meta del release.

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
class SprintReleaseData:
    """Datos de release burndown para un sprint"""
    sprint_name: str
    sprint_number: int
    remaining_points: float
    completed_points: float
    total_scope: float
    start_date: datetime.datetime
    end_date: datetime.datetime


class JiraReleaseBurndownGenerator:
    """Generador de release burndown chart para Jira"""
    
    def __init__(self, config: JiraConfig):
        self.config = config
        self.session = requests.Session()
        self.session.auth = HTTPBasicAuth(config.username, config.api_token)
        self.session.headers.update({
            'Accept': 'application/json',
            'Content-Type': 'application/json'
        })
        self.story_points_field = None  # Cache del campo detectado
    
    def detect_story_points_field(self) -> Optional[str]:
        """Detecta automáticamente el campo de Story Points"""
        if self.story_points_field:
            return self.story_points_field
            
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
                        
                        # Buscar campo que contenga "story points"
                        for field_key, field_info in fields.items():
                            field_name = field_info.get('name', '').lower()
                            if 'story point' in field_name or 'storypoint' in field_name.replace(' ', ''):
                                print(f"✅ Campo Story Points detectado: {field_key} ({field_info.get('name')})")
                                self.story_points_field = field_key
                                return field_key
                                
            print("⚠️  No se detectó campo Story Points automáticamente, usando métodos alternativos")
            return None
            
        except Exception:
            print("⚠️  Error al detectar campo Story Points, usando métodos alternativos")
            return None
    
    def get_all_sprints(self, max_sprints: int = 10) -> List[Dict]:
        """Obtiene todos los sprints del proyecto ordenados cronológicamente"""
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
            
            # Filtrar y procesar sprints
            valid_sprints = []
            
            for sprint_info in sprints_data:
                sprint_name = sprint_info.get('name', '').lower()
                
                # Solo incluir sprints numerados (Sprint 1, Sprint 2, etc.)
                if 'sprint' in sprint_name:
                    # Parsear fechas si existen
                    if sprint_info.get('startDate') and sprint_info.get('endDate'):
                        sprint_info['startDate_parsed'] = self._parse_jira_date(sprint_info['startDate'])
                        sprint_info['endDate_parsed'] = self._parse_jira_date(sprint_info['endDate'])
                    
                    valid_sprints.append(sprint_info)
            
            # Ordenar sprints por nombre (Sprint 1, Sprint 2, etc.)
            valid_sprints.sort(key=lambda x: self._extract_sprint_number(x.get('name', '')))
            
            print(f"📊 Se encontraron {len(valid_sprints)} sprints válidos")
            
            return valid_sprints[:max_sprints]
            
        except requests.exceptions.RequestException as e:
            print(f"Error al obtener sprints: {e}")
            return []
    
    def _extract_sprint_number(self, sprint_name: str) -> int:
        """Extrae el número del sprint del nombre"""
        import re
        match = re.search(r'sprint\s*(\d+)', sprint_name.lower())
        return int(match.group(1)) if match else 999
    
    def get_sprint_release_data(self, sprint_info: Dict, sprint_number: int, total_scope: float) -> SprintReleaseData:
        """Obtiene los datos de release burndown para un sprint específico"""
        sprint_id = sprint_info['id']
        sprint_name = sprint_info['name']
        sprint_state = sprint_info.get('state', '').lower()
        
        # Usar fechas del sprint si están disponibles
        if sprint_info.get('startDate_parsed') and sprint_info.get('endDate_parsed'):
            start_date = sprint_info['startDate_parsed']
            end_date = sprint_info['endDate_parsed']
        else:
            # Crear fechas dummy
            base_date = datetime.datetime.now()
            start_date = base_date + datetime.timedelta(weeks=(sprint_number-1)*2)
            end_date = start_date + datetime.timedelta(weeks=2)
        
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
                    'fields': 'summary,status,issuetype,*all'
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
            
            # Calcular story points completados en este sprint
            completed_points = 0
            
            for issue in all_issues:
                fields = issue['fields']
                issue_type = fields.get('issuetype', {}).get('name', '').lower()
                
                # Solo procesar si es una Story
                if 'story' in issue_type:
                    story_points = self._extract_story_points(fields, issue)
                    status = fields['status']['name'].lower()
                    
                    # Solo contar cuando el estado es "Done"
                    if status == 'done':
                        completed_points += story_points
            
            print(f"   📊 {sprint_name}: Completado={completed_points:.1f} puntos (Estado: {sprint_state})")
            
            return SprintReleaseData(
                sprint_name=sprint_name,
                sprint_number=sprint_number,
                remaining_points=0,  # Se calculará después
                completed_points=completed_points,
                total_scope=total_scope,
                start_date=start_date,
                end_date=end_date
            )
            
        except requests.exceptions.RequestException as e:
            print(f"Error al obtener datos del sprint {sprint_name}: {e}")
            return SprintReleaseData(sprint_name, sprint_number, 0, 0, total_scope, 
                                   start_date, end_date)
    
    def calculate_total_scope(self, sprints: List[Dict]) -> float:
        """Calcula el scope total del release sumando todos los story points"""
        total_points = 0
        
        print("🔍 Calculando scope total del release...")
        
        for sprint_info in sprints:
            sprint_id = sprint_info['id']
            sprint_name = sprint_info['name']
            
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
                        'fields': 'summary,status,issuetype,*all'
                    }
                    
                    response = self.session.get(url, params=params)
                    response.raise_for_status()
                    
                    data = response.json()
                    issues = data.get('issues', [])
                    
                    if not issues:
                        break
                    
                    all_issues.extend(issues)
                    
                    if start_at + max_results >= data['total']:
                        break
                    
                    start_at += max_results
                
                # Sumar story points del sprint
                sprint_points = 0
                for issue in all_issues:
                    fields = issue['fields']
                    issue_type = fields.get('issuetype', {}).get('name', '').lower()
                    
                    if 'story' in issue_type:
                        story_points = self._extract_story_points(fields, issue)
                        sprint_points += story_points
                
                total_points += sprint_points
                print(f"   • {sprint_name}: {sprint_points:.1f} puntos")
                
            except requests.exceptions.RequestException as e:
                print(f"Error al procesar {sprint_name}: {e}")
        
        print(f"📊 Scope total del release: {total_points:.1f} story points")
        return total_points
    
    def generate_release_burndown_chart(self, release_data: List[SprintReleaseData], output_file: str = None) -> str:
        """Genera el release burndown chart en formato PDF"""
        
        plt.figure(figsize=(12, 8))
        
        # Preparar datos
        sprint_names = [rd.sprint_name for rd in release_data]
        sprint_numbers = list(range(len(release_data) + 1))  # Incluir punto inicial
        
        # Calcular puntos restantes al inicio de cada sprint
        remaining_points = []
        total_scope = release_data[0].total_scope if release_data else 0
        
        # Punto inicial (antes del Sprint 1)
        remaining_points.append(total_scope)
        
        # Calcular para cada sprint
        cumulative_completed = 0
        for rd in release_data:
            cumulative_completed += rd.completed_points
            remaining = total_scope - cumulative_completed
            remaining_points.append(max(0, remaining))  # No permitir valores negativos
        
        # Actualizar los datos de release_data con remaining_points calculados
        for i, rd in enumerate(release_data):
            rd.remaining_points = remaining_points[i + 1]
        
        # Crear el gráfico
        x = np.array(sprint_numbers)
        
        # Línea de burndown real
        plt.plot(x, remaining_points, 'b-o', linewidth=3, 
                label='Story Points Restantes', markersize=8)
        
        # Línea ideal de burndown (línea recta desde el total hasta 0)
        if len(sprint_numbers) > 1:
            ideal_line = np.linspace(total_scope, 0, len(sprint_numbers))
            plt.plot(x, ideal_line, 'r--', linewidth=2, alpha=0.7,
                    label='Burndown Ideal')
        
        # Agregar etiquetas a los valores
        for i, (sprint_num, points) in enumerate(zip(sprint_numbers, remaining_points)):
            plt.annotate(f'{points:.0f}', (sprint_num, points), 
                        textcoords="offset points", xytext=(0,10), 
                        ha='center', fontsize=10, fontweight='bold')
        
        # Configuración de ejes
        plt.xlabel('Sprints', fontsize=12)
        plt.ylabel('Story Points Restantes', fontsize=12)
        plt.title('Release Burndown Chart', fontsize=14, fontweight='bold', pad=20)
        
        # Configurar etiquetas del eje X
        x_labels = ['Inicio'] + [f'Sprint {i+1}' for i in range(len(release_data))]
        plt.xticks(sprint_numbers, x_labels, fontsize=10)
        
        # Configurar límites del eje Y
        max_value = max(remaining_points) if remaining_points else 100
        plt.ylim(0, max_value * 1.1)  # 10% extra de espacio arriba
        
        # Configurar límites del eje X - alinear exactamente con el origen (0,0)
        plt.xlim(0, max(sprint_numbers))
        
        # Grid y leyenda
        plt.grid(True, alpha=0.3)
        plt.legend(loc='upper right')
        
        # Generar nombre de archivo PDF
        if output_file is None:
            timestamp = datetime.datetime.now().strftime('%Y%m%d_%H%M%S')
            output_file = f"release_burndown_chart_{timestamp}.pdf"
        elif not output_file.lower().endswith('.pdf'):
            output_file += '.pdf'
        
        # Guardar como PDF
        plt.savefig(output_file, format='pdf', dpi=300, bbox_inches='tight')
        print(f"Release burndown chart guardado como: {output_file}")
        
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
    
    def _extract_story_points(self, fields: Dict, issue: Dict = None) -> float:
        """Extrae story points de los campos del issue"""
        
        # Método 1: Usar el campo detectado automáticamente
        if self.story_points_field:
            value = fields.get(self.story_points_field)
            if value is not None:
                try:
                    return float(value)
                except (ValueError, TypeError):
                    pass
        
        # Método 2: Buscar en campos custom tradicionales
        story_points_fields = [
            'customfield_10016',  # Story Points field común
            'customfield_10020',  # Alternativo
            'customfield_10021',  # Alternativo
            'storyPoints',
            'story_points'
        ]
        
        for field in story_points_fields:
            value = fields.get(field)
            if value is not None:
                try:
                    return float(value)
                except (ValueError, TypeError):
                    continue
        
        # Método 3: Buscar en la descripción como último recurso
        description = fields.get('description', '')
        if description:
            import re
            patterns = [
                r'story\s*point[s]?\s*:?\s*(\d+(?:\.\d+)?)',
                r'sp\s*:?\s*(\d+(?:\.\d+)?)',
                r'puntos?\s*:?\s*(\d+(?:\.\d+)?)'
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
    print("📈 Generador de Release Burndown Chart para Jira")
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
        generator = JiraReleaseBurndownGenerator(config)
        
        # Detectar campo de Story Points
        print("🔍 Detectando campo Story Points...")
        generator.detect_story_points_field()
        
        # Obtener todos los sprints
        print(f"📋 Obteniendo sprints del proyecto: {config.project_key}")
        sprints = generator.get_all_sprints(max_sprints=10)
        
        if not sprints:
            print("❌ No se encontraron sprints")
            return 1
        
        print(f"✅ Se encontraron {len(sprints)} sprint(s)")
        
        # Calcular scope total del release
        total_scope = generator.calculate_total_scope(sprints)
        
        if total_scope == 0:
            print("⚠️  Advertencia: El scope total es 0. Verifica que los sprints tengan story points.")
        
        # Generar datos de release burndown
        release_data = []
        
        for i, sprint_info in enumerate(sprints):
            sprint_number = i + 1
            print(f"💼 Procesando {sprint_info['name']} (Sprint {sprint_number})")
            
            data = generator.get_sprint_release_data(sprint_info, sprint_number, total_scope)
            release_data.append(data)
        
        # Mostrar resumen
        print(f"\n📊 Resumen de Release Burndown:")
        cumulative_completed = 0
        
        for rd in release_data:
            cumulative_completed += rd.completed_points
            remaining = total_scope - cumulative_completed
            completion_percentage = (cumulative_completed / total_scope * 100) if total_scope > 0 else 0
            
            print(f"  {rd.sprint_name}: {remaining:.0f} puntos restantes ({completion_percentage:.1f}% completado)")
        
        # Generar chart
        print("\n📈 Generando release burndown chart...")
        output_file = generator.generate_release_burndown_chart(release_data)
        
        print("\n✅ ¡Release burndown chart generado exitosamente!")
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