import os
import logging
import datetime
from uuid import uuid4
from pynamodb.models import Model
from pynamodb.attributes import (
    UnicodeAttribute,
    ListAttribute,
    UTCDateTimeAttribute
)
from marshmallow import Schema, fields, validate, ValidationError
from ..errors.errors import ParamError

logger = logging.getLogger(__name__)


# ---------------------- SCHEMAS ----------------------

class NewVisitJsonSchema(Schema):
    client_id = fields.String(required=True)
    contact_name = fields.String(required=True, validate=validate.Length(min=1))
    contact_phone = fields.String(required=True)
    visit_datetime = fields.String(
        required=True,
        validate=validate.Regexp(
            r"^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}",
            error="La fecha debe estar en formato ISO 8601."
        )
    )
    observations = fields.String(required=True)
    bucket_data = fields.List(fields.String(), required=False)

    @staticmethod
    def check(json_data):
        try:
            NewVisitJsonSchema().load(json_data)
        except ValidationError as e:
            raise ParamError.first_from(e.messages)


# ---------------------- MODEL ----------------------

class VisitModel(Model):
    """
    Modelo DynamoDB para registrar visitas comerciales.
    """

    class Meta:
        table_name = os.getenv("DYNAMODB_TABLE_VISITS", "Visits")
        region = os.getenv("AWS_REGION", "us-east-1")
        host = os.getenv("DYNAMODB_ENDPOINT") or None

        if os.getenv("APP_ENV") != "PROD":
            aws_access_key_id = os.getenv("AWS_ACCESS_KEY_ID", "dummy")
            aws_secret_access_key = os.getenv("AWS_SECRET_ACCESS_KEY", "dummy")
            aws_session_token = os.getenv("AWS_SESSION_TOKEN", None)

    # PK
    visit_id = UnicodeAttribute(hash_key=True)

    # Campos requeridos
    client_id = UnicodeAttribute()
    contact_name = UnicodeAttribute()
    contact_phone = UnicodeAttribute()
    visit_datetime = UnicodeAttribute()
    vendor_id = UnicodeAttribute()

    # Campos opcionales
    observations = UnicodeAttribute(null=True)
    bucket_data = ListAttribute(default=list)

    # Metadata
    created_at = UTCDateTimeAttribute(null=True)
    updated_at = UTCDateTimeAttribute(null=True)

    # ---------------- Métodos ----------------

    @classmethod
    def create(cls, **kwargs):
        visit = cls(
            visit_id=str(uuid4()),
            vendor_id=kwargs["vendor_id"],
            client_id=kwargs["client_id"],
            contact_name=kwargs["contact_name"],
            contact_phone=kwargs["contact_phone"],
            visit_datetime=kwargs["visit_datetime"],
            observations=kwargs.get("observations", ""),
            bucket_data=kwargs.get("bucket_data", []),
        )

        now = datetime.datetime.now(datetime.timezone.utc)
        visit.created_at = visit.updated_at = now

        visit.save()
        return visit

    @classmethod
    def get_by_id(cls, visit_id):
        try:
            visit = cls.get(visit_id)
            return visit
        except cls.DoesNotExist:
            return None

    @classmethod
    def get_by_vendor(cls, vendor_id):
        items = list(cls.scan(cls.vendor_id == vendor_id))
        return [v.to_dict() for v in items]


    @classmethod
    def get_all(cls):
        items = list(cls.scan())
        return [v.to_dict() for v in items]

    def to_dict(self):
        return {
            "visit_id": self.visit_id,
            "client_id": self.client_id,
            "vendor_id": self.vendor_id,
            "contact_name": self.contact_name,
            "contact_phone": self.contact_phone,
            "visit_datetime": self.visit_datetime,
            "observations": self.observations,
            "bucket_data": self.bucket_data,
            "created_at": self.created_at.isoformat() if self.created_at else None,
            "updated_at": self.updated_at.isoformat() if self.updated_at else None,
        }
