import logging
from collections import defaultdict
from .base_command import BaseCommannd
from ..errors.errors import ApiError
from ..models.sales_plan import SalesPlanModel
from ..models.order import OrderModel

logger = logging.getLogger(__name__)

class ViewReportVendor(BaseCommannd):

    def __init__(self, vendor_id: str):
        self.vendor_id = vendor_id

    def execute(self):
        try:
            logger.info(f"Generating report for vendor={self.vendor_id}")

            # Obtener planes del vendedor
            plans = SalesPlanModel.get_by_vendor(self.vendor_id)
            logger.info(f"Found {len(plans)} sales plans: {plans}")

            total_target_value = sum(
                sum(p.get("target_value", 0) for p in plan.get("products", []))
                for plan in plans
            )

            total_target_units = sum(
                sum(p.get("target_units", 0) for p in plan.get("products", []))
                for plan in plans
            )

            # Obtener órdenes del vendedor
            orders = OrderModel.get_by_vendor(self.vendor_id)
            logger.info(f"Found {len(orders)} orders: {orders}")

            ordered_products = len(orders)
            customers_served = len(set(order.get("id_client") for order in orders if order.get("id_client")))

            sold_products = defaultdict(lambda: {"name": "", "quantity": 0})
            total_sales = 0.0
            total_units_sold = 0

            # Consolidar productos vendidos
            for order in orders:
                for product in order.get("products", []):
                    pid = product.get("id")
                    name = product.get("name", "")
                    qty = product.get("amount", 0)
                    price = product.get("unit_price", 0)

                    sold_products[pid]["name"] = name
                    sold_products[pid]["quantity"] += qty

                    total_units_sold += qty
                    total_sales += qty * price

            # Calcular métricas
            sales_percentage = (total_sales / total_target_value * 100) if total_target_value > 0 else 0
            remaining_to_goal = max(total_target_value - total_sales, 0.0)

            # 5️⃣ Construir respuesta (en snake_case)
            response = {
                "vendor_id": self.vendor_id,
                "ordered_products": ordered_products,
                "customers_served": customers_served,
                "total_sales": round(total_sales, 2),
                "total_units_sold": total_units_sold,
                "target_units": total_target_units,
                "target_value": round(total_target_value, 2),
                "remaining_to_goal": round(remaining_to_goal, 2),
                "sales_percentage": round(sales_percentage, 2),
                "sold_products": [
                    {
                        "id": pid,
                        "name": data["name"],
                        "quantity": data["quantity"]
                    }
                    for pid, data in sold_products.items()
                ],
            }
            return response

        except ApiError:
            raise
        except Exception as e:
            logger.exception("Error while generating vendor report")
            raise ApiError(f"Error while generating vendor report: {str(e)}")
