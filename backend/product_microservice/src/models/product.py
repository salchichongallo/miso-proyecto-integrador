from marshmallow import Schema, fields, validate, ValidationError
from datetime import datetime
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
