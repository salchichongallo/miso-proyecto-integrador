from src.models.product import NewProductJsonSchema


class TestNewProductJsonSchema:
    def build_valid_payload(self, **overrides):
        payload = {
            "warehouse": "WH123",
            "sku": "SKU12345",
            "provider_nit": "1234567890",
            "name": "Producto de prueba",
            "batch": "Lote1",
            "expiration_date": "2024-12-31",
            "price": 100.0,
            "quantity": 50,
        }
        payload.update(overrides)
        return payload

    def test_warehouse_id_required(self):
        payload = self.build_valid_payload(warehouse=None)
        schema = NewProductJsonSchema()
        errors = schema.validate(payload)
        assert "warehouse" in errors

    def test_sku_required(self):
        payload = self.build_valid_payload(sku=None)
        schema = NewProductJsonSchema()
        errors = schema.validate(payload)
        assert "sku" in errors
