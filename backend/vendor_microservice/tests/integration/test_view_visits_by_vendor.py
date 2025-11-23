import pytest
import logging
from unittest.mock import patch
from src.errors.errors import ApiError


@pytest.mark.usefixtures("client")
class TestListVisitsIntegration:
    """🧪 Test de integración para GET /visits"""

    # ============================================================
    # ✅ Caso exitoso — devuelve lista de visitas
    # ============================================================
    @patch("src.blueprints.visits.current_cognito_jwt")
    @patch("src.commands.get_visits_by_vendor.ListVisits.execute")
    def test_get_visits_success(self, mock_execute, mock_cognito, client):
        """Debe retornar la lista de visitas del vendedor"""

        mock_cognito.get.return_value = "VENDOR-123"

        mock_execute.return_value = [
            {
                "visit_id": "1",
                "client_id": "CLIENT-1",
                "vendor_id": "VENDOR-123",
                "contact_name": "Juan",
                "contact_phone": "3100000000",
                "visit_datetime": "2025-11-20T10:00:00",
                "observations": "OK",
                "bucket_data": []
            },
            {
                "visit_id": "2",
                "client_id": "CLIENT-2",
                "vendor_id": "VENDOR-123",
                "contact_name": "María",
                "contact_phone": "3110000000",
                "visit_datetime": "2025-11-20T12:00:00",
                "observations": "",
                "bucket_data": []
            }
        ]

        response = client.get("/visits/")
        json_data = response.get_json()

        assert response.status_code == 200
        assert isinstance(json_data, list)
        assert len(json_data) == 2
        assert json_data[0]["vendor_id"] == "VENDOR-123"

        mock_execute.assert_called_once()

    # ============================================================
    # 👍 Caso: lista vacía
    # ============================================================
    @patch("src.blueprints.visits.current_cognito_jwt")
    @patch("src.commands.get_visits_by_vendor.ListVisits.execute", return_value=[])
    def test_get_visits_empty_list(self, mock_execute, mock_cognito, client):

        mock_cognito.get.return_value = "VENDOR-123"

        response = client.get("/visits/")
        json_data = response.get_json()

        assert response.status_code == 200
        assert json_data == []

        mock_execute.assert_called_once()

    # ============================================================
    # 🚫 ApiError en ejecución
    # ============================================================
    @patch("src.blueprints.visits.current_cognito_jwt")
    @patch("src.commands.get_visits_by_vendor.ListVisits.execute")
    def test_get_visits_api_error(self, mock_execute, mock_cognito, client):
        mock_cognito.get.return_value = "VENDOR-123"
        mock_execute.side_effect = ApiError("Error obteniendo visitas")

        response = client.get("/visits/")
        json_data = response.get_json()

        assert response.status_code == 500
        assert "error" in json_data
        assert "Error obteniendo visitas" in json_data["error"]

    # ============================================================
    # ❌ Excepción inesperada
    # ============================================================
    @patch("src.blueprints.visits.current_cognito_jwt")
    @patch("src.commands.get_visits_by_vendor.ListVisits.execute")
    def test_get_visits_unexpected_exception(self, mock_execute, mock_cognito, client):
        mock_cognito.get.return_value = "VENDOR-123"
        mock_execute.side_effect = Exception("Error inesperado")

        response = client.get("/visits/")
        json_data = response.get_json()

        assert response.status_code == 500
        assert "error" in json_data
        assert "Error inesperado" in json_data["error"]
