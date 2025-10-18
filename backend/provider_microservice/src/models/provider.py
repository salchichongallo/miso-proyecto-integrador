from marshmallow import Schema, fields, validate, ValidationError
from ..errors.errors import ParamError


class NewProviderJsonSchema(Schema):
    name = fields.String(
        required=True,
        validate=validate.Length(min=2, max=255),
        error_messages={"required": "El nombre del proveedor es obligatorio."}
    )

    country = fields.String(
        required=True,
        validate=validate.Length(equal=2),
        error_messages={
            "required": "El país es obligatorio (usar código ISO de 2 letras, ej. 'CO', 'MX')."
        }
    )

    nit = fields.String(
        required=True,
        validate=validate.Length(min=5, max=20),
        error_messages={"required": "El NIT es obligatorio."}
    )

    address = fields.String(
        required=True,
        validate=validate.Length(min=5, max=255),
        error_messages={"required": "La dirección es obligatoria."}
    )

    email = fields.Email(
        required=True,
        error_messages={"required": "El email es obligatorio.", "invalid": "Formato de email inválido."}
    )

    phone = fields.String(
        required=True,
        validate=[
            validate.Regexp(
                regex=r"^\d{10}$",
                error="El teléfono debe contener exactamente 10 dígitos numéricos."
            )
        ],
        error_messages={"required": "El teléfono es obligatorio."}
    )

    @staticmethod
    def check(json):
        """Valida el cuerpo del request y lanza ParamError si hay errores."""
        try:
            NewProviderJsonSchema().load(json)
        except ValidationError as exception:
            raise ParamError.first_from(exception.messages)
