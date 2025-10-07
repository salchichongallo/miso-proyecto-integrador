#!/usr/bin/env python3
"""
Velocity Chart Generator for Jira Sprint

Este script genera un velocity chart basado en los datos de múltiples sprints de Jira.
Muestra la velocidad real vs planeada por semana durante un período de hasta 8 semanas.

Autor: Proyecto Integrador MISO
Fecha: Octubre 2025
"""

import os
import sys
import datetime
from typing import Dict, List, Tuple, Optional
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
class SprintVelocity:
    """Datos de velocidad de un sprint"""
    sprint_name: str
    week_number: int
    planned_points: float
    completed_points: float
    start_date: datetime.datetime
    end_date: datetime.datetime


class JiraVelocityGenerator:
    """Generador de velocity chart para Jira"""
    
    def __init__(self, config: JiraConfig):
        self.config = config
        self.session = requests.Session()
        self.session.auth = HTTPBasicAuth(config.username, config.api_token)
        self.session.headers.update({
            'Accept': 'application/json',
            'Content-Type': 'application/json'
        })
    
    def get_recent_sprints(self, max_weeks: int = 8) -> List[Dict]:
        """Obtiene los sprints recientes del proyecto"""
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
            
            response = self.session.get(sprint_url, params={'state': 'active,closed'})
            response.raise_for_status()
            
            sprints_data = response.json().get('values', [])
            
            # Filtrar y ordenar sprints por fecha
            valid_sprints = []
            for sprint_info in sprints_data:
                if sprint_info.get('startDate') and sprint_info.get('endDate'):
                    sprint_info['startDate_parsed'] = self._parse_jira_date(sprint_info['startDate'])
                    sprint_info['endDate_parsed'] = self._parse_jira_date(sprint_info['endDate'])
                    valid_sprints.append(sprint_info)
            
            # Ordenar por fecha de inicio (más reciente primero)
            valid_sprints.sort(key=lambda x: x['startDate_parsed'], reverse=True)
            
            # Tomar solo los últimos N sprints
            return valid_sprints[:max_weeks]
            
        except requests.exceptions.RequestException as e:
            print(f"Error al obtener sprints: {e}")
            return []
    
    def get_sprint_velocity_data(self, sprint_info: Dict, week_number: int) -> SprintVelocity:
        """Obtiene los datos de velocidad para un sprint específico"""
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
                    'fields': 'summary,status,customfield_10016'  # Story Points
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
            
            # Calcular puntos planeados y completados
            planned_points = 0
            completed_points = 0
            
            for issue in all_issues:
                fields = issue['fields']
                story_points = self._extract_story_points(fields)
                status = fields['status']['name'].lower()
                
                planned_points += story_points
                
                if status in ['done', 'closed', 'resolved']:
                    completed_points += story_points
            
            return SprintVelocity(
                sprint_name=sprint_name,
                week_number=week_number,
                planned_points=planned_points,
                completed_points=completed_points,
                start_date=sprint_info['startDate_parsed'],
                end_date=sprint_info['endDate_parsed']
            )
            
        except requests.exceptions.RequestException as e:
            print(f"Error al obtener datos del sprint {sprint_name}: {e}")
            return SprintVelocity(sprint_name, week_number, 0, 0, 
                                sprint_info['startDate_parsed'], 
                                sprint_info['endDate_parsed'])
    
    def generate_velocity_chart(self, velocities: List[SprintVelocity], output_file: str = None) -> str:
        """Genera el velocity chart en formato PDF"""
        
        plt.figure(figsize=(12, 8))
        
        # Siempre mostrar 8 semanas completas
        all_weeks = list(range(1, 9))  # Semanas 1 a 8
        
        # Crear diccionarios para mapear datos por semana
        velocity_data = {v.week_number: v for v in velocities}
        
        # Preparar datos completos para todas las 8 semanas
        planned_points = []
        completed_points = []
        
        for week in all_weeks:
            if week in velocity_data:
                planned_points.append(velocity_data[week].planned_points)
                completed_points.append(velocity_data[week].completed_points)
            else:
                planned_points.append(0)  # Sin datos para esta semana
                completed_points.append(0)
        
        # Configurar posiciones de las barras para las 8 semanas
        x = np.arange(len(all_weeks))
        width = 0.35  # Ancho de las barras
        
        # Crear barras
        bars1 = plt.bar(x - width/2, planned_points, width, label='Planeado', 
                       color='lightblue', alpha=0.8, edgecolor='blue')
        bars2 = plt.bar(x + width/2, completed_points, width, label='Real', 
                       color='lightgreen', alpha=0.8, edgecolor='green')
        
        # Agregar labels a las barras
        for bar, points in zip(bars1, planned_points):
            height = bar.get_height()
            if height > 0:
                plt.annotate(f'{points:.0f}',
                           xy=(bar.get_x() + bar.get_width() / 2, height),
                           xytext=(0, 3),
                           textcoords="offset points",
                           ha='center', va='bottom',
                           fontsize=9, color='darkblue', weight='bold')
        
        for bar, points in zip(bars2, completed_points):
            height = bar.get_height()
            if height > 0:
                plt.annotate(f'{points:.0f}',
                           xy=(bar.get_x() + bar.get_width() / 2, height),
                           xytext=(0, 3),
                           textcoords="offset points",
                           ha='center', va='bottom',
                           fontsize=9, color='darkgreen', weight='bold')
        
        # Configuración de ejes
        plt.xlabel('Semanas')
        plt.ylabel('Puntos de Historia')
        plt.title('Velocity Chart - Planeado vs Real')
        
        # Configurar etiquetas del eje X para las 8 semanas
        plt.xticks(x, [f'Semana {w}' for w in all_weeks])
        
        # Grid y leyenda
        plt.grid(True, alpha=0.3, axis='y')
        plt.legend()
        
        # Agregar línea de tendencia para puntos completados (solo semanas con datos)
        if len(velocities) > 1:
            # Filtrar solo las semanas que tienen datos reales
            weeks_with_data = []
            points_with_data = []
            for i, week in enumerate(all_weeks):
                if week in velocity_data and velocity_data[week].completed_points > 0:
                    weeks_with_data.append(i)
                    points_with_data.append(velocity_data[week].completed_points)
            
            if len(weeks_with_data) > 1:
                z = np.polyfit(weeks_with_data, points_with_data, 1)
                p = np.poly1d(z)
                plt.plot(x, p(x), "r--", alpha=0.7, linewidth=1, label='Tendencia Real')
                plt.legend()
        
        # Ajustar layout
        plt.tight_layout()
        
        # Generar nombre de archivo PDF
        if output_file is None:
            timestamp = datetime.datetime.now().strftime('%Y%m%d_%H%M%S')
            output_file = f"velocity_chart_{timestamp}.pdf"
        elif not output_file.lower().endswith('.pdf'):
            output_file += '.pdf'
        
        # Guardar como PDF
        plt.savefig(output_file, format='pdf', dpi=300, bbox_inches='tight')
        print(f"Velocity chart guardado como: {output_file}")
        
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
    
    def _extract_story_points(self, fields: Dict) -> float:
        """Extrae story points de los campos del issue"""
        # Campos comunes para story points
        story_point_fields = [
            'customfield_10016',  # Jira Cloud default
            'customfield_10004',  # Jira Server common
            'customfield_10008',  # Alternative
            'storyPoints',
            'story_points'
        ]
        
        for field in story_point_fields:
            value = fields.get(field)
            if value is not None:
                try:
                    return float(value)
                except (ValueError, TypeError):
                    continue
        
        return 0.0


def main():
    """Función principal"""
    print("📈 Generador de Velocity Chart para Jira")
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
        generator = JiraVelocityGenerator(config)
        
        # Obtener sprints recientes
        print(f"📋 Obteniendo sprints recientes del proyecto: {config.project_key}")
        sprints = generator.get_recent_sprints(max_weeks=8)
        
        if not sprints:
            print("❌ No se encontraron sprints")
            return 1
        
        print(f"✅ Se encontraron {len(sprints)} sprint(s)")
        
        # Generar datos de velocidad
        velocities = []
        for i, sprint_info in enumerate(sprints):
            week_number = len(sprints) - i  # Semana 1 es la más antigua
            print(f"📊 Procesando {sprint_info['name']} (Semana {week_number})")
            
            velocity_data = generator.get_sprint_velocity_data(sprint_info, week_number)
            velocities.append(velocity_data)
        
        # Ordenar por semana
        velocities.sort(key=lambda x: x.week_number)
        
        # Mostrar resumen
        print(f"\n📈 Resumen de velocidades:")
        for vel in velocities:
            print(f"  Semana {vel.week_number}: {vel.completed_points:.0f}/{vel.planned_points:.0f} pts ({vel.sprint_name})")
        
        # Generar chart
        print(f"\n📊 Generando velocity chart...")
        output_file = generator.generate_velocity_chart(velocities)
        
        print(f"\n✅ ¡Velocity chart generado exitosamente!")
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