from marshmallow import Schema, fields, validate, ValidationError
from datetime import datetime
from pynamodb.models import Model
from pynamodb.attributes import UnicodeAttribute, NumberAttribute, UTCDateTimeAttribute
import os
from ..errors.errors import ParamError


class NewProductJsonSchema(Schema):
    provider_nit = fields.String(
        required=True,
        validate=validate.Regexp(r"^\d{10}$", error="El NIT del proveedor debe tener exactamente 10 dígitos."),
        error_messages={"required": "El NIT del proveedor es obligatorio."}
    )

    name = fields.String(
        required=True,
        validate=validate.Length(min=2, max=255),
        error_messages={"required": "El nombre del producto es obligatorio."}
    )

    product_type = fields.String(
        required=True,
        validate=validate.Length(min=3, max=100),
        error_messages={"required": "El tipo de producto es obligatorio."}
    )

    stock = fields.Integer(
        required=True,
        validate=validate.Range(min=1, error="El stock debe ser mayor o igual a 1."),
        error_messages={"required": "El stock es obligatorio."}
    )

    expiration_date = fields.Date(
        required=True,
        error_messages={"required": "La fecha de vencimiento es obligatoria."}
    )

    temperature_required = fields.Float(
        required=True,
        error_messages={"required": "La temperatura requerida es obligatoria."}
    )

    batch = fields.String(
        required=True,
        validate=validate.Length(min=2, max=50),
        error_messages={"required": "El lote es obligatorio."}
    )

    status = fields.String(
        required=True,
        validate=validate.OneOf(["Disponible", "Agotado", "Vencido", "Pendiente"]),
        error_messages={"required": "El estado del producto es obligatorio."}
    )

    unit_value = fields.Float(
        required=True,
        validate=validate.Range(min=0.01, error="El valor unitario debe ser mayor que 0."),
        error_messages={"required": "El valor unitario es obligatorio."}
    )

    storage_conditions = fields.String(
        required=True,
        validate=validate.Length(min=5, max=255),
        error_messages={"required": "Las condiciones de almacenamiento son obligatorias."}
    )

    @staticmethod
    def check(json):
        """Valida el cuerpo del request y lanza ParamError si hay errores."""
        try:
            data = NewProductJsonSchema().load(json)
            if data["expiration_date"] <= datetime.now().date():
                raise ParamError("La fecha de vencimiento debe ser posterior a la fecha actual.")
        except ValidationError as exception:
            raise ParamError.first_from(exception.messages)


class ProductModel(Model):
    """
    Modelo PynamoDB para la tabla Products
    """
    class Meta:
        table_name = os.getenv("DYNAMODB_TABLE", "Products")
        region = os.getenv("AWS_REGION", "us-east-1")
        host = os.getenv("DYNAMODB_ENDPOINT") if os.getenv("DYNAMODB_ENDPOINT") else None
        aws_access_key_id = os.getenv("AWS_ACCESS_KEY_ID", "dummy")
        aws_secret_access_key = os.getenv("AWS_SECRET_ACCESS_KEY", "dummy")

    # Primary Key
    sku = UnicodeAttribute(hash_key=True)

    # Atributos del producto
    provider_nit = UnicodeAttribute()
    name = UnicodeAttribute()
    product_type = UnicodeAttribute()
    stock = NumberAttribute()
    expiration_date = UnicodeAttribute()  # Guardamos como string ISO
    temperature_required = NumberAttribute()
    batch = UnicodeAttribute()
    status = UnicodeAttribute()
    unit_value = NumberAttribute()
    storage_conditions = UnicodeAttribute()

    # Timestamps
    created_at = UTCDateTimeAttribute(null=True)
    updated_at = UTCDateTimeAttribute(null=True)

    @classmethod
    def find_existing_product(cls, provider_nit, name, batch):
        """
        Busca un producto existente por provider_nit, name y batch.
        Retorna el primer producto que coincida o None si no existe.
        """
        try:
            for product in cls.scan():
                if (product.provider_nit == provider_nit and
                    product.name == name and
                    product.batch == batch):
                    return product
            return None
        except Exception:
            return None

    def update_stock(self, additional_stock):
        """
        Actualiza el stock sumando la cantidad adicional.
        """
        self.stock = int(self.stock) + int(additional_stock)
        self.updated_at = datetime.utcnow()
        self.save()

    def to_dict(self):
        """
        Convierte el modelo a diccionario para respuestas JSON.
        """
        return {
            "sku": self.sku,
            "provider_nit": self.provider_nit,
            "name": self.name,
            "product_type": self.product_type,
            "stock": int(self.stock),
            "expiration_date": self.expiration_date,
            "temperature_required": float(self.temperature_required),
            "batch": self.batch,
            "status": self.status,
            "unit_value": float(self.unit_value),
            "storage_conditions": self.storage_conditions,
            "created_at": self.created_at.isoformat() if self.created_at else None,
            "updated_at": self.updated_at.isoformat() if self.updated_at else None,
        }
