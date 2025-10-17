class ApiError(Exception):
    code = 422
    description = "Default message"

class ParamError(ApiError):
    code = 400

    def __init__(self, description):
        self.description = description

    @staticmethod
    def first_from(messages):
        (field, validations) = list(messages.items())[0]
        return ParamError(f"{field}: {validations[0]}")

