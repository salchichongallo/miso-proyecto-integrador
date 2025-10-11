class ApiError(Exception):
    code = 422
    description = "Default message"


class DuplicatedUserError(ApiError):
    code = 412
    description = "User already exists"


class ParamError(ApiError):
    code = 400

    def __init__(self, description):
        self.description = description

    @staticmethod
    def first_from(messages):
        (field, validations) = list(messages.items())[0]
        return ParamError(f"{field}: {validations[0]}")


class UserNotFoundError(ApiError):
    code = 404
    description = 'User not found.'


class InvalidCredentialsErrors(ApiError):
    code = 404
    description = 'Invalid credentials.'


class MissingAuthParams(ApiError):
    code = 400
    description = 'Missing auth params.'


class TokenNotProvidedError(ApiError):
    code = 403
    description = 'Token not provided.'


class InvalidTokenError(ApiError):
    code = 401
    description = 'Invalid token.'


class UnverifiedUserError(ApiError):
    code = 401
    description = 'User is not verified.'
