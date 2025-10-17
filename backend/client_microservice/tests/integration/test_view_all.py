import pytest
from unittest.mock import patch
from src.errors.errors import ApiError

class TestGetAllClientsEndpoint:

    @pytest.mark.usefixtures("client")
    @patch("src.blueprints.client.GetAllClients.execute")
    def test_get_all_clients_endpoint(self, mock_execute, client):
        """✅ Caso exitoso: retorna lista de clientes"""
        mock_execute.return_value = [
            {"name": "Hospital Central", "country": "CO"},
            {"name": "Clinica Norte", "country": "MX"},
        ]

        response = client.get("/all")
        assert response.status_code == 200
        data = response.get_json()

        assert isinstance(data, list)
        assert len(data) == 2
        assert data[0]["name"] == "Hospital Central"
        assert data[1]["country"] == "MX"
        mock_execute.assert_called_once()

    @pytest.mark.usefixtures("client")
    @patch("src.blueprints.client.GetAllClients.execute", return_value=[])
    def test_get_all_clients_vacio(self, mock_execute, client):
        """⚠️ Caso sin clientes: lista vacía"""
        response = client.get("/all")

        assert response.status_code == 200
        data = response.get_json()
        assert isinstance(data, list)
        assert len(data) == 0
        mock_execute.assert_called_once()

    @pytest.mark.usefixtures("client")
    @patch("src.blueprints.client.GetAllClients.execute", side_effect=ApiError("Error al obtener clientes"))
    def test_get_all_clients_error_api(self, mock_execute, client):
        """❌ Falla controlada (ApiError)"""
        response = client.get("/all")

        # En tu implementación actual, este error no se captura directamente,
        # así que Flask devolverá 500
        assert response.status_code in (500,)
        data = response.get_json()
        assert "Error" in str(data) or "clientes" in str(data)

    @pytest.mark.usefixtures("client")
    @patch("src.blueprints.client.GetAllClients.execute", side_effect=Exception("Error inesperado en base de datos"))
    def test_get_all_clients_exception_generica(self, mock_execute, client):
        """❌ Falla inesperada"""
        response = client.get("/all")
        assert response.status_code in (500,)
        data = response.get_json()
        assert "Error" in str(data) or "inesperado" in str(data)
