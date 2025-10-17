import pytest
from unittest.mock import patch
from src.errors.errors import ApiError


class TestGetAllVendorsEndpoint:

    @pytest.mark.usefixtures("client")
    @patch("src.blueprints.vendor.GetAllVendors.execute")
    def test_get_all_vendors_endpoint(self, mock_execute, client):
        """✅ Caso exitoso: retorna lista de vendedores"""
        mock_execute.return_value = {
            "vendors": [
                {"vendor_id": "1", "name": "Jhorman", "email": "jhorman@example.com"},
                {"vendor_id": "2", "name": "Carlos", "email": "carlos@example.com"},
            ]
        }

        response = client.get("/all")
        assert response.status_code == 200
        data = response.get_json()

        assert isinstance(data, dict)
        assert "vendors" in data
        assert len(data["vendors"]) == 2
        assert data["vendors"][0]["name"] == "Jhorman"
        assert data["vendors"][1]["email"] == "carlos@example.com"
        mock_execute.assert_called_once()

    @pytest.mark.usefixtures("client")
    @patch("src.blueprints.vendor.GetAllVendors.execute", return_value={"vendors": []})
    def test_get_all_vendors_vacio(self, mock_execute, client):
        """⚠️ Caso sin vendedores: lista vacía"""
        response = client.get("/all")

        assert response.status_code == 200
        data = response.get_json()
        assert "vendors" in data
        assert isinstance(data["vendors"], list)
        assert len(data["vendors"]) == 0
        mock_execute.assert_called_once()

    @pytest.mark.usefixtures("client")
    @patch("src.blueprints.vendor.GetAllVendors.execute", side_effect=ApiError("Error al obtener vendedores"))
    def test_get_all_vendors_error_api(self, mock_execute, client):
        """❌ Falla controlada (ApiError)"""
        response = client.get("/all")
        assert response.status_code in (400, 500)
        data = response.get_json()
        assert "Error al obtener vendedores" in str(data)

    @pytest.mark.usefixtures("client")
    @patch("src.blueprints.vendor.GetAllVendors.execute", side_effect=Exception("Error inesperado en base de datos"))
    def test_get_all_vendors_exception_generica(self, mock_execute, client):
        """❌ Falla inesperada"""
        response = client.get("/all")
        assert response.status_code in (400, 500)
        data = response.get_json()
        assert "Error inesperado" in str(data)
