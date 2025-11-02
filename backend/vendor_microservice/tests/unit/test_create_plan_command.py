import pytest
from unittest.mock import patch, MagicMock
from src.commands.create_sales_plan import CreateSalesPlan
from src.errors.errors import ParamError, ApiError
from src.models.sales_plan import SalesPlanModel, ProductTargetMap


class TestCreateSalesPlanCommand:
    """🧪 Unit tests for CreateSalesPlan command"""

    # ✅ Successful creation
    @patch.object(SalesPlanModel, "create")
    @patch.object(SalesPlanModel, "find_existing_plan", return_value=None)
    def test_execute_creates_sales_plan_successfully(self, mock_find, mock_create):
        """✅ Should create a sales plan successfully"""
        mock_plan = MagicMock()
        mock_plan.to_dict.return_value = {
            "plan_id": "PLAN-001",
            "vendor_id": "VENDOR-123",
            "period": "Q1-2025",
            "region": "North America",
            "products": [
                {"product_id": "P-001", "name": "Smartwatch X", "target_units": 100, "target_value": 25000.0}
            ],
        }
        mock_create.return_value = mock_plan

        body = {
            "vendor_id": "VENDOR-123",
            "period": "Q1-2025",
            "region": "North America",
            "products": [
                {"product_id": "P-001", "name": "Smartwatch X", "target_units": 100, "target_value": 25000.0}
            ],
        }

        command = CreateSalesPlan(body)
        result = command.execute()

        assert "message" in result
        assert "plan" in result
        assert result["plan"]["vendor_id"] == "VENDOR-123"
        assert result["plan"]["period"] == "Q1-2025"
        assert len(result["plan"]["products"]) == 1

        mock_find.assert_called_once_with("VENDOR-123", "Q1-2025")
        mock_create.assert_called_once()

    # 🚫 Missing vendor_id
    def test_missing_vendor_id(self):
        """❌ Should raise ParamError when vendor_id is missing"""
        body = {
            "period": "Q1-2025",
            "region": "North America",
            "products": [{"product_id": "P1", "name": "Item", "target_units": 10, "target_value": 100.0}],
        }
        command = CreateSalesPlan(body)
        with pytest.raises(ParamError, match="vendor_id"):
            command.execute()

    # 🚫 Invalid product format
    def test_invalid_product_structure(self):
        """❌ Should raise ParamError if a product lacks required fields"""
        body = {
            "vendor_id": "VENDOR-1",
            "period": "Q1-2025",
            "region": "North America",
            "products": [
                {"product_id": "", "name": "Watch", "target_units": 10, "target_value": 100.0},  # product_id empty
            ],
        }
        command = CreateSalesPlan(body)
        with pytest.raises(ParamError, match="product_id"):
            command.execute()

    # 🚫 Product with invalid target_units
    def test_invalid_target_units(self):
        """❌ Should raise ParamError when target_units < 1"""
        body = {
            "vendor_id": "VENDOR-1",
            "period": "Q1-2025",
            "region": "North America",
            "products": [
                {"product_id": "P1", "name": "Watch", "target_units": 0, "target_value": 100.0},
            ],
        }
        command = CreateSalesPlan(body)
        with pytest.raises(ParamError, match="target_units"):
            command.execute()

    # 🚫 Product with invalid target_value
    def test_invalid_target_value(self):
        """❌ Should raise ParamError when target_value < 0"""
        body = {
            "vendor_id": "VENDOR-1",
            "period": "Q1-2025",
            "region": "North America",
            "products": [
                {"product_id": "P1", "name": "Watch", "target_units": 10, "target_value": -5.0},
            ],
        }
        command = CreateSalesPlan(body)
        with pytest.raises(ParamError, match="target_value"):
            command.execute()

    # 🚫 Duplicate plan for same period
    @patch.object(SalesPlanModel, "find_existing_plan")
    def test_duplicate_plan_same_period(self, mock_find):
        """❌ Should not allow duplicate plan for same vendor/period"""
        mock_find.return_value = MagicMock()
        body = {
            "vendor_id": "VENDOR-1",
            "period": "Q1-2025",
            "region": "North America",
            "products": [
                {"product_id": "P1", "name": "Watch", "target_units": 10, "target_value": 100.0},
            ],
        }
        command = CreateSalesPlan(body)
        with pytest.raises(ParamError, match="already has an active plan"):
            command.execute()

    # ⚡ Unexpected internal error
    @patch.object(SalesPlanModel, "find_existing_plan", return_value=None)
    @patch.object(SalesPlanModel, "create", side_effect=Exception("DynamoDB failure"))
    def test_unexpected_internal_error(self, mock_create, mock_find):
        """❌ Should raise ApiError on unexpected failure"""
        body = {
            "vendor_id": "VENDOR-1",
            "period": "Q1-2025",
            "region": "North America",
            "products": [
                {"product_id": "P1", "name": "Watch", "target_units": 10, "target_value": 100.0},
            ],
        }
        command = CreateSalesPlan(body)
        with pytest.raises(ApiError, match="Error while creating Sales Plan"):
            command.execute()
