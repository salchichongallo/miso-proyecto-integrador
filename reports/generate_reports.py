#!/usr/bin/env python3
"""
Generador Principal de Reportes Jira

Script principal que permite generar diferentes tipos de reportes desde Jira.
Actualmente soporta:
- Burndown Chart
- Velocity Chart

Autor: Proyecto Integrador MISO
Fecha: Octubre 2025
"""

import sys
import subprocess
from dotenv import load_dotenv


def show_menu():
    """Muestra el menú de opciones"""
    print("📊 Generador de Reportes Jira - MISO")
    print("=" * 40)
    print("Selecciona el tipo de reporte a generar:")
    print()
    print("1. 🔥 Burndown Chart")
    print("   - Progreso del sprint actual vs línea ideal")
    print("   - Muestra story points restantes por día")
    print()
    print("2. 📈 Velocity Chart") 
    print("   - Velocidad del equipo por semanas (hasta 8)")
    print("   - Compara puntos planeados vs completados")
    print()
    print("3. 💰 Business Value Chart")
    print("   - Valor de negocio acumulado por semanas (hasta 8)")
    print("   - Compara valor planeado vs entregado")
    print()
    print("4. 📉 Release Burndown Chart")
    print("   - Story points restantes al inicio de cada sprint")
    print("   - Progreso hacia la meta del release")
    print()
    print("0. ❌ Salir")
    print()


def run_script(script_name: str) -> int:
    """Ejecuta un script específico"""
    try:
        print(f"\n🚀 Ejecutando {script_name}...")
        print("=" * 50)
        
        result = subprocess.run([sys.executable, script_name], 
                              capture_output=False, 
                              text=True)
        
        return result.returncode
        
    except FileNotFoundError:
        print(f"❌ Error: No se encontró el archivo {script_name}")
        return 1
    except Exception as e:
        print(f"❌ Error ejecutando {script_name}: {e}")
        return 1


def main():
    """Función principal"""
    # Cargar variables de entorno
    load_dotenv()
    
    while True:
        show_menu()
        
        try:
            choice = input("👉 Ingresa tu opción (0-4): ").strip()
            
            if choice == '0':
                print("\n👋 ¡Hasta luego!")
                return 0
            
            elif choice == '1':
                return run_script('burndown_chart.py')
            
            elif choice == '2':
                return run_script('velocity_chart.py')
            
            elif choice == '3':
                return run_script('business_value_chart.py')
            
            elif choice == '4':
                return run_script('release_burndown_chart.py')
            
            else:
                print("❌ Opción inválida. Por favor selecciona 0, 1, 2, 3 o 4.")
                input("\n📱 Presiona Enter para continuar...")
                print("\n" * 2)  # Limpiar pantalla
                
        except KeyboardInterrupt:
            print("\n\n👋 Operación cancelada por el usuario")
            return 0
        except EOFError:
            print("\n\n👋 ¡Hasta luego!")
            return 0


if __name__ == "__main__":
    sys.exit(main())