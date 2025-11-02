import logging
from .base_command import BaseCommannd
from ..errors.errors import ParamError, ApiError
from ..models.sales_plan import SalesPlanModel, ProductTargetMap

logger = logging.getLogger(__name__)

class CreateSalesPlan(BaseCommannd):

    def __init__(self, body: dict):
        """Store request body when command is instantiated."""
        self.body = body

    def execute(self):
        try:
            logger.info("🚀 Creating new Sales Plan...")

            # ---------------------- Extract fields ----------------------
            vendor_id = self.body.get("vendor_id", "").strip()
            period = self.body.get("period", "").strip().upper()
            region = self.body.get("region", "").strip()
            products = self.body.get("products", [])

            for p in products:
                if "product_id" not in p or not p["product_id"]:
                    raise ParamError("Each product must have a 'product_id'.")
                if "name" not in p or not p["name"]:
                    raise ParamError("Each product must have a 'name'.")
                if "target_units" not in p or int(p["target_units"]) < 1:
                    raise ParamError("Each product must have 'target_units' ≥ 1.")
                if "target_value" not in p or float(p["target_value"]) < 0:
                    raise ParamError("Each product must have 'target_value' ≥ 0.")

            # ---------------------- Convert to ProductTargetMap ----------------------
            product_maps = [
                ProductTargetMap(
                    product_id=str(p["product_id"]),
                    name=str(p["name"]),
                    target_units=int(p["target_units"]),
                    target_value=float(p["target_value"])
                )
                for p in products
            ]

            # ---------------------- Check duplicates ----------------------
            existing_plan = SalesPlanModel.find_existing_plan(vendor_id, period)
            if existing_plan:
                raise ParamError("The vendor already has an active plan for this period.")

            # ---------------------- Create the new plan ----------------------
            plan = SalesPlanModel.create(
                vendor_id=vendor_id,
                period=period,
                region=region,
                products=product_maps,
            )

            logger.info(f"✅ Sales Plan successfully created: {plan.plan_id}")

            return {
                "message": "Sales Plan successfully created.",
                "plan": plan.to_dict()
            }

        except ParamError as e:
            raise e
        except Exception as e:
            logger.error(f"❌ Error while creating Sales Plan: {e}")
            raise ApiError(f"Error while creating Sales Plan: {str(e)}")
