import pytest
from unittest.mock import patch, MagicMock
from src.commands.create_vendor import CreateVendor
from src.errors.errors import ParamError, ApiError
from src.models.vendor import VendorModel


class TestCreateVendorCommand:
    """🧪 Pruebas unitarias para CreateVendor"""

    # ============================================
    # ✅ Caso exitoso de creación
    # ============================================
    @patch("src.commands.create_vendor.create_user")
    @patch.object(VendorModel, "create")
    @patch.object(VendorModel, "find_existing_vendor", return_value=None)
    def test_execute_crea_vendor_exitosamente(self, mock_find, mock_create, mock_create_user):
        """Debe crear un vendedor correctamente"""

        # mock respuesta de create_user → Cognito
        mock_create_user.return_value = {"cognito_id": "abc123"}

        # mock VendorModel.create
        mock_vendor = MagicMock()
        mock_vendor.to_dict.return_value = {
            "email": "jhorman@example.com",
            "name": "Jhorman Galindo",
            "vendor_id": "abc123",
            "institutions": [
                {"name": "Clinica Norte"},
                {"name": "Hospital Central"}
            ]
        }
        mock_create.return_value = mock_vendor

        command = CreateVendor({
            "name": "Jhorman Galindo",
            "email": "jhorman@example.com",
            "institutions": [
                {"name": "Clinica Norte"},
                {"name": "Hospital Central"}
            ],
        })

        result = command.execute()

        # verificaciones
        assert "message" in result
        assert "vendor" in result
        assert result["vendor"]["email"] == "jhorman@example.com"
        assert result["vendor"]["name"] == "Jhorman Galindo"
        assert len(result["vendor"]["institutions"]) == 2

        mock_find.assert_called_once_with("jhorman@example.com")
        mock_create_user.assert_called_once_with(email="jhorman@example.com")
        mock_create.assert_called_once()

    # ============================================
    # 🚫 Falta name o email
    # ============================================
    def test_campos_obligatorios_faltantes(self):
        command = CreateVendor({"name": "", "email": "", "institutions": []})
        with pytest.raises(ParamError, match="obligatorios"):
            command.execute()

    # ============================================
    # 🚫 institutions no es lista
    # ============================================
    def test_institutions_no_es_lista(self):
        command = CreateVendor({
            "name": "Jhorman",
            "email": "jhorman@example.com",
            "institutions": "Texto"
        })
        with pytest.raises(ParamError, match="lista"):
            command.execute()

    # ============================================
    # 🚫 más de 30 instituciones
    # ============================================
    def test_demasiadas_instituciones(self):
        institutions = [{"name": f"Inst_{i}"} for i in range(31)]

        command = CreateVendor({
            "name": "Jhorman",
            "email": "jhorman@example.com",
            "institutions": institutions
        })

        with pytest.raises(ParamError, match="30 instituciones"):
            command.execute()

    # ============================================
    # 🚫 Email duplicado
    # ============================================
    @patch.object(VendorModel, "find_existing_vendor")
    def test_email_duplicado(self, mock_find):
        mock_find.return_value = MagicMock()  # simula duplicado

        command = CreateVendor({
            "name": "Jhorman",
            "email": "jhorman@example.com",
            "institutions": [{"name": "Inst1"}],
        })

        with pytest.raises(ParamError, match="ya está registrado"):
            command.execute()

    # ============================================
    # ⚡ Error interno al crear Vendor
    # ============================================
    @patch.object(VendorModel, "create", side_effect=Exception("Error DynamoDB"))
    @patch.object(VendorModel, "find_existing_vendor", return_value=None)
    @patch("src.commands.create_vendor.create_user", return_value={"cognito_id": "abc123"})
    def test_error_interno_creacion(self, mock_create_user, mock_find, mock_create):
        """Debe lanzar ApiError si ocurre un fallo interno"""
        command = CreateVendor({
            "name": "Jhorman",
            "email": "jhorman@example.com",
            "institutions": [{"name": "Inst1"}],
        })

        with pytest.raises(ApiError, match="Error al crear vendedor"):
            command.execute()
