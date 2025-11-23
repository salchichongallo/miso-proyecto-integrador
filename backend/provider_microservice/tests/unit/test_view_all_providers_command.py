import pytest
from unittest.mock import patch, MagicMock
from src.commands.view_all import GetAllProviders
from src.models.provider import ProviderModel
from src.errors.errors import ApiError


class TestGetAllProviders:
    """🧪 Pruebas unitarias para GetAllProviders"""

    # ============================================================
    # ✅ Caso exitoso: retorna lista de proveedores
    # ============================================================
    @patch.object(ProviderModel, "get_all")
    def test_get_all_providers_exitoso(self, mock_get_all):
        """Debe retornar la lista de proveedores correctamente"""

        mock_get_all.return_value = [
            {"nit": "123", "name": "Prov1"},
            {"nit": "456", "name": "Prov2"}
        ]

        command = GetAllProviders()
        result = command.execute()

        assert isinstance(result, list)
        assert len(result) == 2
        assert result[0]["name"] == "Prov1"
        mock_get_all.assert_called_once()

    # ============================================================
    # 🚫 Caso de error interno
    # ============================================================
    @patch.object(ProviderModel, "get_all", side_effect=Exception("DB Error"))
    def test_get_all_providers_error_interno(self, mock_get_all):
        """Debe lanzar ApiError si falla la consulta"""

        command = GetAllProviders()

        with pytest.raises(ApiError, match="Error al obtener la lista de proveedores"):
            command.execute()

        mock_get_all.assert_called_once()
