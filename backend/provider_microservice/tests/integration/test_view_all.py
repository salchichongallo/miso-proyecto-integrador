import pytest
from unittest.mock import patch, MagicMock
from botocore.exceptions import ClientError


class TestGetAllProvidersEndpoint:

    # ✅ Caso exitoso: retorna lista de proveedores
    @pytest.mark.usefixtures("client")
    @patch("src.blueprints.provider.GetAllProviders.execute")
    def test_get_all_providers_exitoso(self, mock_execute, client):
        """✅ Retorna lista de proveedores exitosamente"""
        mock_execute.return_value = [
            {"name": "Proveedor A", "nit": "1234567890"},
            {"name": "Proveedor B", "nit": "9876543210"},
        ]

        response = client.get("/")
        data = response.get_json()

        assert response.status_code == 200
        assert isinstance(data, list)
        assert len(data) == 2
        assert data[0]["name"] == "Proveedor A"
        mock_execute.assert_called_once()

    # ⚙️ Caso: lista vacía
    @pytest.mark.usefixtures("client")
    @patch("src.blueprints.provider.GetAllProviders.execute")
    def test_get_all_providers_lista_vacia(self, mock_execute, client):
        """⚙️ Retorna lista vacía sin errores"""
        mock_execute.return_value = []
        response = client.get("/")
        data = response.get_json()

        assert response.status_code == 200
        assert data == []
        mock_execute.assert_called_once()

    # ⚠️ Caso: error en DynamoDB (ApiError)
    @pytest.mark.usefixtures("client")
    @patch("src.blueprints.provider.GetAllProviders.execute", side_effect=Exception("Error al obtener la lista de proveedores"))
    def test_get_all_providers_error_api(self, mock_execute, client):
        """⚠️ Error manejado desde DynamoDB"""
        response = client.get("/")
        data = response.get_json()

        assert response.status_code == 500
        assert "Error al obtener la lista" in str(data)
        mock_execute.assert_called_once()

    # 💥 Caso: error inesperado general
    @pytest.mark.usefixtures("client")
    @patch("src.blueprints.provider.GetAllProviders.execute", side_effect=Exception("Error inesperado general"))
    def test_get_all_providers_error_inesperado(self, mock_execute, client):
        """💥 Error inesperado en ejecución"""
        response = client.get("/")
        data = response.get_json()

        assert response.status_code == 500
        assert "Error inesperado" in str(data)
        mock_execute.assert_called_once()
