from marshmallow import Schema, fields, validate, ValidationError
from ..errors.errors import ParamError

class NewVendorJsonSchema(Schema):
    name = fields.String(
        required=True,
        validate=validate.Length(min=1, max=255),
    )

    email = fields.Email(
        required=True,
        validate=validate.Length(max=255),
        error_messages={"required": "El campo email es obligatorio."}
    )

    institutions = fields.List(
        fields.String(validate=validate.Length(min=1, max=255)),
        required=True,
        validate=validate.Length(max=30),
    )

    @staticmethod
    def check(json):
        try:
            NewVendorJsonSchema().load(json)
        except ValidationError as exception:
            raise ParamError.first_from(exception.messages)
