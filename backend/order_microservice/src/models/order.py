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



class NewOrderJsonSchema(Schema):

    priority = fields.String(
        required=True,
        validate=validate.OneOf([level.value for level in PriorityLevel], error="El nivel de prioridad no es válido."),
        error_messages={"required": "El nivel de prioridad es obligatorio."}
    )

    products = fields.List(
        fields.Nested(ProductSchema),
        required=True,
        validate=validate.Length(min=1, error="La lista de productos no puede estar vacía."),
        error_messages={"required": "La lista de productos es obligatoria."}
    )

    order_status = fields.String(
        required=False,
        validate=validate.OneOf([status.value for status in OrderStatus], error="El estado de la orden no es válido."),
    )

    country = fields.String(
        required=True,
        error_messages={"required": "El país es obligatorio."}
    )

    city = fields.String(
        required=True,
        error_messages={"required": "La ciudad es obligatoria."}
    )

    address = fields.String(
        required=True,
        error_messages={"required": "La dirección es obligatoria."}
    )

    date_estimated = fields.Date(
        required=True,
        error_messages={"required": "La fecha estimada es obligatoria."}
    )

    id_client = fields.String(
        required=True,
        error_messages={"required": "El ID del cliente es obligatorio."}
    )

    id_vendor = fields.String(
        required=True,
        error_messages={"required": "El ID del vendedor es obligatorio."}
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
    def find_existing_order(cls, id: str):
        """Busca una orden por su id (clave primaria)."""
        try:
            order = cls.get(hash_key=id)
            return order
        except cls.DoesNotExist:
            return None

    @classmethod
    def get_all(cls):
        """
        Retorna todas las órdenes almacenadas en la tabla Orders.
        """
        try:
            orders = list(cls.scan())
            return [order.to_dict() for order in orders]
        except Exception as e:
            raise Exception(f"Error retrieving orders: {str(e)}")

    @classmethod
    def create(cls, **kwargs):
        """Crea una nueva orden en la base de datos."""
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
