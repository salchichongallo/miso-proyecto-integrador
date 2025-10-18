import boto3
import os
import io
import uuid
import logging
import pandas as pd
import time
from datetime import datetime
from decimal import Decimal
from botocore.exceptions import ClientError
from .base_command import BaseCommannd
from ..errors.errors import ApiError

logger = logging.getLogger(__name__)

REGION = os.getenv("AWS_REGION", "us-east-1")
TABLE_NAME = "Products"
DYNAMODB_ENDPOINT = os.getenv("DYNAMODB_ENDPOINT")


class CreateProductsBulk(BaseCommannd):
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
        """Lee archivo CSV o Excel."""
        try:
            if self.filename.endswith(".csv"):
                df = pd.read_csv(io.BytesIO(self.file_bytes))
            elif self.filename.endswith(".xlsx"):
                df = pd.read_excel(io.BytesIO(self.file_bytes))
            else:
                raise ApiError("Formato no soportado. Usa CSV o XLSX.")
        except Exception as e:
            raise ApiError(f"Error al leer archivo: {e}")

        expected = {
            "provider_nit", "name", "product_type", "stock", "expiration_date",
            "temperature_required", "batch", "status", "unit_value", "storage_conditions"
        }

        df.columns = df.columns.str.lower().str.strip()
        missing = expected - set(df.columns)
        if missing:
            raise ApiError(f"Faltan columnas: {', '.join(missing)}")

        return df

    # ----------------------------------------------------------
    def _process(self, df: pd.DataFrame):
        valid = []
        invalid = []

        for _, row in df.iterrows():
            provider_nit = str(row.get("provider_nit", "")).strip()
            name = str(row.get("name", "")).strip()
            product_type = str(row.get("product_type", "")).strip()
            batch = str(row.get("batch", "")).strip()
            status = str(row.get("status", "")).strip()
            storage_conditions = str(row.get("storage_conditions", "")).strip()

            try:
                stock = int(row.get("stock", 0))
                unit_value = float(row.get("unit_value", 0))
                temperature_required = float(row.get("temperature_required", 0))
            except Exception:
                invalid.append({**row.to_dict(), "error": "Campos numéricos inválidos"})
                continue

            # 🧩 Validaciones
            if not all([provider_nit, name, product_type, batch, status, storage_conditions]):
                invalid.append({**row.to_dict(), "error": "Campos obligatorios faltantes"})
                continue

            if stock < 1:
                invalid.append({**row.to_dict(), "error": "Stock debe ser positivo"})
                continue

            if unit_value <= 0:
                invalid.append({**row.to_dict(), "error": "Valor unitario debe ser mayor que 0"})
                continue

            try:
                expiration_date = datetime.strptime(str(row["expiration_date"]), "%Y-%m-%d").date()
                if expiration_date <= datetime.now().date():
                    invalid.append({**row.to_dict(), "error": "Fecha de vencimiento inválida"})
                    continue
            except Exception:
                invalid.append({**row.to_dict(), "error": "Formato de fecha inválido (YYYY-MM-DD)"})
                continue

            # 🔍 Validar duplicados
            try:
                response = self.table.scan(
                    FilterExpression="#n = :n AND #nm = :nm AND #b = :b",
                    ExpressionAttributeNames={
                        "#n": "provider_nit",
                        "#nm": "name",
                        "#b": "batch"
                    },
                    ExpressionAttributeValues={
                        ":n": provider_nit,
                        ":nm": name,
                        ":b": batch
                    }
                )
                if response.get("Items"):
                    invalid.append({**row.to_dict(), "error": "Duplicado en base de datos"})
                    continue
            except ClientError as e:
                invalid.append({**row.to_dict(), "error": f"Error DynamoDB: {e}"})
                continue

            valid.append({
                "sku": uuid.uuid4().hex,
                "provider_nit": provider_nit,
                "name": name,
                "product_type": product_type,
                "stock": stock,
                "expiration_date": expiration_date.isoformat(),
                "temperature_required": Decimal(str(temperature_required)),
                "batch": batch,
                "status": status,
                "unit_value": Decimal(str(unit_value)),
                "storage_conditions": storage_conditions,
                "created_at": datetime.utcnow().isoformat()
            })

        # 💾 Guardar válidos
        if valid:
            with self.table.batch_writer() as batch:
                for item in valid:
                    batch.put_item(Item=item)

        total = len(df)
        success = len(valid)
        fail = len(invalid)
        rate = (success / total * 100) if total > 0 else 0

        return {
            "total_registros": total,
            "exitosos": success,
            "rechazados": fail,
            "tasa_exito": f"{rate:.2f}%",
            "rechazados_detalle": invalid,
            "mensaje": "Carga completada" if fail == 0 else "Carga parcial",
        }
