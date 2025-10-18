import boto3
import os
import io
import uuid
import re
import logging
import polars as pl
import time
from botocore.exceptions import ClientError
from .base_command import BaseCommannd
from ..errors.errors import ApiError

logger = logging.getLogger(__name__)

REGION = os.getenv("AWS_REGION", "us-east-1")
TABLE_NAME = "Providers"
DYNAMODB_ENDPOINT = os.getenv("DYNAMODB_ENDPOINT")


class CreateProvidersBulk(BaseCommannd):
    """
    Comando para registrar proveedores de forma masiva a partir de un archivo CSV.
    HU: MS-76 - Registro masivo de proveedores.
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
        """Ejecuta el proceso de carga masiva."""
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
        """Lee el archivo CSV o Excel usando Polars."""
        if self.filename.endswith(".csv"):
            df = pl.read_csv(io.BytesIO(self.file_bytes))
        elif self.filename.endswith(".xlsx"):
            df = pl.read_excel(io.BytesIO(self.file_bytes))
        else:
            raise ApiError("Formato de archivo no soportado. Usa CSV o XLSX.")

        expected = {"name", "country", "nit", "address", "email", "phone"}
        missing = expected - set(df.columns)
        if missing:
            raise ApiError(f"Faltan columnas obligatorias: {', '.join(missing)}")

        # 🧩 Convertir columnas numéricas a texto
        df = df.with_columns([
            pl.col("nit").cast(pl.Utf8),
            pl.col("phone").cast(pl.Utf8)
        ])

        return df

    # ----------------------------------------------------------
    def _process(self, df: pl.DataFrame):
        """Valida y guarda los proveedores en DynamoDB."""
        valid_records = []
        invalid_records = []

        for row in df.iter_rows(named=True):
            name = (row.get("name") or "").strip()
            country = (row.get("country") or "").strip().upper()
            nit = (row.get("nit") or "").strip()
            address = (row.get("address") or "").strip()
            email = (row.get("email") or "").strip().lower()
            phone = (row.get("phone") or "").strip()

            # Validaciones básicas
            if not all([name, country, nit, address, email, phone]):
                invalid_records.append({**row, "error": "Campos obligatorios faltantes"})
                continue

            if not re.match(r"^\d{10}$", nit):
                invalid_records.append({**row, "error": "NIT inválido (10 dígitos requeridos)"})
                continue

            if not re.match(r"^[\w\.-]+@[\w\.-]+\.\w+$", email):
                invalid_records.append({**row, "error": "Email inválido"})
                continue

            if not re.match(r"^\d{10}$", phone):
                invalid_records.append({**row, "error": "Teléfono inválido (10 dígitos requeridos)"})
                continue

            # Duplicados en BD
            try:
                response = self.table.get_item(Key={"nit": nit})
                if "Item" in response:
                    invalid_records.append({**row, "error": "Duplicado (NIT ya existe)"})
                    continue
            except ClientError as e:
                invalid_records.append({**row, "error": f"Error DynamoDB: {e}"})
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
