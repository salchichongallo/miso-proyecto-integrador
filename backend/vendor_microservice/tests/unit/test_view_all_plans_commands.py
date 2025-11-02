import pytest
from unittest.mock import patch, MagicMock
from src.commands.view_all_sales_plans import GetAllSalesPlans
from src.models.sales_plan import SalesPlanModel
from src.errors.errors import ApiError


class TestGetAllSalesPlansCommand:
    """🧪 Unit tests for GetAllSalesPlans command"""

    @patch.object(SalesPlanModel, "get_all")
    def test_execute_successfully_retrieves_plans(self, mock_get_all):
        """✅ Should retrieve all sales plans successfully"""
        mock_get_all.return_value = [
            {"plan_id": "PLAN-1", "vendor_id": "V1", "period": "Q1-2025"},
            {"plan_id": "PLAN-2", "vendor_id": "V2", "period": "Q2-2025"},
        ]

        command = GetAllSalesPlans()
        result = command.execute()

        assert isinstance(result, list)
        assert len(result) == 2
        assert result[0]["plan_id"] == "PLAN-1"
        mock_get_all.assert_called_once()

    @patch.object(SalesPlanModel, "get_all")
    def test_execute_returns_empty_list_when_no_plans(self, mock_get_all):
        """⚠️ Should return an empty list when there are no sales plans"""
        mock_get_all.return_value = []

        command = GetAllSalesPlans()
        result = command.execute()

        assert isinstance(result, list)
        assert result == []
        mock_get_all.assert_called_once()

    @patch.object(SalesPlanModel, "get_all", side_effect=Exception("DB Error"))
    def test_execute_raises_api_error_on_failure(self, mock_get_all):
        """❌ Should raise ApiError when DynamoDB fails"""
        command = GetAllSalesPlans()
        with pytest.raises(ApiError, match="Error retrieving Sales Plans"):
            command.execute()
        mock_get_all.assert_called_once()

    @patch.object(SalesPlanModel, "get_all", side_effect=ApiError("Custom API Error"))
    def test_execute_propagates_api_error(self, mock_get_all):
        """⚠️ Should propagate ApiError if raised by model"""
        command = GetAllSalesPlans()
        with pytest.raises(ApiError, match="Custom API Error"):
            command.execute()
        mock_get_all.assert_called_once()
