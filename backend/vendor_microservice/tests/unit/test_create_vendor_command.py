import pytest
from unittest.mock import patch, MagicMock
from src.commands.create_vendor import CreateVendor
from src.errors.errors import ParamError, ApiError
from src.models.vendor import VendorModel


class TestCreateVendorCommand:
    """🧪 Pruebas unitarias para CreateVendor"""

    # ✅ Caso exitoso de creación
    @patch.object(VendorModel, "create")
    @patch.object(VendorModel, "find_existing_vendor", return_value=None)
    def test_execute_crea_vendor_exitosamente(self, mock_find, mock_create):
        """✅ Debe crear un vendedor correctamente"""
        mock_vendor = MagicMock()
        mock_vendor.to_dict.return_value = {
            "email": "jhorman@example.com",
            "name": "Jhorman Galindo",
            "institutions": [{ "name": "Clinica Norte" }, { "name": "Hospital Central" }],
        }
        mock_create.return_value = mock_vendor

        command = CreateVendor({
            "name": "Jhorman Galindo",
            "email": "jhorman@example.com",
            "institutions": [{ "name": "Clinica Norte" }, { "name": "Hospital Central" }],
        })

        result = command.execute()

        assert "message" in result
        assert "vendor" in result
        assert result["vendor"]["email"] == "jhorman@example.com"
        assert result["vendor"]["name"] == "Jhorman Galindo"
        assert len(result["vendor"]["institutions"]) == 2

        mock_find.assert_called_once_with("jhorman@example.com")
        mock_create.assert_called_once()

    # 🚫 Falta nombre o email
    def test_campos_obligatorios_faltantes(self):
        """❌ Debe fallar si name o email están vacíos"""
        command = CreateVendor({"name": "", "email": "", "institutions": []})
        with pytest.raises(ParamError, match="obligatorios"):
            command.execute()

    # 🚫 Institutions no es lista
    def test_institutions_no_es_lista(self):
        """❌ Debe fallar si institutions no es lista"""
        command = CreateVendor({
            "name": "Jhorman",
            "email": "jhorman@example.com",
            "institutions": "Texto"
        })
        with pytest.raises(ParamError, match="lista"):
            command.execute()

    # 🚫 Demasiadas instituciones
    def test_demasiadas_instituciones(self):
        """❌ No debe permitir más de 30 instituciones"""
        institutions = [{"name": f"Inst_{i}"} for i in range(31)]
        command = CreateVendor({
            "name": "Jhorman",
            "email": "jhorman@example.com",
            "institutions": institutions
        })
        with pytest.raises(ParamError, match="30 instituciones"):
            command.execute()

    # 🚫 Email duplicado
    @patch.object(VendorModel, "find_existing_vendor")
    def test_email_duplicado(self, mock_find):
        """❌ Debe fallar si el email ya existe"""
        mock_find.return_value = MagicMock()  # simula duplicado
        command = CreateVendor({
            "name": "Jhorman",
            "email": "jhorman@example.com",
            "institutions": [{ "name": "Inst1" }],
        })
        with pytest.raises(ParamError, match="ya está registrado"):
            command.execute()

    # ⚡ Error inesperado al crear
    @patch.object(VendorModel, "create", side_effect=Exception("Error DynamoDB"))
    @patch.object(VendorModel, "find_existing_vendor", return_value=None)
    def test_error_interno_creacion(self, mock_find, mock_create):
        """❌ Debe lanzar ApiError si ocurre un fallo interno"""
        command = CreateVendor({
            "name": "Jhorman",
            "email": "jhorman@example.com",
            "institutions": [{ "name": "Inst1" }],
        })

        with pytest.raises(ApiError, match="Error al crear vendedor"):
            command.execute()
