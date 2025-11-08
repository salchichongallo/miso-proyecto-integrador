import os
import datetime
import random
from enum import Enum
from pynamodb.models import Model
from uuid import uuid4
from marshmallow import Schema, fields, validate, ValidationError
from pynamodb.attributes import UnicodeAttribute, UTCDateTimeAttribute, ListAttribute
from ..errors.errors import ParamError

# Bodegas de despacho
DISPATCH_WAREHOUSES = [
    "Calle 80 #45-21, Bogotá, Cundinamarca",
    "Carrera 7 #26-20, Bogotá, Cundinamarca",
    "Avenida El Dorado #69-76, Bogotá, Cundinamarca",
    "Calle 10 #15-30, Medellín, Antioquia",
    "Carrera 50 #20-10, Cali, Valle del Cauca",
    "Avenida 6 #32-14, Barranquilla, Atlántico",
    "Carrera 38 #5A-35, Cartagena, Bolívar",
    "Calle 44 #65-23, Bucaramanga, Santander",
    "Carrera 5 #14-55, Pereira, Risaralda",
    "Avenida Santander #40-32, Manizales, Caldas",
    "Carrera 27 #51-43, Cúcuta, Norte de Santander",
    "Calle 25 #8-42, Pasto, Nariño",
    "Avenida Simón Bolívar #12-30, Popayán, Cauca",
    "Carrera 15 #45-12, Ibagué, Tolima",
    "Calle 30 #4B-21, Neiva, Huila",
    "Avenida 4 #20-50, Villavicencio, Meta",
    "Carrera 9 #18-22, Tunja, Boyacá",
    "Calle 11 #9-70, Santa Marta, Magdalena",
    "Carrera 1 #23-45, Montería, Córdoba",
    "Avenida Los Libertadores #8-24, Yopal, Casanare"
]

# Conductores y vehículos
DRIVERS = [
    "Carlos Rodríguez", "Ana Torres", "Luis Fernández", "María Gómez",
    "Jorge Ramírez", "Paula Martínez", "Andrés Rojas", "Camila Suárez",
    "Felipe Castro", "Laura Mendoza"
]

VEHICLES = [
    {"model": "Renault Kangoo", "plate": "ABC-123"},
    {"model": "Chevrolet N300", "plate": "XYZ-987"},
    {"model": "Nissan Frontier", "plate": "KLM-456"},
    {"model": "Toyota Hilux", "plate": "JPR-875"},
    {"model": "Ford Ranger", "plate": "FTD-332"},
    {"model": "Hyundai H100", "plate": "BGT-220"},
    {"model": "Isuzu D-Max", "plate": "ZXA-908"},
    {"model": "Kia Sportage", "plate": "TDS-445"},
]


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


# 🧾 Validación de producto
class ProductSchema(Schema):
    id = fields.String(required=True)
    name = fields.String(required=True)
    amount = fields.Integer(required=True, validate=validate.Range(min=1))
    id_warehouse = fields.String(required=True)
    unit_price = fields.Float(required=True, validate=validate.Range(min=0.0))


# 🧾 Validación del cuerpo de nueva orden
class NewOrderJsonSchema(Schema):
    priority = fields.String(required=True, validate=validate.OneOf([level.value for level in PriorityLevel]))
    products = fields.List(fields.Nested(ProductSchema), required=True)
    order_status = fields.String(required=False, validate=validate.OneOf([status.value for status in OrderStatus]))
    country = fields.String(required=True)
    city = fields.String(required=True)
    address = fields.String(required=True)
    date_estimated = fields.Date(required=True)
    id_client = fields.String(required=True)
    id_vendor = fields.String(required=True)

    @staticmethod
    def check(json):
        try:
            NewOrderJsonSchema().load(json)
        except ValidationError as exception:
            raise ParamError.first_from(exception.messages)


# 📦 Modelo principal
class OrderModel(Model):
    """ Modelo PynamoDB para la tabla Orders"""

    class Meta:
        table_name = os.getenv("DYNAMODB_TABLE", "Orders")
        region = os.getenv("AWS_REGION", "us-east-1")
        host = os.getenv("DYNAMODB_ENDPOINT") or None
        if os.getenv("APP_ENV") != "PROD":
            aws_access_key_id = os.getenv("AWS_ACCESS_KEY_ID", "dummy")
            aws_secret_access_key = os.getenv("AWS_SECRET_ACCESS_KEY", "dummy")
            aws_session_token = os.getenv("AWS_SESSION_TOKEN", None)

    # Clave primaria
    id = UnicodeAttribute(hash_key=True)

    # Atributos principales
    order_status = UnicodeAttribute(default=OrderStatus.PENDING.value)
    priority = UnicodeAttribute()
    products = ListAttribute(default=list)
    id_client = UnicodeAttribute(null=True)
    id_vendor = UnicodeAttribute(null=True)
    country = UnicodeAttribute(null=True)
    city = UnicodeAttribute(null=True)
    address = UnicodeAttribute(null=True)
    dispatch_warehouse = UnicodeAttribute(null=True)

    # Fechas
    date_estimated = UTCDateTimeAttribute(null=True)
    delivery_date = UTCDateTimeAttribute(null=True)
    created_at = UTCDateTimeAttribute(null=True)
    updated_at = UTCDateTimeAttribute(null=True)

    # Logística
    driver_name = UnicodeAttribute(null=True)
    delivery_vehicle = UnicodeAttribute(null=True)

    # Métodos de clase
    @classmethod
    def create(cls, **kwargs):
        """Crea una nueva orden con valores automáticos"""
        now = datetime.datetime.now(datetime.timezone.utc)

        kwargs["dispatch_warehouse"] = random.choice(DISPATCH_WAREHOUSES)
        kwargs["order_status"] = random.choice([s.value for s in OrderStatus])
        kwargs["driver_name"] = random.choice(DRIVERS)
        vehicle = random.choice(VEHICLES)
        kwargs["delivery_vehicle"] = f"{vehicle['model']} ({vehicle['plate']})"

        kwargs["date_estimated"] = datetime.datetime.fromisoformat(kwargs["date_estimated"]).replace(tzinfo=datetime.timezone.utc)

        # Fecha de entrega aleatoria entre 2 y 15 días después
        delivery_days = random.randint(2, 15)
        kwargs["delivery_date"] = now + datetime.timedelta(days=delivery_days)

        order = OrderModel(**kwargs)
        order.id = str(uuid4())
        order.created_at = order.updated_at = now
        order.save()
        return order

    @classmethod
    def get_all(cls):
        """Obtiene todas las órdenes"""
        try:
            return [order.to_dict() for order in cls.scan()]
        except Exception as e:
            raise Exception(f"Error retrieving orders: {str(e)}")

    @classmethod
    def get_by_client(cls, client_id: str):
        """Obtiene órdenes por ID de cliente"""
        try:
            orders = list(cls.scan(cls.id_client == client_id))
            return [order.to_dict() for order in orders]
        except Exception as e:
            raise Exception(f"Error retrieving orders for client {client_id}: {str(e)}")

    @classmethod
    def find_existing_order(cls, id: str):
        """Busca una orden por su ID"""
        try:
            return cls.get(hash_key=id)
        except cls.DoesNotExist:
            return None

    # 📤 Serialización
    def to_dict(self):
        """Convierte el modelo a un diccionario con fechas ISO"""
        return {
            "id": self.id,
            "priority": self.priority,
            "id_client": self.id_client,
            "id_vendor": self.id_vendor,
            "country": self.country,
            "city": self.city,
            "address": self.address,
            "dispatch_warehouse": self.dispatch_warehouse,
            "driver_name": self.driver_name,
            "delivery_vehicle": self.delivery_vehicle,
            "order_status": self.order_status,
            "products": self.products,
            "date_estimated": self.date_estimated.isoformat() if self.date_estimated else None,
            "delivery_date": self.delivery_date.isoformat() if self.delivery_date else None,
            "created_at": self.created_at.isoformat() if self.created_at else None,
            "updated_at": self.updated_at.isoformat() if self.updated_at else None,
        }
