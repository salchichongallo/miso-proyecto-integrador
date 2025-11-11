import os
import datetime
from uuid import uuid4
from pynamodb.models import Model
from pynamodb.attributes import UnicodeAttribute, ListAttribute, UTCDateTimeAttribute
from marshmallow import Schema, fields, validate, ValidationError
from ..errors.errors import ParamError


class InstitutionSchema(Schema):
    client_id = fields.String()
    country = fields.String()
    level = fields.String()
    location = fields.String()
    name = fields.String()
    specialty = fields.String()
    tax_id = fields.String()
    tax_id_encrypted = fields.String()


class NewVendorJsonSchema(Schema):
    name = fields.String(
        required=True,
        validate=validate.Length(min=1, max=255),
        error_messages={"required": "El campo 'name' es obligatorio."}
    )

    email = fields.Email(
        required=True,
        validate=validate.Length(max=255),
        error_messages={"required": "El campo 'email' es obligatorio."}
    )

    institutions = fields.List(
        fields.Nested(InstitutionSchema),
        required=True,
        validate=validate.Length(min=1, max=30, error="Debe tener entre 1 y 30 instituciones."),
        error_messages={"required": "El campo 'institutions' es obligatorio."}
    )

    @staticmethod
    def check(json_data):
        """Valida el cuerpo del request y lanza ParamError si hay errores."""
        try:
            NewVendorJsonSchema().load(json_data)
        except ValidationError as exception:
            raise ParamError.first_from(exception.messages)


class VendorModel(Model):
    """
    Modelo PynamoDB para la tabla Vendors
    """
    class Meta:
        table_name = os.getenv("DYNAMODB_TABLE", "Vendors")
        region = os.getenv("AWS_REGION", "us-east-1")
        host = os.getenv("DYNAMODB_ENDPOINT") if os.getenv("DYNAMODB_ENDPOINT") else None
        if os.getenv("APP_ENV") != "PROD":
            aws_access_key_id = os.getenv("AWS_ACCESS_KEY_ID", "dummy")
            aws_secret_access_key = os.getenv("AWS_SECRET_ACCESS_KEY", "dummy")
            aws_session_token = os.getenv("AWS_SESSION_TOKEN", None)

    # Clave primaria (hash key)
    email = UnicodeAttribute(hash_key=True)

    # Atributos del vendedor
    vendor_id = UnicodeAttribute(null=True)
    name = UnicodeAttribute()
    institutions = ListAttribute(default=list)

    # Metadata
    created_at = UTCDateTimeAttribute(null=True)
    updated_at = UTCDateTimeAttribute(null=True)

    # ------------------- MÉTODOS -------------------

    @classmethod
    def find_existing_vendor(cls, email: str):
        """Busca un vendedor por email (clave primaria)."""
        try:
            return cls.get(hash_key=email)
        except cls.DoesNotExist:
            return None

    @classmethod
    def get_all(cls):
        """Retorna todos los vendedores."""
        try:
            vendors = list(cls.scan())
            return [v.to_dict() for v in vendors]
        except Exception as e:
            raise Exception(f"Error al obtener vendedores: {str(e)}")

    @classmethod
    def create(cls, **kwargs):
        """Crea un nuevo vendedor (email único)."""
        # Verificar si ya existe
        if cls.find_existing_vendor(kwargs["email"]):
            raise ParamError("El correo electrónico ya está registrado.")

        vendor = VendorModel(**kwargs)
        vendor.vendor_id = str(uuid4())
        vendor.created_at = vendor.updated_at = datetime.datetime.now(datetime.timezone.utc)
        vendor.save()
        return vendor

    def to_dict(self):
        return {
            "email": self.email,
            "vendor_id": self.vendor_id,
            "name": self.name,
            "institutions": self.institutions,
            "created_at": self.created_at.isoformat() if self.created_at else None,
            "updated_at": self.updated_at.isoformat() if self.updated_at else None,
        }
