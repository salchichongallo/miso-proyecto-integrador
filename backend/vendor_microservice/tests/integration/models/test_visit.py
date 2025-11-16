import pytest
from unittest.mock import MagicMock, patch
from datetime import datetime, timezone
from src.models.visit import VisitModel, NewVisitJsonSchema
from src.errors.errors import ParamError


# ============================================================
# 🔍 Tests para NewVisitJsonSchema.check()
# ============================================================
class TestVisitJsonSchema:
    """🧪 Pruebas unitarias para validar el schema de Visitas"""

    def test_schema_valido(self):
        """✅ Debe validar correctamente un JSON válido"""
        valid_data = {
            "client_id": "CLIENT-001",
            "contact_name": "Juan",
            "contact_phone": "3100000000",
            "visit_datetime": "2025-11-20T15:30:00",
            "observations": "OK",
            "bucket_data": ["file1.png"]
        }

        assert NewVisitJsonSchema.check(valid_data) is None

    def test_schema_invalido(self):
        """❌ Debe lanzar ParamError si falta un campo obligatorio"""
        invalid_data = {
            "client_id": "",
            "contact_name": "J",
            "contact_phone": "310",
            "visit_datetime": "invalid-date",
            "observations": ""
        }

        with pytest.raises(ParamError):
            NewVisitJsonSchema.check(invalid_data)


# ============================================================
# 🔍 Tests para get_by_id()
# ============================================================
class TestGetById:
    """🧪 Pruebas unitarias para get_by_id()"""

    @patch.object(VisitModel, "get")
    def test_should_return_visit_if_exists(self, mock_get):
        mock_visit = MagicMock()
        mock_visit.visit_id = "VISIT-123"
        mock_get.return_value = mock_visit

        result = VisitModel.get_by_id("VISIT-123")

        mock_get.assert_called_once_with("VISIT-123")
        assert result.visit_id == "VISIT-123"

    @patch.object(VisitModel, "get", side_effect=VisitModel.DoesNotExist)
    def test_should_return_none_if_not_found(self, mock_get):
        result = VisitModel.get_by_id("INVALID")

        mock_get.assert_called_once_with("INVALID")
        assert result is None


# ============================================================
# 📦 Tests para get_by_vendor()
# ============================================================
class TestGetByVendor:
    """🧪 Pruebas para get_by_vendor()"""

    @patch.object(VisitModel, "scan")
    def test_should_return_list_of_visits(self, mock_scan):
        mock_v1 = MagicMock()
        mock_v1.to_dict.return_value = {"visit_id": "1", "vendor_id": "V1"}
        mock_v2 = MagicMock()
        mock_v2.to_dict.return_value = {"visit_id": "2", "vendor_id": "V1"}

        mock_scan.return_value = [mock_v1, mock_v2]

        result = VisitModel.get_by_vendor("V1")

        mock_scan.assert_called_once()
        assert len(result) == 2
        assert result[0]["vendor_id"] == "V1"

    @patch.object(VisitModel, "scan", side_effect=Exception("Scan failed"))
    def test_should_raise_if_scan_fails(self, mock_scan):
        with pytest.raises(Exception):
            VisitModel.get_by_vendor("V1")


# ============================================================
# 📦 Tests para get_all()
# ============================================================
class TestGetAllVisits:
    """🧪 Pruebas unitarias para get_all()"""

    @patch.object(VisitModel, "scan")
    def test_should_return_all_visits(self, mock_scan):
        mock_v1 = MagicMock()
        mock_v1.to_dict.return_value = {"visit_id": "1"}
        mock_scan.return_value = [mock_v1]

        result = VisitModel.get_all()

        mock_scan.assert_called_once()
        assert isinstance(result, list)
        assert result[0]["visit_id"] == "1"

    @patch.object(VisitModel, "scan", side_effect=Exception("DB error"))
    def test_should_raise_exception_on_failure(self, mock_scan):
        with pytest.raises(Exception):
            VisitModel.get_all()


# ============================================================
# 🧱 Tests para create()
# ============================================================
class TestCreateVisitModel:
    """🧪 Tests para el método create()"""

    @patch.object(VisitModel, "save")
    def test_should_create_visit_correctly(self, mock_save):
        visit = VisitModel.create(
            vendor_id="V1",
            client_id="CLIENT",
            contact_name="Juan",
            contact_phone="3100000000",
            visit_datetime="2025-11-20T15:30:00",
            observations="OK",
            bucket_data=["img.png"],
        )

        assert visit.visit_id is not None
        assert isinstance(visit.visit_id, str)
        assert visit.created_at is not None
        assert visit.updated_at is not None
        assert visit.vendor_id == "V1"
        mock_save.assert_called_once()

    @patch.object(VisitModel, "save", side_effect=Exception("Dynamo Error"))
    def test_should_raise_exception_if_save_fails(self, mock_save):
        with pytest.raises(Exception):
            VisitModel.create(
                vendor_id="V1",
                client_id="CLIENT",
                contact_name="Juan",
                contact_phone="3100000000",
                visit_datetime="2025-11-20T15:30:00",
            )


# ============================================================
# 🧾 Tests para to_dict()
# ============================================================
class TestVisitToDict:
    """🧪 Tests unitarios de to_dict()"""

    def test_should_convert_visit_to_dict(self):
        visit = VisitModel(
            visit_id="VISIT-123",
            vendor_id="V1",
            client_id="CLIENT",
            contact_name="Juan",
            contact_phone="3100000000",
            visit_datetime="2025-11-20T15:30:00",
            observations="OK",
            bucket_data=["img.png"]
        )
        now = datetime.now(timezone.utc)
        visit.created_at = now
        visit.updated_at = now

        result = visit.to_dict()

        assert result["visit_id"] == "VISIT-123"
        assert result["vendor_id"] == "V1"
        assert result["client_id"] == "CLIENT"
        assert result["contact_name"] == "Juan"
        assert result["created_at"] == now.isoformat()
        assert "updated_at" in result
