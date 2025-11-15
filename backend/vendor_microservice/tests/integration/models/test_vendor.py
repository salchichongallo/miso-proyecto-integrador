import pytest
from unittest.mock import MagicMock, patch
from datetime import datetime, timezone
from src.models.vendor import VendorModel
from src.errors.errors import ParamError


# ============================================================
# 🔍 Tests para find_existing_vendor()
# ============================================================
class TestFindExistingVendor:
    """🧪 Pruebas unitarias para find_existing_vendor()"""

    @patch.object(VendorModel, "get")
    def test_should_find_vendor_by_email(self, mock_get):
        """✅ Debe devolver un vendedor existente"""
        mock_vendor = MagicMock()
        mock_vendor.email = "jhorman@example.com"
        mock_get.return_value = mock_vendor

        result = VendorModel.find_existing_vendor("jhorman@example.com")

        mock_get.assert_called_once_with(hash_key="jhorman@example.com")
        assert result.email == "jhorman@example.com"

    @patch.object(VendorModel, "get", side_effect=VendorModel.DoesNotExist)
    def test_should_return_none_if_vendor_not_found(self, mock_get):
        """❌ Debe retornar None si el vendedor no existe"""
        result = VendorModel.find_existing_vendor("noexiste@example.com")
        mock_get.assert_called_once_with(hash_key="noexiste@example.com")
        assert result is None


# ============================================================
# 📦 Tests para get_all()
# ============================================================
class TestGetAllVendors:
    """🧪 Pruebas unitarias para get_all()"""

    @patch.object(VendorModel, "scan")
    def test_should_return_list_of_vendors(self, mock_scan):
        """✅ Debe devolver lista de vendedores en formato dict"""
        mock_vendor1 = MagicMock()
        mock_vendor1.to_dict.return_value = {"email": "a@example.com", "name": "A"}
        mock_vendor2 = MagicMock()
        mock_vendor2.to_dict.return_value = {"email": "b@example.com", "name": "B"}
        mock_scan.return_value = [mock_vendor1, mock_vendor2]

        result = VendorModel.get_all()

        mock_scan.assert_called_once()
        assert isinstance(result, list)
        assert len(result) == 2
        assert result[0]["email"] == "a@example.com"

    @patch.object(VendorModel, "scan", side_effect=Exception("DB Error"))
    def test_should_raise_exception_on_failure(self, mock_scan):
        """❌ Debe lanzar excepción si scan falla"""
        with pytest.raises(Exception, match="Error al obtener vendedores"):
            VendorModel.get_all()


# ============================================================
# 🧱 Tests para create()
# ============================================================
class TestCreateVendor:
    """🧪 Pruebas unitarias para create()"""

    @patch.object(VendorModel, "save")
    @patch.object(VendorModel, "find_existing_vendor", return_value=None)
    def test_should_create_vendor_correctly(self, mock_find, mock_save):
        """✅ Debe crear un vendedor y asignar campos automáticos"""
        vendor = VendorModel.create(
            vendor_id="UUID-123",
            email="jhorman@example.com",
            name="Jhorman Galindo",
            institutions=["Clinica Norte"]
        )

        assert vendor.vendor_id is not None
        assert isinstance(vendor.vendor_id, str)
        assert vendor.created_at is not None
        assert vendor.updated_at is not None
        assert vendor.email == "jhorman@example.com"
        mock_save.assert_called_once()

    @patch.object(VendorModel, "find_existing_vendor", return_value=True)
    def test_should_raise_paramerror_if_email_exists(self, mock_find):
        """❌ Debe lanzar ParamError si el email ya está registrado"""
        with pytest.raises(ParamError, match="ya está registrado"):
            VendorModel.create(email="duplicate@example.com", name="Dup", institutions=[])

    @patch.object(VendorModel, "save", side_effect=Exception("Dynamo Error"))
    @patch.object(VendorModel, "find_existing_vendor", return_value=None)
    def test_should_raise_exception_if_save_fails(self, mock_find, mock_save):
        """❌ Debe propagar error si save falla"""
        with pytest.raises(Exception):
            VendorModel.create(email="fail@example.com", name="Fail", institutions=[])


# ============================================================
# 🧾 Tests para to_dict()
# ============================================================
class TestToDict:
    """🧪 Pruebas unitarias para to_dict()"""

    def test_should_convert_vendor_to_dict(self):
        """✅ Debe convertir correctamente una instancia a diccionario"""
        vendor = VendorModel(
            email="jhorman@example.com",
            name="Jhorman Galindo",
            institutions=["Clinica Norte"],
        )
        now = datetime.now(timezone.utc)
        vendor.vendor_id = "UUID-123"
        vendor.created_at = now
        vendor.updated_at = now

        result = vendor.to_dict()

        assert result["email"] == "jhorman@example.com"
        assert result["vendor_id"] == "UUID-123"
        assert result["name"] == "Jhorman Galindo"
        assert result["institutions"] == ["Clinica Norte"]
        assert "created_at" in result
        assert "updated_at" in result
