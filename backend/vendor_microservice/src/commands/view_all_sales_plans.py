import logging
from .base_command import BaseCommannd
from ..errors.errors import ApiError
from ..models.sales_plan import SalesPlanModel

logger = logging.getLogger(__name__)

class GetAllSalesPlans(BaseCommannd):
    """
    📋 Command: Retrieves all Sales Plans from DynamoDB.
    """

    def execute(self):
        try:
            logger.info("📊 Retrieving all Sales Plans...")

            plans = SalesPlanModel.get_all()

            logger.info(f"✅ Retrieved {len(plans)} sales plans successfully.")
            return plans

        except ApiError as e:
            raise e
        except Exception as e:
            logger.error(f"❌ Error retrieving Sales Plans: {e}")
            raise ApiError(f"Error retrieving Sales Plans: {str(e)}")
