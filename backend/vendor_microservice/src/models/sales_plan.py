import os
import datetime
from uuid import uuid4
from pynamodb.models import Model
from pynamodb.attributes import UnicodeAttribute, ListAttribute, UTCDateTimeAttribute, MapAttribute, NumberAttribute
from marshmallow import Schema, fields, validate, ValidationError
from ..errors.errors import ParamError


# ---------------------- SCHEMA DE VALIDACIÓN ----------------------

class ProductTargetSchema(Schema):
    """🎯 Schema for individual product goals in a sales plan."""
    product_id = fields.String(required=True, error_messages={"required": "Product ID is required."})
    name = fields.String(required=True, error_messages={"required": "Product name is required."})
    target_units = fields.Integer(
        required=True,
        validate=validate.Range(min=1),
        error_messages={"required": "Target units are required."}
    )
    target_value = fields.Float(
        required=True,
        validate=validate.Range(min=0),
        error_messages={"required": "Target value is required."}
    )


class NewSalesPlanJsonSchema(Schema):
    """🧾 Validation schema for creating a sales plan."""

    vendor_id = fields.String(
        required=True,
        error_messages={"required": "The field 'vendor_id' is required."}
    )

    period = fields.String(
        required=True,
        validate=validate.Length(min=3, max=50),
        error_messages={"required": "The field 'period' is required."}
    )

    region = fields.String(
        required=True,
        validate=validate.Length(min=2, max=100),
        error_messages={"required": "The field 'region' is required."}
    )

    products = fields.List(
        fields.Nested(ProductTargetSchema),
        required=True,
        validate=validate.Length(min=1, max=100, error="Must include between 1 and 100 products."),
        error_messages={"required": "The field 'products' is required."}
    )

    @staticmethod
    def check(json_data):
        """Validates the request body and raises ParamError if errors exist."""
        try:
            NewSalesPlanJsonSchema().load(json_data)
        except ValidationError as exception:
            raise ParamError.first_from(exception.messages)


# ---------------------- MODELO DE PYNAMODB ----------------------

class ProductTargetMap(MapAttribute):
    """🧩 Subdocumento para almacenar metas por producto."""
    product_id = UnicodeAttribute()
    name = UnicodeAttribute()
    target_units = NumberAttribute()
    target_value = NumberAttribute()


class SalesPlanModel(Model):
    """
    📊 PynamoDB Model for the SalesPlans table
    """

    class Meta:
        table_name = os.getenv("DYNAMODB_TABLE_SALES_PLANS", "SalesPlans")
        region = os.getenv("AWS_REGION", "us-east-1")
        host = os.getenv("DYNAMODB_ENDPOINT") if os.getenv("DYNAMODB_ENDPOINT") else None
        if os.getenv("APP_ENV") != "PROD":
            aws_access_key_id = os.getenv("AWS_ACCESS_KEY_ID", "dummy")
            aws_secret_access_key = os.getenv("AWS_SECRET_ACCESS_KEY", "dummy")
            aws_session_token = os.getenv("AWS_SESSION_TOKEN", None)

    # Primary Key
    plan_id = UnicodeAttribute(hash_key=True)

    # Attributes
    vendor_id = UnicodeAttribute()
    period = UnicodeAttribute()
    region = UnicodeAttribute()
    products = ListAttribute(of=ProductTargetMap, default=list)

    # Metadata
    created_at = UTCDateTimeAttribute(null=True)
    updated_at = UTCDateTimeAttribute(null=True)

    # ---------------------- MÉTODOS ----------------------

    @classmethod
    def find_existing_plan(cls, vendor_id: str, period: str):
        """🔎 Checks if a vendor already has an active plan for the same period."""
        try:
            for plan in cls.scan((cls.vendor_id == vendor_id) & (cls.period == period)):
                return plan
            return None
        except Exception as e:
            raise Exception(f"Error checking existing sales plan: {str(e)}")

    @classmethod
    def get_all(cls):
        """ Returns all sales plans."""
        try:
            plans = list(cls.scan())
            return [p.to_dict() for p in plans]
        except Exception as e:
            raise Exception(f"Error retrieving sales plans: {str(e)}")

    @classmethod
    def create(cls, **kwargs):
        """Creates a new sales plan, ensuring one per vendor per period."""
        vendor_id = kwargs.get("vendor_id")
        period = kwargs.get("period")

        # Prevent duplicate plans for same vendor & period
        existing = cls.find_existing_plan(vendor_id, period)
        if existing:
            raise ParamError("The vendor already has an active plan for this period.")

        plan = SalesPlanModel(**kwargs)
        plan.plan_id = str(uuid4())

        # Always store timestamps in UTC
        now_utc = datetime.datetime.now(datetime.timezone.utc)
        plan.created_at = plan.updated_at = now_utc

        plan.save()
        return plan

    def to_dict(self):
        """Converts the model to a serializable dictionary."""
        return {
            "plan_id": self.plan_id,
            "vendor_id": self.vendor_id,
            "period": self.period,
            "region": self.region,
            "products": [
                {
                    "product_id": p.product_id,
                    "name": p.name,
                    "target_units": p.target_units,
                    "target_value": p.target_value,
                }
                for p in self.products
            ],
            "created_at": self.created_at.isoformat() if self.created_at else None,
            "updated_at": self.updated_at.isoformat() if self.updated_at else None,
        }
