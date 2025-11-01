import pytest
from unittest.mock import patch, MagicMock
from src.commands.view_all import GetAllVendors
from src.errors.errors import ApiError
from src.models.vendor import VendorModel


class TestGetAllVendorsCommand:
    """🧪 Pruebas unitarias para GetAllVendors"""

    # ✅ Caso exitoso básico
    @patch.object(VendorModel, "get_all")
    def test_execute_exitoso(self, mock_get_all):
        """✅ Retorna lista de vendedores exitosamente"""
        mock_get_all.return_value = [
            {"name": "Vendor Z", "email": "z@example.com"},
            {"name": "Vendor A", "email": "a@example.com"},
        ]

        command = GetAllVendors()
        result = command.execute()

        assert isinstance(result, list)
        assert len(result) == 2
        assert result[0]["name"] == "Vendor A"  # Verifica que se ordenó
        assert result[1]["email"] == "z@example.com"

        mock_get_all.assert_called_once()

    # ⚠️ Sin vendedores
    @patch.object(VendorModel, "get_all")
    def test_execute_sin_vendedores(self, mock_get_all):
        """⚠️ Retorna lista vacía cuando no hay vendedores"""
        mock_get_all.return_value = []

        command = GetAllVendors()
        result = command.execute()

        assert isinstance(result, list)
        assert result == []
        mock_get_all.assert_called_once()

    # ❌ Error inesperado en el modelo
    @patch.object(VendorModel, "get_all", side_effect=Exception("Falla DynamoDB"))
    def test_execute_error_interno(self, mock_get_all):
        """❌ Debe lanzar ApiError si ocurre un error inesperado"""
        command = GetAllVendors()

        with pytest.raises(ApiError, match="Error al obtener la lista de vendedores"):
            command.execute()

        mock_get_all.assert_called_once()

    # 🧩 Verifica que los nombres se ordenan alfabéticamente
    @patch.object(VendorModel, "get_all")
    def test_execute_orden_alfabetico(self, mock_get_all):
        """🧩 Los vendedores deben ordenarse alfabéticamente por nombre"""
        mock_get_all.return_value = [
            {"name": "Carlos"},
            {"name": "Ana"},
            {"name": "Beatriz"},
        ]

        command = GetAllVendors()
        result = command.execute()

        nombres = [v["name"] for v in result]
        assert nombres == ["Ana", "Beatriz", "Carlos"]
