import os
import datetime
from enum import Enum
from pynamodb.models import Model
from uuid import uuid4
from marshmallow import Schema, fields, validate, ValidationError
from pynamodb.attributes import UnicodeAttribute, UTCDateTimeAttribute, ListAttribute
from ..errors.errors import ParamError



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


class NewOrderJsonSchema(Schema):


    priority = fields.String(
        required=True,
        validate=validate.OneOf([level.value for level in PriorityLevel], error="El nivel de prioridad no es válido."),
        error_messages={"required": "El nivel de prioridad es obligatorio."}
    )

    products = fields.List(
        fields.Dict(),
        required=True,
        validate=validate.Length(min=1, error="La lista de productos no puede estar vacía."),
        error_messages={"required": "La lista de productos es obligatoria."}
    )



    @staticmethod
    def check(json):
        """Valida el cuerpo del request y lanza ParamError si hay errores."""
        try:
            NewOrderJsonSchema().load(json)
        except ValidationError as exception:
            raise ParamError.first_from(exception.messages)


class OrderModel(Model):
    """
    Modelo PynamoDB para la tabla Orders
    """
    class Meta:
        table_name = os.getenv("DYNAMODB_TABLE", "Orders")
        region = os.getenv("AWS_REGION", "us-east-1")
        host = os.getenv("DYNAMODB_ENDPOINT") if os.getenv("DYNAMODB_ENDPOINT") else None
        aws_access_key_id = os.getenv("AWS_ACCESS_KEY_ID", "dummy")
        aws_secret_access_key = os.getenv("AWS_SECRET_ACCESS_KEY", "dummy")

    # Primary Key
    # id should be the hash (partition) key for Orders
    id = UnicodeAttribute(hash_key=True)

    # Atributos del producto
    status = UnicodeAttribute(default=OrderStatus.PENDING.value)
    priority = UnicodeAttribute()
    products = ListAttribute(default=list)

    # Timestamps
    created_at = UTCDateTimeAttribute(null=True)
    updated_at = UTCDateTimeAttribute(null=True)

    @classmethod
    def find_existing_order(cls, id: str):
        """Busca una orden por su id (clave primaria)."""
        try:
            order = cls.get(hash_key=id)
            return order
        except cls.DoesNotExist:
            return None


    @classmethod
    def create(cls, **kwargs):
        order = OrderModel(**kwargs)
        order.id = str(uuid4())
        order.created_at = order.updated_at = datetime.datetime.now(datetime.timezone.utc)
        order.save()
        return order



    def to_dict(self):
        return {
            "id": self.id,
            "status": self.status,
            "priority": self.priority,
            "products": self.products,
            "created_at": self.created_at.isoformat() if self.created_at else None,
            "updated_at": self.updated_at.isoformat() if self.updated_at else None,
        }
