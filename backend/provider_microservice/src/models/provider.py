import os
import datetime
import logging
from marshmallow import Schema, fields, validate, ValidationError

from pynamodb.models import Model
from pynamodb.attributes import (
    UnicodeAttribute,
    UTCDateTimeAttribute
)

from ..errors.errors import ParamError

logger = logging.getLogger(__name__)


class NewProviderSchema(Schema):
    name = fields.String(required=True)
    country = fields.String(required=True)
    nit = fields.String(required=True, validate=validate.Length(equal=10))
    address = fields.String(required=True)
    email = fields.Email(required=True)
    phone = fields.String(required=True, validate=validate.Length(equal=10))

    @staticmethod
    def check(json_data):
        try:
            NewProviderSchema().load(json_data)
        except ValidationError as err:
            raise ParamError.first_from(err.messages)



class ProviderModel(Model):
    """
    Modelo DynamoDB para tabla Providers.
    PK: nit
    """

    class Meta:
        table_name = os.getenv("DYNAMODB_TABLE_PROVIDERS", "Providers")
        region = os.getenv("AWS_REGION", "us-east-1")
        host = os.getenv("DYNAMODB_ENDPOINT") or None

        if os.getenv("APP_ENV") != "PROD":
            aws_access_key_id = os.getenv("AWS_ACCESS_KEY_ID", "dummy")
            aws_secret_access_key = os.getenv("AWS_SECRET_ACCESS_KEY", "dummy")
            aws_session_token = os.getenv("AWS_SESSION_TOKEN", None)

    # Primary Key
    nit = UnicodeAttribute(hash_key=True)

    # Campos
    nit_encrypted = UnicodeAttribute(null=True)
    provider_id = UnicodeAttribute(null=True)
    name = UnicodeAttribute()
    country = UnicodeAttribute()
    address = UnicodeAttribute(null=True)
    email = UnicodeAttribute()
    phone = UnicodeAttribute()

    created_at = UTCDateTimeAttribute(null=True)
    updated_at = UTCDateTimeAttribute(null=True)

    # ============================================================
    # 🔹 MÉTODOS
    # ============================================================

    @classmethod
    def find(cls, nit: str):
        """Busca por NIT."""
        try:
            return cls.get(hash_key=nit)
        except cls.DoesNotExist:
            return None

    @classmethod
    def get_all(cls):
        providers = list(cls.scan())
        return [p.to_dict() for p in providers]

    @classmethod
    def create(cls, **kwargs):

        nit = kwargs["nit"]
        if cls.find(nit):
            raise ParamError("El NIT ya está registrado.")

        provider = cls(**kwargs)

        now = datetime.datetime.now(datetime.timezone.utc)
        provider.created_at = provider.updated_at = now

        provider.save()
        return provider

    @classmethod
    def find_by_email(cls, email: str):
        """Busca un proveedor por email (no es clave primaria)."""
        try:
            results = cls.scan(cls.email == email)
            for provider in results:
                return provider
            return None
        except Exception as e:
            logger.error(f"Error searching provider by email: {str(e)}")
            raise ParamError("Error buscando email en la base de datos.")
        

    def to_dict(self):
        return {
            "nit": self.nit,
            "nit_encrypted": self.nit_encrypted,
            "provider_id": self.provider_id,
            "name": self.name,
            "country": self.country,
            "address": self.address,
            "email": self.email,
            "phone": self.phone,
            "created_at": self.created_at.isoformat() if self.created_at else None,
            "updated_at": self.updated_at.isoformat() if self.updated_at else None,
        }
