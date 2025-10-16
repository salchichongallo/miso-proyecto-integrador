from marshmallow import Schema, fields, validate, ValidationError
from ..errors.errors import ParamError


class NewClientJsonSchema(Schema):
    name = fields.String(
        required=True,
        validate=validate.Length(min=2, max=255),
        error_messages={"required": "El nombre de la institución es obligatorio."}
    )

    tax_id = fields.String(
        required=True,
        validate=validate.Length(min=5, max=20),
        error_messages={"required": "El identificador tributario (NIT/RUC) es obligatorio."}
    )

    country = fields.String(
        required=True,
        validate=validate.Length(equal=2),
        error_messages={"required": "El país es obligatorio (código ISO de 2 letras)."}
    )

    level = fields.String(
        required=True,
        validate=validate.OneOf(["I", "II", "III", "IV"]),
        error_messages={"required": "El nivel de la institución es obligatorio."}
    )

    specialty = fields.String(
        required=True,
        validate=validate.Length(min=2, max=100),
        error_messages={"required": "La especialidad es obligatoria."}
    )

    location = fields.String(
        required=True,
        validate=validate.Length(min=2, max=255),
        error_messages={"required": "La ubicación es obligatoria."}
    )

    @staticmethod
    def check(json):
        """Valida el cuerpo del request y lanza ParamError si hay errores."""
        try:
            NewClientJsonSchema().load(json)
        except ValidationError as exception:
            raise ParamError.first_from(exception.messages)
