import boto3
import io
import uuid
import re
import logging
import pandas as pd
import time
from botocore.exceptions import ClientError
from .base_command import BaseCommannd
from ..errors.errors import ApiError
from ..models.db import REGION, DYNAMODB_ENDPOINT, TABLE_NAME

logger = logging.getLogger(__name__)


class CreateProvidersBulk(BaseCommannd):
    """
    Comando para registrar proveedores de forma masiva a partir de un archivo CSV o Excel.
    Basado en la HU: MS-76 - Registro masivo de proveedores.
    """

    def __init__(self, file_bytes, filename):
        self.file_bytes = file_bytes
        self.filename = filename

        # 🔗 Conexión a DynamoDB
        if DYNAMODB_ENDPOINT:
            logger.info(f"🔗 Conectando a DynamoDB local en {DYNAMODB_ENDPOINT}")
            self.dynamodb = boto3.resource(
                "dynamodb",
                region_name=REGION,
                endpoint_url=DYNAMODB_ENDPOINT,
                aws_access_key_id="dummy",
                aws_secret_access_key="dummy"
            )
        else:
            logger.info(f"🌍 Conectando a DynamoDB real en AWS región {REGION}")
            self.dynamodb = boto3.resource("dynamodb", region_name=REGION)

        self.table = self.dynamodb.Table(TABLE_NAME)

    # ----------------------------------------------------------
    def execute(self):
        """Ejecuta el proceso completo de carga masiva."""
        start = time.time()
        try:
            df = self._read_file()
            result = self._process(df)
            result["tiempo_seg"] = round(time.time() - start, 2)
            return result
        except Exception as e:
            logger.error(f"❌ Error en carga masiva: {e}")
            raise ApiError(str(e))

    # ----------------------------------------------------------
    def _read_file(self):
        """Lee el archivo CSV o Excel usando Pandas."""
        try:
            if self.filename.endswith(".csv"):
                df = pd.read_csv(io.BytesIO(self.file_bytes))
            elif self.filename.endswith(".xlsx"):
                df = pd.read_excel(io.BytesIO(self.file_bytes))
            else:
                raise ApiError("Formato de archivo no soportado. Usa CSV o XLSX.")
        except Exception as e:
            raise ApiError(f"Error al leer el archivo: {e}")

        expected = {"name", "country", "nit", "address", "email", "phone"}
        missing = expected - set(df.columns.str.lower())
        if missing:
            raise ApiError(f"Faltan columnas obligatorias: {', '.join(missing)}")

        # Normalizamos los nombres de columnas (por si vienen con mayúsculas)
        df.columns = df.columns.str.lower().str.strip()

        # Convertir valores a string para evitar errores en validaciones
        for col in ["nit", "phone"]:
            df[col] = df[col].astype(str).fillna("")

        return df

    # ----------------------------------------------------------
    def _process(self, df: pd.DataFrame):
        """Valida y guarda los proveedores en DynamoDB."""
        valid_records = []
        invalid_records = []

        for _, row in df.iterrows():
            name = str(row.get("name", "")).strip()
            country = str(row.get("country", "")).strip().upper()
            nit = str(row.get("nit", "")).strip()
            address = str(row.get("address", "")).strip()
            email = str(row.get("email", "")).strip().lower()
            phone = str(row.get("phone", "")).strip()

            # Validaciones
            if not all([name, country, nit, address, email, phone]):
                invalid_records.append({**row.to_dict(), "error": "Campos obligatorios faltantes"})
                continue

            if not re.match(r"^\d{10}$", nit):
                invalid_records.append({**row.to_dict(), "error": "NIT inválido (10 dígitos requeridos)"})
                continue

            if not re.match(r"^[\w\.-]+@[\w\.-]+\.\w+$", email):
                invalid_records.append({**row.to_dict(), "error": "Email inválido"})
                continue

            if not re.match(r"^\d{10}$", phone):
                invalid_records.append({**row.to_dict(), "error": "Teléfono inválido (10 dígitos requeridos)"})
                continue

            # Duplicados en DynamoDB
            try:
                response = self.table.get_item(Key={"nit": nit})
                if "Item" in response:
                    invalid_records.append({**row.to_dict(), "error": "Duplicado (NIT ya existe)"})
                    continue
            except ClientError as e:
                invalid_records.append({**row.to_dict(), "error": f"Error DynamoDB: {e}"})
                continue

            # Si pasa todas las validaciones
            valid_records.append({
                "provider_id": str(uuid.uuid4()),
                "nit": nit,
                "name": name,
                "country": country,
                "address": address,
                "email": email,
                "phone": phone
            })

        # Guardar válidos en lote
        if valid_records:
            with self.table.batch_writer() as batch:
                for item in valid_records:
                    batch.put_item(Item=item)

        total = len(df)
        success = len(valid_records)
        rate = (success / total) * 100 if total > 0 else 0

        return {
            "total_registros": total,
            "registros_exitosos": success,
            "registros_rechazados": len(invalid_records),
            "tasa_exito": f"{rate:.2f}%",
            "rechazados": invalid_records,
            "mensaje": (
                "✅ Carga masiva exitosa."
                if rate >= 95
                else "⚠️ Carga parcial: menos del 95% de registros válidos."
            ),
        }
