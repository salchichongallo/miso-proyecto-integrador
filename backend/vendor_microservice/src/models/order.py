import os
import datetime
from enum import Enum
from pynamodb.models import Model
from uuid import uuid4
from marshmallow import Schema, fields, validate
from pynamodb.attributes import UnicodeAttribute, UTCDateTimeAttribute, ListAttribute



class OrderStatus(Enum):
    PENDING = "PENDING"
    CONFIRMED = "CONFIRMED"
    PROCESSING = "PROCESSING"
    SHIPPED = "SHIPPED"
    DELIVERED = "DELIVERED"
    CANCELLED = "CANCELLED"
    RETURNED = "RETURNED"


class PriorityLevel(Enum):
    LOW = "LOW"
    MEDIUM = "MEDIUM"
    HIGH = "HIGH"


class ProductSchema(Schema):
    id = fields.String(
        required=True,
        error_messages={"required": "Cada producto debe tener un ID."}
    )
    name = fields.String(
        required=True,
        error_messages={"required": "Cada producto debe tener un nombre."}
    )
    amount = fields.Integer(
        required=True,
        validate=validate.Range(min=1, error="El campo 'amount' debe ser mayor o igual a 1."),
        error_messages={"required": "Cada producto debe tener un campo 'amount'."}
    )

    id_warehouse = fields.String(
        required=True,
        error_messages={"required": "Cada producto debe tener un campo 'id_warehouse'."}
    )

    unit_price = fields.Float(
        required=True,
        validate=validate.Range(min=0.0, error="El campo 'unit_price' debe ser mayor o igual a 0.0."),
        error_messages={"required": "Cada producto debe tener un campo 'unit_price'."}
    )




class OrderModel(Model):
    """
    Modelo PynamoDB para la tabla Orders
    """
    class Meta:
        table_name = os.getenv("DYNAMODB_TABLE", "Orders")
        region = os.getenv("AWS_REGION", "us-east-1")
        host = os.getenv("DYNAMODB_ENDPOINT") if os.getenv("DYNAMODB_ENDPOINT") else None
        if os.getenv("APP_ENV") != "PROD":
            aws_access_key_id = os.getenv("AWS_ACCESS_KEY_ID", "dummy")
            aws_secret_access_key = os.getenv("AWS_SECRET_ACCESS_KEY", "dummy")
            aws_session_token = os.getenv("AWS_SESSION_TOKEN", None)

    # Primary Key
    # id should be the hash (partition) key for Orders
    id = UnicodeAttribute(hash_key=True)

    # Atributos del producto
    status = UnicodeAttribute(default=OrderStatus.PENDING.value)
    priority = UnicodeAttribute()
    products = ListAttribute(default=list)
    id_client = UnicodeAttribute(null=True)
    id_vendor = UnicodeAttribute(null=True)
    country = UnicodeAttribute(null=True)
    city = UnicodeAttribute(null=True)
    address = UnicodeAttribute(null=True)
    date_estimated = UnicodeAttribute(null=True)
    order_status = UnicodeAttribute(default=OrderStatus.PENDING.value)

    # Timestamps
    created_at = UTCDateTimeAttribute(null=True)
    updated_at = UTCDateTimeAttribute(null=True)


    @classmethod
    def get_by_vendor(cls, vendor_id: str):
        """Return all orders for a given vendor_id as dicts."""
        try:
            orders = list(cls.scan(cls.id_vendor == vendor_id))
            return [order.to_dict() for order in orders]
        except Exception as e:
            raise Exception(f"Error retrieving orders for vendor {vendor_id}: {str(e)}")


    def to_dict(self):
        return {
            "id": self.id,
            "status": self.status,
            "priority": self.priority,
            "id_client": self.id_client,
            "id_vendor": self.id_vendor,
            "country": self.country,
            "city": self.city,
            "address": self.address,
            "date_estimated": self.date_estimated,
            "products": self.products,
            "order_status": self.order_status,
            "created_at": self.created_at.isoformat() if self.created_at else None,
            "updated_at": self.updated_at.isoformat() if self.updated_at else None,
        }
