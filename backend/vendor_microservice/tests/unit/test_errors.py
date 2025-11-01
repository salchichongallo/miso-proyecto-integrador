from src.errors.errors import ParamError

class TestParamError:
    def test_first_from(self):
        messages = {
            "name": ["This field is required.", "Must be a string."],
            "price": ["Must be a positive number."]
        }
        error = ParamError.first_from(messages)
        assert isinstance(error, ParamError)
        assert error.description == "name: This field is required."
        assert error.code == 400
