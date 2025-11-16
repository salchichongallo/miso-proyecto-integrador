import pytest
from unittest.mock import patch, MagicMock
from src.commands.create_visit import CreateVisit
from src.errors.errors import ParamError, ApiError
from src.models.visit import VisitModel


class TestCreateVisitCommand:
    BASE_BODY = {
        "client_id": "CLIENT-001",
        "contact_name": "Juan Pérez",
        "contact_phone": "3100000000",
        "visit_datetime": "2025-11-20T15:30:00",
        "observations": "Observación de prueba",
        "bucket_data": ["s3://file1.png"]
    }

    # ============================================
    # ✅ Caso exitoso
    # ============================================
    @patch.object(VisitModel, "create")
    def test_execute_crea_visita_exitosamente(self, mock_create):
        mock_visit = MagicMock()
        mock_visit.to_dict.return_value = {
            "visit_id": "123",
            "client_id": "CLIENT-001",
            "vendor_id": "VENDOR-01",
            "contact_name": "Juan Pérez",
            "contact_phone": "3100000000",
            "visit_datetime": "2025-11-20T15:30:00",
            "observations": "Observación de prueba",
            "bucket_data": ["s3://file1.png"],
        }
        mock_create.return_value = mock_visit

        command = CreateVisit(self.BASE_BODY, vendor_id="VENDOR-01")
        result = command.execute()

        assert result["visit"]["client_id"] == "CLIENT-001"
        assert result["visit"]["vendor_id"] == "VENDOR-01"
        mock_create.assert_called_once()

    # ============================================
    # 🚫 vendor_id faltante
    # ============================================
    def test_vendor_id_faltante(self):
        command = CreateVisit(self.BASE_BODY, vendor_id="")
        with pytest.raises(ParamError):
            command.execute()

    # ============================================
    # ⚡ Error interno
    # ============================================
    @patch.object(VisitModel, "create", side_effect=Exception("Error DynamoDB"))
    def test_error_interno_creacion(self, mock_create):
        command = CreateVisit(self.BASE_BODY, vendor_id="VENDOR-01")

        with pytest.raises(ApiError):
            command.execute()
