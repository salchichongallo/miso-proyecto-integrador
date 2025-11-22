
import io
import pytest
import pandas as pd
from unittest.mock import patch, MagicMock

from src.commands.create_providers_bulk import CreateProvidersBulk
from src.models.provider import ProviderModel
from src.errors.errors import ParamError, ApiError


# ============================================================
# 🔹 Helper para crear CSV en memoria
# ============================================================
def build_csv(rows: list[dict]) -> bytes:
    df = pd.DataFrame(rows)
    buffer = io.BytesIO()
    df.to_csv(buffer, index=False)
    return buffer.getvalue()


class TestCreateProvidersBulk:
    """🧪 Pruebas unitarias para CreateProvidersBulk"""

    # ============================================================
    # ✅ Caso exitoso con 2 registros
    # ============================================================
    @patch("src.commands.create_providers_bulk.create_user")
    @patch.object(ProviderModel, "create")
    @patch.object(ProviderModel, "find", return_value=None)
    @patch.object(ProviderModel, "find_by_email", return_value=None)
    def test_bulk_success(self, mock_find_email, mock_find_nit, mock_create, mock_create_user):
        mock_create_user.return_value = {"cognito_id": "prov-001"}

        rows = [
            {
                "name": "Proveedor A",
                "country": "CO",
                "nit": "1234567890",
                "address": "Calle 10",
                "email": "a@test.com",
                "phone": "3100000000"
            },
            {
                "name": "Proveedor B",
                "country": "MX",
                "nit": "9999999999",
                "address": "Av Reforma",
                "email": "b@test.com",
                "phone": "3111111111"
            }
        ]

        csv_bytes = build_csv(rows)
        command = CreateProvidersBulk(csv_bytes, "proveedores.csv")
        result = command.execute()

        assert result["total_records"] == 2
        assert result["successful_records"] == 2
        assert result["rejected_records"] == 0

        assert mock_create.call_count == 2
        assert mock_create_user.call_count == 2

    # ============================================================
    # 🚫 Faltan columnas obligatorias
    # ============================================================
    def test_missing_columns(self):

        rows = [
            {"name": "X", "email": "x@test.com"}  # faltan muchas columnas
        ]

        csv_bytes = build_csv(rows)
        command = CreateProvidersBulk(csv_bytes, "proveedores.csv")

        with pytest.raises(ParamError, match="Missing required columns"):
            command.execute()

    # ============================================================
    # 🚫 Email duplicado
    # ============================================================
    @patch.object(ProviderModel, "find_by_email")
    def test_email_duplicate(self, mock_find_email):
        mock_find_email.return_value = MagicMock()  # simula duplicado

        rows = [{
            "name": "Proveedor X",
            "country": "CO",
            "nit": "1234567890",
            "address": "Calle 123",
            "email": "x@test.com",
            "phone": "3100000000"
        }]

        csv_bytes = build_csv(rows)
        command = CreateProvidersBulk(csv_bytes, "proveedores.csv")

        result = command.execute()

        assert result["successful_records"] == 0
        assert result["rejected_records"] == 1
        assert "Email already exists" in result["rejected"][0]["error"]

    # ============================================================
    # 🚫 NIT duplicado
    # ============================================================
    @patch.object(ProviderModel, "find", return_value=MagicMock())
    @patch.object(ProviderModel, "find_by_email", return_value=None)
    def test_nit_duplicate(self, mock_find_email, mock_find_nit):

        rows = [{
            "name": "Proveedor X",
            "country": "CO",
            "nit": "1234567890",
            "address": "Calle 123",
            "email": "x@test.com",
            "phone": "3100000000"
        }]

        csv_bytes = build_csv(rows)
        command = CreateProvidersBulk(csv_bytes, "proveedores.csv")

        result = command.execute()

        assert result["successful_records"] == 0
        assert result["rejected_records"] == 1
        assert "NIT already exists" in result["rejected"][0]["error"]

    # ============================================================
    # ⚡ Error interno → ApiError
    # ============================================================
    @patch.object(ProviderModel, "find", return_value=None)
    @patch.object(ProviderModel, "find_by_email", return_value=None)
    @patch("src.commands.create_providers_bulk.create_user", return_value={"cognito_id": "prov-123"})
    @patch.object(ProviderModel, "create", side_effect=Exception("Dynamo fail"))
    def test_internal_error(self, mock_create, mock_create_user, *_):

        rows = [{
            "name": "Proveedor A",
            "country": "CO",
            "nit": "1234567890",
            "address": "Calle 123",
            "email": "a@test.com",
            "phone": "3100000000"
        }]

        csv_bytes = build_csv(rows)
        command = CreateProvidersBulk(csv_bytes, "proveedores.csv")

        result = command.execute()

        assert result["successful_records"] == 0
        assert "Dynamo fail" in result["rejected"][0]["error"]
