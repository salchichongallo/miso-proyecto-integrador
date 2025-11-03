#!/usr/bin/env python3
"""
Burndown Chart Generator for Jira Sprint

Este script genera un burndown chart basado en los datos de un sprint de Jira.
Utiliza la API REST de Jira para obtener información de issues y genera
un gráfico de burndown visual usando matplotlib.

Autor: Proyecto Integrador MISO
Fecha: Octubre 2025
"""

import os
import sys
import traceback
import datetime
from typing import Dict, List, Tuple, Optional
from dataclasses import dataclass
from collections import defaultdict

import requests
from requests.auth import HTTPBasicAuth
import matplotlib.pyplot as plt
import matplotlib.dates as mdates
import pandas as pd
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
class SprintData:
    """Datos del sprint"""
    id: int
    name: str
    state: str
    start_date: datetime.datetime
    end_date: datetime.datetime
    complete_date: Optional[datetime.datetime] = None


@dataclass
class IssueData:
    """Datos de un issue"""
    key: str
    summary: str
    story_points: float
    status: str
    created: datetime.datetime
    resolved: Optional[datetime.datetime] = None


class JiraBurndownGenerator:
    """Generador de burndown chart para Jira"""

    def __init__(self, config: JiraConfig):
        self.config = config
        self.session = requests.Session()
        self.session.auth = HTTPBasicAuth(config.username, config.api_token)
        self.session.headers.update({
            'Accept': 'application/json',
            'Content-Type': 'application/json'
        })

    def get_active_sprints(self) -> List[SprintData]:
        """Obtiene los sprints activos del proyecto"""
        url = f"{self.config.server_url}/rest/agile/1.0/board"

        try:
            # Primero obtenemos los boards del proyecto
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

            # Obtenemos sprints del primer board encontrado
            board_id = project_boards[0]['id']
            sprint_url = f"{self.config.server_url}/rest/agile/1.0/board/{board_id}/sprint"

            response = self.session.get(sprint_url, params={'state': 'active,closed'})
            response.raise_for_status()

            sprints_data = response.json().get('values', [])
            sprints = []

            for sprint_info in sprints_data:
                if sprint_info.get('startDate') and sprint_info.get('endDate'):
                    sprint = SprintData(
                        id=sprint_info['id'],
                        name=sprint_info['name'],
                        state=sprint_info['state'],
                        start_date=self._parse_jira_date(sprint_info['startDate']),
                        end_date=self._parse_jira_date(sprint_info['endDate']),
                        complete_date=self._parse_jira_date(sprint_info.get('completeDate')) if sprint_info.get('completeDate') else None
                    )
                    sprints.append(sprint)

            return sprints

        except requests.exceptions.RequestException as e:
            print(f"Error al obtener sprints: {e}")
            return []

    def get_sprint_issues(self, sprint_id: int) -> List[IssueData]:
        """Obtiene los issues de un sprint específico"""
        url = f"{self.config.server_url}/rest/agile/1.0/sprint/{sprint_id}/issue"

        try:
            all_issues = []
            start_at = 0
            max_results = 50

            while True:
                params = {
                    'startAt': start_at,
                    'maxResults': max_results,
                    'fields': 'summary,status,created,resolutiondate,customfield_10016'  # customfield_10016 es típicamente Story Points
                }

                response = self.session.get(url, params=params)
                response.raise_for_status()

                data = response.json()
                issues = data.get('issues', [])

                for issue in issues:
                    fields = issue['fields']

                    # Story points pueden estar en diferentes custom fields
                    story_points = self._extract_story_points(fields)

                    issue_data = IssueData(
                        key=issue['key'],
                        summary=fields['summary'],
                        story_points=story_points,
                        status=fields['status']['name'],
                        created=self._parse_jira_date(fields['created']),
                        resolved=self._parse_jira_date(fields['resolutiondate']) if fields.get('resolutiondate') else None
                    )
                    all_issues.append(issue_data)

                # Verificar si hay más páginas
                if start_at + max_results >= data['total']:
                    break

                start_at += max_results

            return all_issues

        except requests.exceptions.RequestException as e:
            print(f"Error al obtener issues del sprint: {e}")
            return []

    def generate_burndown_data(self, sprint: SprintData, issues: List[IssueData]) -> Tuple[List[datetime.datetime], List[float], List[float]]:
        """Genera los datos para el burndown chart"""

        # Calcular el total de story points
        total_story_points = sum(issue.story_points for issue in issues)

        # Crear fechas desde el inicio hasta el final del sprint
        current_date = sprint.start_date.date()
        end_date = (sprint.complete_date or sprint.end_date).date()

        dates = []
        remaining_points = []
        ideal_line = []

        # Calcular todos los días (incluyendo fines de semana)
        work_days = []
        temp_date = current_date
        while temp_date <= end_date:
            work_days.append(temp_date)
            temp_date += datetime.timedelta(days=1)

        total_work_days = len(work_days)

        # Generar línea ideal
        daily_ideal_burn = total_story_points / max(total_work_days - 1, 1)

        for i, date in enumerate(work_days):
            dates.append(datetime.datetime.combine(date, datetime.time()))
            ideal_points = max(0, total_story_points - (i * daily_ideal_burn))
            ideal_line.append(ideal_points)

            # Calcular puntos reales restantes
            completed_points = 0
            for issue in issues:
                if (issue.resolved and
                    issue.resolved.date() <= date and
                    issue.status.lower() in ['done', 'closed', 'resolved']):
                    completed_points += issue.story_points

            remaining = max(0, total_story_points - completed_points)
            remaining_points.append(remaining)

        return dates, remaining_points, ideal_line

    def generate_chart(self, sprint: SprintData, dates: List[datetime.datetime],
                      remaining_points: List[float], ideal_line: List[float],
                      output_file: str = None) -> str:
        """Genera el burndown chart en formato PDF"""

        plt.figure(figsize=(12, 7))

        # Configurar el gráfico limpio
        plt.plot(dates, ideal_line, 'g--', linewidth=2, label='Línea Ideal', alpha=0.8)
        plt.plot(dates, remaining_points, 'b-', linewidth=2, marker='o',
                markersize=5, label='Burndown Real')

        # Agregar labels a los valores de la línea real
        for i, (date, points) in enumerate(zip(dates, remaining_points)):
            if i % 2 == 0 or i == len(remaining_points) - 1:  # Mostrar cada 2 puntos + el último
                plt.annotate(f'{points:.0f}',
                           (date, points),
                           textcoords="offset points",
                           xytext=(0, 10),
                           ha='center',
                           fontsize=9,
                           color='darkblue',
                           weight='bold')

        # Agregar labels a valores clave de la línea ideal
        for i, (date, points) in enumerate(zip(dates, ideal_line)):
            if i == 0 or i == len(ideal_line) - 1:  # Mostrar solo inicio y final
                plt.annotate(f'{points:.0f}',
                           (date, points),
                           textcoords="offset points",
                           xytext=(0, -15),
                           ha='center',
                           fontsize=9,
                           color='darkgreen',
                           weight='bold')

        # Configuración de ejes
        plt.xlabel('Fecha')
        plt.ylabel('Story Points Restantes')
        plt.title(f'Burndown Chart - {sprint.name}')

        # Formatear fechas en el eje X
        plt.gca().xaxis.set_major_formatter(mdates.DateFormatter('%b %d'))
        plt.gca().xaxis.set_major_locator(mdates.DayLocator(interval=2))
        plt.xticks(rotation=45)

        # Grid y leyenda simples
        plt.grid(True, alpha=0.3)
        plt.legend()

        # Ajustar layout con más espacio para las etiquetas
        plt.tight_layout()

        # Generar nombre de archivo PDF
        if output_file is None:
            safe_sprint_name = "".join(c for c in sprint.name if c.isalnum() or c in (' ', '-', '_')).rstrip()
            safe_sprint_name = safe_sprint_name.replace(' ', '_')
            timestamp = datetime.datetime.now().strftime('%Y%m%d_%H%M%S')
            output_file = f"burndown_chart_{safe_sprint_name}_{timestamp}.pdf"
        elif not output_file.lower().endswith('.pdf'):
            output_file += '.pdf'

        # Guardar como PDF
        plt.savefig(output_file, format='pdf', dpi=300, bbox_inches='tight')
        print(f"Burndown chart guardado como: {output_file}")

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
    print("🔥 Generador de Burndown Chart para Jira")
    print("=" * 50)

    # Cargar configuración
    config = JiraConfig.from_env()

    # Verificar configuración
    if not all([config.server_url, config.username, config.api_token, config.project_key]):
        print("❌ Error: Configuración incompleta")
        print("\nConfigura las siguientes variables de entorno:")
        print("- JIRA_SERVER_URL: URL de tu servidor Jira")
        print("- JIRA_USERNAME: Tu username de Jira")
        print("- JIRA_API_TOKEN: Token de API de Jira")
        print("- JIRA_PROJECT_KEY: Clave del proyecto (ej: PROJ)")
        print("\nEjemplo:")
        print("export JIRA_SERVER_URL='https://tu-dominio.atlassian.net'")
        print("export JIRA_USERNAME='tu.email@empresa.com'")
        print("export JIRA_API_TOKEN='tu-api-token'")
        print("export JIRA_PROJECT_KEY='PROJ'")
        return 1

    try:
        # Crear generador
        generator = JiraBurndownGenerator(config)

        # Obtener sprints
        print(f"📋 Obteniendo sprints del proyecto: {config.project_key}")
        sprints = generator.get_active_sprints()

        if not sprints:
            print("❌ No se encontraron sprints")
            return 1

        # Mostrar sprints disponibles
        print(f"\n✅ Se encontraron {len(sprints)} sprint(s):")
        for i, sprint in enumerate(sprints):
            status_emoji = "🟢" if sprint.state == "active" else "🔵" if sprint.state == "closed" else "⚪"
            print(f"{i + 1}. {status_emoji} {sprint.name} ({sprint.state})")
            print(f"   📅 {sprint.start_date.strftime('%d/%m/%Y')} - {sprint.end_date.strftime('%d/%m/%Y')}")

        # Seleccionar sprint activo automáticamente
        active_sprints = [sprint for sprint in sprints if sprint.state == "active"]

        if active_sprints:
            selected_sprint = active_sprints[0]
            print(f"\n🎯 Sprint activo seleccionado automáticamente: {selected_sprint.name}")
        elif sprints:
            # Si no hay sprint activo, usar el más reciente (último cerrado)
            selected_sprint = sprints[-1]
            print(f"\n🎯 No hay sprint activo. Seleccionado el más reciente: {selected_sprint.name}")
        else:
            print("❌ No se encontraron sprints disponibles")
            return 1

        # Obtener issues del sprint
        print(f"\n📊 Obteniendo issues del sprint: {selected_sprint.name}")
        issues = generator.get_sprint_issues(selected_sprint.id)

        if not issues:
            print("❌ No se encontraron issues en el sprint")
            return 1

        print(f"✅ Se encontraron {len(issues)} issue(s)")

        # Generar datos del burndown
        print(f"\n📊 Generando burndown chart...")
        dates, remaining_points, ideal_line = generator.generate_burndown_data(selected_sprint, issues)

        # Generar chart
        output_file = generator.generate_chart(selected_sprint, dates, remaining_points, ideal_line)

        print(f"\n✅ ¡Burndown chart generado exitosamente!")
        print(f"📁 Archivo: {output_file}")

        return 0

    except Exception as e:
        print(f"\n❌ Error inesperado: {e}")
        traceback.print_exc()
        return 1


if __name__ == "__main__":
    # Verificar dependencias
    required_packages = ['requests', 'matplotlib', 'pandas', 'numpy', 'dotenv']
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
