import pytest
from unittest.mock import patch
from src.commands.view_report_vendor import ViewReportVendor
from src.errors.errors import ApiError
from collections import defaultdict


class TestViewReportVendorCommand:
    """🧪 Pruebas unitarias para ViewReportVendor"""

    # ✅ Caso exitoso con datos simulados
    @patch("src.commands.view_report_vendor.SalesPlanModel.get_by_vendor")
    @patch("src.commands.view_report_vendor.OrderModel.get_by_vendor")
    def test_execute_exitoso(self, mock_get_orders, mock_get_plans):
        """✅ Genera correctamente el reporte del vendedor"""
        # --- Mock data ---
        mock_get_plans.return_value = [
            {
                "vendor_id": "VENDOR-123",
                "products": [
                    {"product_id": "P-001", "target_units": 100, "target_value": 25000.0},
                    {"product_id": "P-002", "target_units": 200, "target_value": 15000.0},
                ],
            }
        ]
        mock_get_orders.return_value = [
            {
                "id": "ORDER-1",
                "id_client": "CLIENT-1",
                "products": [
                    {"id": "P-1001", "name": "Mouse", "amount": 2, "unit_price": 100},
                    {"id": "P-2002", "name": "Keyboard", "amount": 1, "unit_price": 200},
                ],
            },
            {
                "id": "ORDER-2",
                "id_client": "CLIENT-1",
                "products": [
                    {"id": "P-1001", "name": "Mouse", "amount": 1, "unit_price": 100},
                ],
            },
        ]

        # --- Ejecutar comando ---
        command = ViewReportVendor("VENDOR-123")
        result = command.execute()

        # --- Validaciones ---
        assert isinstance(result, dict)
        assert result["vendor_id"] == "VENDOR-123"
        assert result["ordered_products"] == 2
        assert result["customers_served"] == 1
        assert result["total_units_sold"] == 4  # 3 mouse + 1 keyboard
        assert result["total_sales"] == 500.0
        assert result["target_value"] == 40000.0
        assert result["sales_percentage"] == pytest.approx(1.25, 0.01)  # 500 / 40000 * 100
        assert len(result["sold_products"]) == 2

        mock_get_plans.assert_called_once_with("VENDOR-123")
        mock_get_orders.assert_called_once_with("VENDOR-123")

    # ⚠️ Caso sin planes ni órdenes
    @patch("src.commands.view_report_vendor.SalesPlanModel.get_by_vendor", return_value=[])
    @patch("src.commands.view_report_vendor.OrderModel.get_by_vendor", return_value=[])
    def test_execute_sin_datos(self, mock_get_orders, mock_get_plans):
        """⚠️ Retorna métricas vacías si no hay datos"""
        command = ViewReportVendor("VENDOR-999")
        result = command.execute()

        assert result["ordered_products"] == 0
        assert result["customers_served"] == 0
        assert result["total_sales"] == 0
        assert result["sales_percentage"] == 0
        assert result["sold_products"] == []

    # ❌ Error inesperado durante ejecución
    @patch("src.commands.view_report_vendor.SalesPlanModel.get_by_vendor", side_effect=Exception("DB error"))
    def test_execute_error_interno(self, mock_get_plans):
        """❌ Debe lanzar ApiError si ocurre un error inesperado"""
        command = ViewReportVendor("VENDOR-123")
        with pytest.raises(ApiError, match="Error while generating vendor report"):
            command.execute()

        mock_get_plans.assert_called_once()
