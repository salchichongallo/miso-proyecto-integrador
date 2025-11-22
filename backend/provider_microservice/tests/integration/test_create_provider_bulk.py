import io
import pytest
import pandas as pd
from unittest.mock import patch, MagicMock
from src.errors.errors import ApiError


@pytest.mark.usefixtures("client")
class TestBulkUploadProvidersIntegration:
    """🧪 Tests de integración para carga masiva de proveedores"""

    # ============================================================
    # Helper para generar un CSV válido
    # ============================================================
    def build_csv(self, rows):
        df = pd.DataFrame(rows)
        buffer = io.BytesIO()
        df.to_csv(buffer, index=False)
        buffer.seek(0)
        return buffer

    # ============================================================
    # ✅ Caso exitoso
    # ============================================================
    @patch("src.commands.create_providers_bulk.create_user", return_value={"cognito_id": "prov-1"})
    @patch("src.models.provider.ProviderModel.create")
    @patch("src.models.provider.ProviderModel.find", return_value=None)
    @patch("src.models.provider.ProviderModel.find_by_email", return_value=None)
    def test_bulk_success(
        self, mock_find_email, mock_find_nit, mock_create, mock_create_user, client
    ):
        rows = [
            {
                "name": "Proveedor A",
                "country": "CO",
                "nit": "1234567890",
                "address": "Calle 123",
                "email": "a@test.com",
                "phone": "3100000000"
            },
            {
                "name": "Proveedor B",
                "country": "MX",
                "nit": "9876543210",
                "address": "Av Reforma",
                "email": "b@test.com",
                "phone": "3111111111"
            }
        ]

        file = self.build_csv(rows)

        response = client.post(
            "/bulk",
            data={"file": (file, "proveedores.csv")},
            content_type="multipart/form-data"
        )

        json_data = response.get_json()

        assert response.status_code == 200
        assert json_data["successful_records"] == 2
        assert json_data["rejected_records"] == 0

        mock_create.assert_called()
        mock_create_user.assert_called()

    # ============================================================
    # ❌ No se adjunta archivo
    # ============================================================
    def test_bulk_without_file(self, client):
        response = client.post("/bulk", data={}, content_type="multipart/form-data")

        json_data = response.get_json()
        assert response.status_code == 400
        assert "No se adjuntó ningún archivo" in json_data["error"]

    # ============================================================
    # ❌ Archivo con columnas faltantes
    # ============================================================
    def test_bulk_missing_columns(self, client):
        rows = [{"name": "X"}]  # columnas incompletas
        file = self.build_csv(rows)

        response = client.post(
            "/bulk",
            data={"file": (file, "proveedores.csv")},
            content_type="multipart/form-data"
        )

        json_data = response.get_json()

        assert response.status_code == 400
        assert "Missing required columns" in json_data["error"]

    # ============================================================
    # ❌ Email duplicado
    # ============================================================
    @patch("src.models.provider.ProviderModel.find_by_email", return_value=True)
    def test_bulk_email_duplicate(self, mock_find_email, client):
        rows = [{
            "name": "Proveedor X",
            "country": "CO",
            "nit": "1234567890",
            "address": "Calle 123",
            "email": "a@test.com",
            "phone": "3100000000"
        }]

        file = self.build_csv(rows)

        response = client.post(
            "/bulk",
            data={"file": (file, "proveedores.csv")},
            content_type="multipart/form-data"
        )

        json_data = response.get_json()

        assert response.status_code == 200
        assert json_data["successful_records"] == 0
        assert json_data["rejected_records"] == 1

        assert "Email already exists" in json_data["rejected"][0]["error"]

    # ============================================================
    # ❌ NIT duplicado
    # ============================================================
    @patch("src.models.provider.ProviderModel.find", return_value=True)
    @patch("src.models.provider.ProviderModel.find_by_email", return_value=None)
    def test_bulk_nit_duplicate(self, mock_find_email, mock_find_nit, client):
        rows = [{
            "name": "Proveedor Y",
            "country": "CO",
            "nit": "1234567890",
            "address": "Calle 123",
            "email": "b@test.com",
            "phone": "3100000000"
        }]

        file = self.build_csv(rows)

        response = client.post(
            "/bulk",
            data={"file": (file, "proveedores.csv")},
            content_type="multipart/form-data"
        )

        json_data = response.get_json()

        assert response.status_code == 200
        assert json_data["successful_records"] == 0
        assert json_data["rejected_records"] == 1
        assert "NIT already exists" in json_data["rejected"][0]["error"]

    # ============================================================
    # ❌ ApiError interno
    # ============================================================
    @patch("src.commands.create_providers_bulk.CreateProvidersBulk.execute", side_effect=ApiError("Error en carga"))
    def test_bulk_api_error(self, mock_execute, client):

        fake_file = io.BytesIO(b"dummy")
        response = client.post(
            "/bulk",
            data={"file": (fake_file, "proveedores.csv")},
            content_type="multipart/form-data"
        )

        json_data = response.get_json()
        assert response.status_code == 400
        assert "Error en carga" in json_data["error"]

    # ============================================================
    # ❌ Error inesperado
    # ============================================================
    @patch("src.commands.create_providers_bulk.CreateProvidersBulk.execute", side_effect=Exception("Exploto"))
    def test_bulk_unexpected_error(self, mock_execute, client):

        fake_file = io.BytesIO(b"dummy")
        response = client.post(
            "/bulk",
            data={"file": (fake_file, "proveedores.csv")},
            content_type="multipart/form-data"
        )

        json_data = response.get_json()

        assert response.status_code == 500
        assert "Exploto" in json_data["error"]
