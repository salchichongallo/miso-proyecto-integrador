import os
import datetime
from uuid import uuid4
from pynamodb.models import Model
from marshmallow import Schema, fields, validate, ValidationError
from pynamodb.attributes import UnicodeAttribute, NumberAttribute, UTCDateTimeAttribute

from ..errors.errors import ParamError


class NewWarehouseSchema(Schema):
    name = fields.String(required=True, validate=validate.Length(min=2, max=100))
    address = fields.String(required=True, validate=validate.Length(min=2, max=100))
    country = fields.String(required=True, validate=validate.Length(min=2, max=100))
    city = fields.String(required=True, validate=validate.Length(min=2, max=100))
    capacity = fields.Integer(required=True, validate=validate.Range(min=1))

    @staticmethod
    def check(json):
        try:
            NewWarehouseSchema().load(json)
        except ValidationError as exception:
            raise ParamError.first_from(exception.messages)


class WarehouseModel(Model):
    """
    Modelo PynamoDB para las bodegas.
    """

    class Meta:
        table_name = os.getenv("DYNAMODB_WAREHOUSE_TABLE", "Warehouses")
        region = os.getenv("AWS_REGION", "us-east-1")
        host = os.getenv("DYNAMODB_ENDPOINT") if os.getenv("DYNAMODB_ENDPOINT") else None
        aws_access_key_id = os.getenv("AWS_ACCESS_KEY_ID", "dummy")
        aws_secret_access_key = os.getenv("AWS_SECRET_ACCESS_KEY", "dummy")
        aws_session_token = os.getenv("AWS_SESSION_TOKEN", None)

    # Primary Key
    id = UnicodeAttribute(hash_key=True)

    # Attributes
    name = UnicodeAttribute()
    address = UnicodeAttribute()
    country = UnicodeAttribute()
    city = UnicodeAttribute()
    capacity = NumberAttribute()

    # Timestamps
    created_at = UTCDateTimeAttribute(null=True)
    updated_at = UTCDateTimeAttribute(null=True)

    @classmethod
    def create(cls, **kwargs):
        warehouse = WarehouseModel(**kwargs)
        warehouse.id = str(uuid4())
        warehouse.created_at = warehouse.updated_at = datetime.datetime.now(datetime.timezone.utc)
        warehouse.save()
        return warehouse

    @classmethod
    def get_all(cls):
        return list(cls.scan())

    def to_dict(self):
        return {
            "id": self.id,
            "name": self.name,
            "address": self.address,
            "country": self.country,
            "city": self.city,
            "capacity": self.capacity,
            "created_at": self.created_at.isoformat() if self.created_at else None,
            "updated_at": self.updated_at.isoformat() if self.updated_at else None,
        }

    @classmethod
    def populate(cls):
        main_warehouse = cls(
            id="1",
            name="Bodega Principal",
            address="Calle 123",
            country="Colombia",
            city="Medellin",
            capacity=100000,
            created_at=datetime.datetime.now(datetime.timezone.utc),
            updated_at=datetime.datetime.now(datetime.timezone.utc),
        )
        main_warehouse.save()
