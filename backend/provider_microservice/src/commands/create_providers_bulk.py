import io
import hashlib
import logging
import pandas as pd

from .base_command import BaseCommannd
from ..models.provider import ProviderModel, NewProviderSchema
from ..errors.errors import ParamError, ApiError
from ..utils.user_requests import create_user

logger = logging.getLogger(__name__)


class CreateProvidersBulk(BaseCommannd):

    def __init__(self, file_bytes, filename):
        self.file_bytes = file_bytes
        self.filename = filename

    def execute(self):
        try:
            df = self._read_file()
            return self._process(df)
        except ParamError:
            raise
        except Exception as e:
            logger.error(f"Bulk upload error: {e}")
            raise ApiError(str(e))

    def _read_file(self):
        """Reads CSV or XLSX file and normalizes columns."""
        try:
            if self.filename.endswith(".csv"):
                df = pd.read_csv(io.BytesIO(self.file_bytes))
            elif self.filename.endswith(".xlsx"):
                df = pd.read_excel(io.BytesIO(self.file_bytes))
            else:
                raise ParamError("Unsupported format. Use CSV or XLSX.")
        except Exception as e:
            raise ApiError(f"Error reading file: {e}")

        df.columns = df.columns.str.lower().str.strip()

        expected = {"name", "country", "nit", "address", "email", "phone"}
        missing = expected - set(df.columns)
        if missing:
            raise ParamError(f"Missing required columns: {', '.join(missing)}")

        return df

    def _process(self, df: pd.DataFrame):
        approved_records = []
        rejected_records = []

        for idx, row in df.iterrows():
            entry = {
                "name": str(row.get("name", "")).strip(),
                "country": str(row.get("country", "")).strip(),
                "nit": str(row.get("nit", "")).strip(),
                "address": str(row.get("address", "")).strip(),
                "email": str(row.get("email", "")).strip().lower(),
                "phone": str(row.get("phone", "")).strip(),
            }

            try:
                NewProviderSchema.check(entry)

                if ProviderModel.find_by_email(entry["email"]):
                    raise ParamError("Email already exists")

                if ProviderModel.find(entry["nit"]):
                    raise ParamError("NIT already exists")

                user = create_user(email=entry["email"])
                provider_id = user.get("cognito_id")

                nit_encrypted = hashlib.sha256(entry["nit"].encode()).hexdigest()

                ProviderModel.create(
                    nit=entry["nit"],
                    nit_encrypted=nit_encrypted,
                    provider_id=provider_id,
                    name=entry["name"],
                    country=entry["country"],
                    address=entry["address"],
                    email=entry["email"],
                    phone=entry["phone"],
                )

                approved_records.append({
                    "index": idx,
                    "provider_id": provider_id,
                    "nit": entry["nit"],
                    "name": entry["name"],
                    "country": entry["country"],
                    "address": entry["address"],
                    "email": entry["email"],
                    "phone": entry["phone"],
                    "status": "created"
                })

            except ParamError as e:
                rejected_records.append({
                    "index": idx,
                    "nit": entry["nit"],
                    "name": entry["name"],
                    "country": entry["country"],
                    "address": entry["address"],
                    "email": entry["email"],
                    "phone": entry["phone"],
                    "error": str(e)
                })
            except Exception as e:
                rejected_records.append({
                    "index": idx,
                    "nit": entry["nit"],
                    "name": entry["name"],
                    "country": entry["country"],
                    "address": entry["address"],
                    "email": entry["email"],
                    "phone": entry["phone"],
                    "error": str(e)
                })

        total = len(df)
        success_count = len(approved_records)
        success_rate = (success_count / total * 100) if total > 0 else 0

        return {
            "total_records": total,
            "successful_records": success_count,
            "rejected_records": len(rejected_records),
            "success_rate": f"{success_rate:.2f}%",
            "approved": approved_records,
            "rejected": rejected_records,
            "message": (
                "Bulk upload successful."
                if success_rate >= 95
                else "Partial upload: less than 95% valid records."
            ),
        }
