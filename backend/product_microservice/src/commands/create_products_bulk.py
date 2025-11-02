import io
import uuid
import logging
import pandas as pd
import time
from datetime import datetime, timezone
from .base_command import BaseCommannd
from ..errors.errors import ApiError
from ..models.product import ProductModel


logger = logging.getLogger(__name__)


class CreateProductsBulk(BaseCommannd):
    def __init__(self, file_bytes, filename, warehouse="1"):
        self.file_bytes = file_bytes
        self.filename = filename
        self.warehouse = warehouse

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
                # Usar UTC para consistencia entre entornos (local UTC-5, GitHub Actions UTC+0)
                current_date_utc = datetime.now(timezone.utc).date()
                if expiration_date <= current_date_utc:
                    invalid.append({**row.to_dict(), "error": "Fecha de vencimiento inválida"})
                    continue
            except Exception:
                invalid.append({**row.to_dict(), "error": "Formato de fecha inválido (YYYY-MM-DD)"})
                continue

            # Generar SKU único
            sku = uuid.uuid4().hex

            # 🔍 Validar duplicados
            try:
                existing_product = ProductModel.find_existing_product(self.warehouse, sku)
                if existing_product:
                    invalid.append({**row.to_dict(), "error": "Duplicado en base de datos"})
                    continue
            except Exception as e:
                invalid.append({**row.to_dict(), "error": f"Error al verificar duplicados: {e}"})
                continue

            # Crear instancia del modelo ProductModel
            product_data = {
                "warehouse": self.warehouse,
                "sku": sku,
                "provider_nit": provider_nit,
                "name": name,
                "product_type": product_type,
                "stock": stock,
                "expiration_date": expiration_date.isoformat(),
                "temperature_required": temperature_required,
                "batch": batch,
                "status": status,
                "unit_value": unit_value,
                "storage_conditions": storage_conditions,
                "created_at": datetime.now(timezone.utc)
            }
            valid.append(product_data)

        # 💾 Guardar válidos usando ProductModel
        if valid:
            for product_data in valid:
                try:
                    # Crear y guardar cada producto usando el modelo
                    product = ProductModel(**product_data)
                    product.save()
                except Exception as e:
                    logger.error(f"❌ Error al guardar producto {product_data.get('name', 'unknown')}: {e}")
                    # Si falla el guardado, mover de valid a invalid
                    invalid.append({**product_data, "error": f"Error al guardar: {e}"})
                    valid.remove(product_data)

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
