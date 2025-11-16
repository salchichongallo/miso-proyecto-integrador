import pytest
import logging
from unittest.mock import patch
from src.errors.errors import ApiError


@pytest.mark.usefixtures("client")
class TestCreateVisitIntegration:

    # ============================================================
    # ✅ Caso exitoso
    # ============================================================
    @patch("src.blueprints.visits.current_cognito_jwt")
    @patch("src.commands.create_visit.CreateVisit.execute")
    @patch("src.blueprints.visits.NewVisitJsonSchema.check")
    def test_successful_visit_creation(self, mock_schema, mock_execute, mock_cognito, client):

        mock_cognito.get.return_value = "VENDOR-123"
        mock_schema.return_value = None

        mock_execute.return_value = {
            "message": "Visita registrada exitosamente.",
            "visit": {
                "visit_id": "VISIT-001",
                "client_id": "CLIENT-001",
                "vendor_id": "VENDOR-123",
                "contact_name": "Juan",
                "contact_phone": "3100000000",
                "visit_datetime": "2025-11-20T15:30:00",
                "observations": "OK",
                "bucket_data": []
            }
        }

        payload = {
            "client_id": "CLIENT-001",
            "contact_name": "Juan",
            "contact_phone": "3100000000",
            "visit_datetime": "2025-11-20T15:30:00",
            "observations": "OK",
            "bucket_data": []
        }

        response = client.post("/visits/", json=payload)
        json_data = response.get_json()

        assert response.status_code == 201
        assert "message" in json_data
        assert "Visita registrada exitosamente" in json_data["message"]

        visit = json_data["visit"]
        assert visit["client_id"] == "CLIENT-001"
        assert visit["vendor_id"] == "VENDOR-123"

    # ============================================================
    # 🚫 Caso: falta un campo obligatorio
    # ============================================================
    @patch("src.blueprints.visits.current_cognito_jwt")
    def test_missing_required_field(self, mock_cognito, client):
        mock_cognito.get.return_value = "VENDOR-123"

        payload = {
            "contact_name": "Juan",
            "contact_phone": "3100000000",
            "visit_datetime": "2025-11-20T15:30:00",
            "observations": "OK"
        }

        response = client.post("/visits/", json=payload)
        json_data = response.get_json()

        assert response.status_code == 400
        assert "error" in json_data

    # ============================================================
    # 🚫 ApiError
    # ============================================================
    @patch("src.blueprints.visits.current_cognito_jwt")
    @patch("src.commands.create_visit.CreateVisit.execute")
    @patch("src.blueprints.visits.NewVisitJsonSchema.check")
    def test_api_error(self, mock_schema, mock_execute, mock_cognito, client):

        mock_cognito.get.return_value = "VENDOR-123"
        mock_schema.return_value = None
        mock_execute.side_effect = ApiError("Error en DynamoDB al guardar la visita")

        payload = {
            "client_id": "CLIENT-001",
            "contact_name": "Juan",
            "contact_phone": "3100000000",
            "visit_datetime": "2025-11-20T15:30:00",
            "observations": "OK"
        }

        response = client.post("/visits/", json=payload)
        json_data = response.get_json()

        assert response.status_code == 500
        assert "error" in json_data
        assert "Error en DynamoDB" in json_data["error"]

    # ============================================================
    # 🚫 Error inesperado
    # ============================================================
    @patch("src.blueprints.visits.current_cognito_jwt")
    @patch("src.commands.create_visit.CreateVisit.execute")
    @patch("src.blueprints.visits.NewVisitJsonSchema.check")
    def test_unexpected_exception(self, mock_schema, mock_execute, mock_cognito, client):

        mock_cognito.get.return_value = "VENDOR-123"
        mock_schema.return_value = None
        mock_execute.side_effect = Exception("Error inesperado en ejecución")

        payload = {
            "client_id": "CLIENT-001",
            "contact_name": "Juan",
            "contact_phone": "3100000000",
            "visit_datetime": "2025-11-20T15:30:00",
            "observations": "OK"
        }

        response = client.post("/visits/", json=payload)
        json_data = response.get_json()

        assert response.status_code == 500
        assert "error" in json_data
        assert "Error inesperado" in json_data["error"]
