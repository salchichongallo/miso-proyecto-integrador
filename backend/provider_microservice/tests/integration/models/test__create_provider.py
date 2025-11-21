import pytest
from unittest.mock import MagicMock, patch
from datetime import datetime, timezone

from src.models.provider import ProviderModel, NewProviderSchema
from src.errors.errors import ParamError


# ============================================================
# 🔍 Tests para NewProviderSchema
# ============================================================
class TestNewProviderSchema:
    """🧪 Pruebas de validación de schema"""

    def test_valid_schema(self):
        """✅ Debe validar correctamente un payload válido"""
        data = {
            "nit": "1234567890",
            "name": "Proveedor S.A.",
            "country": "CO",
            "address": "Calle 123",
            "email": "contacto@proveedor.com",
            "phone": "3104567892"
        }
        assert NewProviderSchema.check(data) is None  # No lanza errores

    def test_invalid_nit_length(self):
        """❌ Debe rechazar NIT que no tenga 10 dígitos"""
        data = {
            "nit": "123",
            "name": "Prov",
            "country": "CO",
            "address": "Calle 1",
            "email": "mail@mail.com",
            "phone": "3104567892"
        }
        with pytest.raises(ParamError):
            NewProviderSchema.check(data)

    def test_invalid_phone_length(self):
        """❌ Debe rechazar teléfono inválido"""
        data = {
            "nit": "1234567890",
            "name": "Prov",
            "country": "CO",
            "address": "Calle 1",
            "email": "mail@mail.com",
            "phone": "123"
        }
        with pytest.raises(ParamError):
            NewProviderSchema.check(data)


# ============================================================
# 🔍 Tests para find()
# ============================================================
class TestFindProvider:
    """🧪 Pruebas para find()"""

    @patch.object(ProviderModel, "get")
    def test_should_find_provider(self, mock_get):
        """✅ Debe retornar proveedor existente"""
        mock_provider = MagicMock()
        mock_provider.nit = "1234567890"
        mock_get.return_value = mock_provider

        result = ProviderModel.find("1234567890")

        mock_get.assert_called_once_with(hash_key="1234567890")
        assert result.nit == "1234567890"

    @patch.object(ProviderModel, "get", side_effect=ProviderModel.DoesNotExist)
    def test_should_return_none_if_not_found(self, mock_get):
        """❌ Debe retornar None si no existe"""
        result = ProviderModel.find("99999")
        assert result is None
        mock_get.assert_called_once()


# ============================================================
# 🔍 Tests para find_by_email()
# ============================================================
class TestFindByEmail:
    """🧪 Pruebas para find_by_email()"""

    @patch.object(ProviderModel, "scan")
    def test_should_find_by_email(self, mock_scan):
        """✅ Debe retornar proveedor por email"""
        mock_provider = MagicMock()
        mock_provider.email = "contacto@proveedor.com"
        mock_scan.return_value = [mock_provider]

        result = ProviderModel.find_by_email("contacto@proveedor.com")

        assert result.email == "contacto@proveedor.com"
        mock_scan.assert_called_once()

    @patch.object(ProviderModel, "scan", return_value=[])
    def test_should_return_none_if_email_not_found(self, mock_scan):
        """❌ Si no hay coincidencia, debe retornar None"""
        result = ProviderModel.find_by_email("noexiste@mail.com")
        assert result is None

    @patch.object(ProviderModel, "scan", side_effect=Exception("DB Error"))
    def test_should_raise_error_if_scan_fails(self, mock_scan):
        with pytest.raises(ParamError, match="Error buscando email"):
            ProviderModel.find_by_email("x@mail.com")


# ============================================================
# 🔍 Tests para get_all()
# ============================================================
class TestGetAllProviders:
    """🧪 Pruebas para get_all()"""

    @patch.object(ProviderModel, "scan")
    def test_should_return_list_of_providers(self, mock_scan):
        """✅ Debe retornar lista de dicts"""
        mock1 = MagicMock()
        mock1.to_dict.return_value = {"nit": "1", "name": "Prov1"}

        mock2 = MagicMock()
        mock2.to_dict.return_value = {"nit": "2", "name": "Prov2"}

        mock_scan.return_value = [mock1, mock2]

        result = ProviderModel.get_all()

        assert len(result) == 2
        assert result[0]["nit"] == "1"
        assert result[1]["name"] == "Prov2"



# ============================================================
# 🔍 Tests para create()
# ============================================================
class TestCreateProvider:
    """🧪 Pruebas para create()"""

    @patch.object(ProviderModel, "save")
    @patch.object(ProviderModel, "find", return_value=None)
    def test_should_create_provider_correctly(self, mock_find, mock_save):
        """✅ Debe crear proveedor correctamente"""
        provider = ProviderModel.create(
            nit="1234567890",
            nit_encrypted="hashed",
            provider_id="U-123",
            name="Provider X",
            country="CO",
            address="Calle 123",
            email="prov@mail.com",
            phone="3104567892"
        )

        assert provider.nit == "1234567890"
        assert provider.provider_id == "U-123"
        assert provider.created_at is not None
        assert provider.updated_at is not None
        mock_save.assert_called_once()

    @patch.object(ProviderModel, "find", return_value=True)
    def test_should_raise_error_if_nit_exists(self, mock_find):
        """❌ Debe lanzar error si NIT ya existe"""
        with pytest.raises(ParamError, match="ya está registrado"):
            ProviderModel.create(
                nit="1234567890",
                nit_encrypted="hashed",
                provider_id="U-123",
                name="Provider",
                country="CO",
                address="Calle 123",
                email="prov@mail.com",
                phone="3104567892"
            )


    @patch.object(ProviderModel, "save", side_effect=Exception("Save error"))
    @patch.object(ProviderModel, "find", return_value=None)
    def test_should_raise_exception_if_save_fails(self, mock_find, mock_save):
        """❌ Debe propagar el error si save falla"""
        with pytest.raises(Exception):
            ProviderModel.create(
                nit="1234567890",
                nit_encrypted="hashed",
                provider_id="U-123",
                name="Provider",
                country="CO",
                address="Calle 123",
                email="prov@mail.com",
                phone="3104567892"
            )


# ============================================================
# 🧾 Tests para to_dict()
# ============================================================
class TestProviderToDict:
    """🧪 Pruebas para to_dict()"""

    def test_should_convert_to_dict(self):
        now = datetime.now(timezone.utc)

        provider = ProviderModel(
            nit="1234567890",
            name="Proveedor X",
            country="CO",
            address="Calle 1",
            email="prov@mail.com",
            phone="3000000000"
        )
        provider.nit_encrypted = "hashed"
        provider.provider_id = "A-123"
        provider.created_at = now
        provider.updated_at = now

        result = provider.to_dict()

        assert result["nit"] == "1234567890"
        assert result["provider_id"] == "A-123"
        assert result["name"] == "Proveedor X"
        assert result["country"] == "CO"
        assert result["email"] == "prov@mail.com"
        assert "created_at" in result
        assert "updated_at" in result
