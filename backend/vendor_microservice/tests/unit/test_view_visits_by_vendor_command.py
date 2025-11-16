import pytest
from unittest.mock import patch, MagicMock
from src.commands.get_visits_by_vendor import ListVisits
from src.errors.errors import ParamError, ApiError
from src.models.visit import VisitModel


class TestListVisitsCommand:
    """🧪 Pruebas unitarias para ListVisits"""

    # ============================================
    # ✅ Caso exitoso
    # ============================================
    @patch.object(VisitModel, "get_by_vendor")
    def test_execute_obtiene_visitas_exitosamente(self, mock_get):
        # Mock de datos
        mock_get.return_value = [
            {
                "visit_id": "1",
                "vendor_id": "VENDOR-01",
                "client_id": "CLIENT-01",
                "contact_name": "Juan",
                "contact_phone": "3100000000",
                "visit_datetime": "2025-11-20T15:30:00",
                "observations": "OK",
                "bucket_data": []
            },
            {
                "visit_id": "2",
                "vendor_id": "VENDOR-01",
                "client_id": "CLIENT-02",
                "contact_name": "María",
                "contact_phone": "3111111111",
                "visit_datetime": "2025-11-21T11:00:00",
                "observations": "",
                "bucket_data": []
            }
        ]

        command = ListVisits(vendor_id="VENDOR-01")
        result = command.execute()

        assert len(result) == 2
        assert result[0]["vendor_id"] == "VENDOR-01"
        mock_get.assert_called_once_with("VENDOR-01")

    # ============================================
    # 🚫 vendor_id faltante
    # ============================================
    def test_vendor_id_faltante(self):
        command = ListVisits(vendor_id="")
        with pytest.raises(ParamError, match="vendor_id es obligatorio"):
            command.execute()

    # ============================================
    # 🔍 lista vacía
    # ============================================
    @patch.object(VisitModel, "get_by_vendor", return_value=[])
    def test_sin_visitas(self, mock_get):
        command = ListVisits(vendor_id="VENDOR-01")
        result = command.execute()

        assert result == []
        mock_get.assert_called_once_with("VENDOR-01")

    # ============================================
    # ⚡ Error interno al obtener visitas
    # ============================================
    @patch.object(VisitModel, "get_by_vendor", side_effect=Exception("DynamoDB error"))
    def test_error_interno(self, mock_get):
        command = ListVisits(vendor_id="VENDOR-01")

        with pytest.raises(ApiError, match="Error al obtener visitas"):
            command.execute()
