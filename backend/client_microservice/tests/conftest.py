import os
import sys
from dotenv import load_dotenv

# --- Configuración de paths ---
CURRENT_DIR = os.path.dirname(__file__)
PROJECT_ROOT = os.path.abspath(os.path.join(CURRENT_DIR, ".."))
SRC_PATH = os.path.join(PROJECT_ROOT, "src")
sys.path.insert(0, PROJECT_ROOT)
sys.path.insert(0, SRC_PATH)

load_dotenv(os.path.join(PROJECT_ROOT, ".env"))
