import pytest
from unittest.mock import MagicMock, patch
from datetime import datetime, timezone
from src.models.sales_plan import SalesPlanModel, ProductTargetMap
from src.errors.errors import ParamError


# ============================================================
# 🔍 Tests para find_existing_plan()
# ============================================================
class TestFindExistingPlan:
    """🧪 Pruebas unitarias para find_existing_plan()"""

    @patch.object(SalesPlanModel, "scan")
    def test_should_find_plan_by_vendor_and_period(self, mock_scan):
        """✅ Debe devolver un plan existente si hay coincidencia"""
        mock_plan = MagicMock()
        mock_scan.return_value = [mock_plan]

        result = SalesPlanModel.find_existing_plan("v123", "2025-Q1")

        mock_scan.assert_called_once()
        assert result == mock_plan

    @patch.object(SalesPlanModel, "scan", return_value=[])
    def test_should_return_none_if_not_found(self, mock_scan):
        """❌ Debe retornar None si no hay plan existente"""
        result = SalesPlanModel.find_existing_plan("v999", "2025-Q2")
        mock_scan.assert_called_once()
        assert result is None

    @patch.object(SalesPlanModel, "scan", side_effect=Exception("DB error"))
    def test_should_raise_exception_on_failure(self, mock_scan):
        """❌ Debe lanzar excepción si scan falla"""
        with pytest.raises(Exception, match="Error checking existing sales plan"):
            SalesPlanModel.find_existing_plan("v123", "2025-Q1")


# ============================================================
# 📦 Tests para get_all()
# ============================================================
class TestGetAllSalesPlans:
    """🧪 Pruebas unitarias para get_all()"""

    @patch.object(SalesPlanModel, "scan")
    def test_should_return_list_of_sales_plans(self, mock_scan):
        """✅ Debe devolver lista de planes en formato dict"""
        mock_plan1 = MagicMock()
        mock_plan1.to_dict.return_value = {"plan_id": "1", "vendor_id": "v1"}
        mock_plan2 = MagicMock()
        mock_plan2.to_dict.return_value = {"plan_id": "2", "vendor_id": "v2"}
        mock_scan.return_value = [mock_plan1, mock_plan2]

        result = SalesPlanModel.get_all()

        mock_scan.assert_called_once()
        assert isinstance(result, list)
        assert len(result) == 2
        assert result[0]["plan_id"] == "1"

    @patch.object(SalesPlanModel, "scan", side_effect=Exception("DB Error"))
    def test_should_raise_exception_on_failure(self, mock_scan):
        """❌ Debe lanzar excepción si scan falla"""
        with pytest.raises(Exception, match="Error retrieving sales plans"):
            SalesPlanModel.get_all()


# ============================================================
# 🧱 Tests para create()
# ============================================================
class TestCreateSalesPlan:
    """🧪 Pruebas unitarias para create()"""

    @patch.object(SalesPlanModel, "save")
    @patch.object(SalesPlanModel, "find_existing_plan", return_value=None)
    def test_should_create_sales_plan_correctly(self, mock_find, mock_save):
        """✅ Debe crear un plan y asignar campos automáticos"""
        products = [
            ProductTargetMap(
                product_id="p1", name="Producto 1", target_units=10, target_value=5000
            )
        ]

        plan = SalesPlanModel.create(
            vendor_id="v123",
            period="2025-Q1",
            region="Norte",
            products=products,
        )

        assert plan.plan_id is not None
        assert isinstance(plan.plan_id, str)
        assert plan.created_at is not None
        assert plan.updated_at is not None
        assert plan.vendor_id == "v123"
        mock_save.assert_called_once()

    @patch.object(SalesPlanModel, "find_existing_plan", return_value=True)
    def test_should_raise_paramerror_if_plan_exists(self, mock_find):
        """❌ Debe lanzar ParamError si ya existe un plan para ese periodo"""
        with pytest.raises(ParamError, match="already has an active plan"):
            SalesPlanModel.create(
                vendor_id="v123", period="2025-Q1", region="Norte", products=[]
            )

    @patch.object(SalesPlanModel, "save", side_effect=Exception("Dynamo Error"))
    @patch.object(SalesPlanModel, "find_existing_plan", return_value=None)
    def test_should_raise_exception_if_save_fails(self, mock_find, mock_save):
        """❌ Debe propagar error si save falla"""
        with pytest.raises(Exception, match="Dynamo Error"):
            SalesPlanModel.create(
                vendor_id="v123", period="2025-Q1", region="Norte", products=[]
            )


# ============================================================
# 🧾 Tests para to_dict()
# ============================================================
class TestToDict:
    """🧪 Pruebas unitarias para to_dict()"""

    def test_should_convert_sales_plan_to_dict(self):
        """✅ Debe convertir correctamente una instancia a diccionario"""
        now = datetime.now(timezone.utc)
        product = ProductTargetMap(
            product_id="p1", name="Producto 1", target_units=5, target_value=1000
        )

        plan = SalesPlanModel(
            plan_id="UUID-123",
            vendor_id="v123",
            period="2025-Q1",
            region="Norte",
            products=[product],
            created_at=now,
            updated_at=now,
        )

        result = plan.to_dict()

        assert result["plan_id"] == "UUID-123"
        assert result["vendor_id"] == "v123"
        assert result["period"] == "2025-Q1"
        assert result["region"] == "Norte"
        assert isinstance(result["products"], list)
        assert result["products"][0]["name"] == "Producto 1"
        assert "created_at" in result
        assert "updated_at" in result
