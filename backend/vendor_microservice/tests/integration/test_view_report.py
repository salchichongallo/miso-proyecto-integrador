import pytest
import logging
from unittest.mock import patch
from src.errors.errors import ApiError


@pytest.mark.usefixtures("client")
class TestVendorReportIntegration:
    """🧪 Test de integración end-to-end para el reporte del vendedor"""

    # ✅ Caso exitoso con datos simulados
    @patch("src.commands.view_report_vendor.ViewReportVendor.execute")
    def test_should_return_vendor_report_successfully(self, mock_execute, client):
        """✅ Debe devolver correctamente el reporte del vendedor"""
        mock_execute.return_value = {
            "vendor_id": "VENDOR-123",
            "ordered_products": 2,
            "customers_served": 1,
            "total_sales": 44600.0,
            "total_units_sold": 6,
            "target_units": 300,
            "target_value": 40000.0,
            "remaining_to_goal": 0.0,
            "sales_percentage": 111.5,
            "sold_products": [
                {"id": "P-1001", "name": "Wireless Mouse", "quantity": 4},
                {"id": "P-2002", "name": "Mechanical Keyboard", "quantity": 2},
            ],
        }

        headers = {"Authorization": "Bearer fake_token"}
        response = client.get("/sales_plan/VENDOR-123", headers=headers)
        json_data = response.get_json()

        logging.info("Vendor report response: %s", json_data)

        # ✅ Verificaciones
        assert response.status_code == 200
        assert json_data["vendor_id"] == "VENDOR-123"
        assert json_data["sales_percentage"] == 111.5
        assert isinstance(json_data["sold_products"], list)
        assert len(json_data["sold_products"]) == 2
        assert json_data["sold_products"][0]["name"] == "Wireless Mouse"

        mock_execute.assert_called_once()

    # ⚠️ Caso: vendedor sin datos (retorna vacío)
    @patch("src.commands.view_report_vendor.ViewReportVendor.execute")
    def test_should_return_empty_report_when_no_data(self, mock_execute, client):
        """⚠️ Debe devolver valores en 0 si no hay información del vendedor"""
        mock_execute.return_value = {
            "vendor_id": "VENDOR-999",
            "ordered_products": 0,
            "customers_served": 0,
            "total_sales": 0.0,
            "total_units_sold": 0,
            "target_units": 0,
            "target_value": 0.0,
            "remaining_to_goal": 0.0,
            "sales_percentage": 0.0,
            "sold_products": [],
        }

        headers = {"Authorization": "Bearer fake_token"}
        response = client.get("/sales_plan/VENDOR-999", headers=headers)
        json_data = response.get_json()

        logging.info("Vendor empty report response: %s", json_data)

        assert response.status_code == 200
        assert json_data["total_sales"] == 0.0
        assert json_data["sold_products"] == []

    # 🚫 Caso: ApiError en la ejecución
    @patch("src.commands.view_report_vendor.ViewReportVendor.execute")
    def test_should_return_500_on_api_error(self, mock_execute, client):
        """❌ Debe devolver 500 si ocurre un ApiError"""
        mock_execute.side_effect = ApiError("Error al generar el reporte")

        headers = {"Authorization": "Bearer fake_token"}
        response = client.get("/sales_plan/VENDOR-123", headers=headers)
        json_data = response.get_json()

        logging.info("Vendor report ApiError response: %s", json_data)

        assert response.status_code == 500
        assert "error" in json_data
        assert "reporte" in json_data["error"].lower()

    # 🚫 Caso: excepción inesperada
    @patch("src.commands.view_report_vendor.ViewReportVendor.execute")
    def test_should_return_500_on_unexpected_exception(self, mock_execute, client):
        """❌ Debe devolver 500 si ocurre un error inesperado"""
        mock_execute.side_effect = Exception("Error inesperado del servidor")

        headers = {"Authorization": "Bearer fake_token"}
        response = client.get("/sales_plan/VENDOR-123", headers=headers)
        json_data = response.get_json()

        logging.info("Vendor report unexpected error: %s", json_data)

        assert response.status_code == 500
        assert "error" in json_data
        assert "inesperado" in json_data["error"].lower()
