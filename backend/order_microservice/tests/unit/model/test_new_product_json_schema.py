import pytest
from datetime import date, timedelta
from src.models.order import NewOrderJsonSchema, ProductSchema


class TestProductSchema:
    """✅ Pruebas unitarias para el esquema de productos dentro de la orden"""

    def build_valid_product(self, **overrides):
        product = {
            "id": "P-1001",
            "name": "Mouse óptico",
            "amount": 2,
            "id_warehouse": "W-001"
        }
        product.update(overrides)
        return product

    def test_id_required(self):
        product = self.build_valid_product(id=None)
        schema = ProductSchema()
        errors = schema.validate(product)
        assert "id" in errors

    def test_name_required(self):
        product = self.build_valid_product(name=None)
        schema = ProductSchema()
        errors = schema.validate(product)
        assert "name" in errors

    def test_amount_required(self):
        product = self.build_valid_product(amount=None)
        schema = ProductSchema()
        errors = schema.validate(product)
        assert "amount" in errors

    def test_amount_must_be_positive(self):
        product = self.build_valid_product(amount=0)
        schema = ProductSchema()
        errors = schema.validate(product)
        assert "amount" in errors
        assert "mayor o igual a 1" in str(errors["amount"])


class TestNewOrderJsonSchema:
    """✅ Pruebas unitarias para el esquema de creación de órdenes"""

    def build_valid_payload(self, **overrides):
        payload = {
            "priority": "HIGH",
            "products": [
                {"id": "P-1001", "name": "Mouse óptico", "amount": 2, "id_warehouse": "W-001"},
                {"id": "P-2002", "name": "Teclado", "amount": 1, "id_warehouse": "W-002"}
            ],
            "country": "Colombia",
            "city": "Bogotá",
            "address": "Calle 100 #10-20",
            "date_estimated": (date.today() + timedelta(days=3)).isoformat(),
            "id_client": "CLIENT-123",
            "id_vendor": "VENDOR-456"
        }
        payload.update(overrides)
        return payload

    def test_priority_required(self):
        payload = self.build_valid_payload(priority=None)
        schema = NewOrderJsonSchema()
        errors = schema.validate(payload)
        assert "priority" in errors

    def test_priority_invalid_value(self):
        payload = self.build_valid_payload(priority="INVALID")
        schema = NewOrderJsonSchema()
        errors = schema.validate(payload)
        assert "priority" in errors
        assert "no es válido" in str(errors["priority"])

    def test_products_required(self):
        payload = self.build_valid_payload(products=None)
        schema = NewOrderJsonSchema()
        errors = schema.validate(payload)
        assert "products" in errors

    def test_products_empty(self):
        payload = self.build_valid_payload(products=[])
        schema = NewOrderJsonSchema()
        errors = schema.validate(payload)
        assert "products" in errors
        assert "no puede estar vacía" in str(errors["products"])

    def test_country_required(self):
        payload = self.build_valid_payload(country=None)
        schema = NewOrderJsonSchema()
        errors = schema.validate(payload)
        assert "country" in errors

    def test_city_required(self):
        payload = self.build_valid_payload(city=None)
        schema = NewOrderJsonSchema()
        errors = schema.validate(payload)
        assert "city" in errors

    def test_address_required(self):
        payload = self.build_valid_payload(address=None)
        schema = NewOrderJsonSchema()
        errors = schema.validate(payload)
        assert "address" in errors

    def test_date_estimated_required(self):
        payload = self.build_valid_payload(date_estimated=None)
        schema = NewOrderJsonSchema()
        errors = schema.validate(payload)
        assert "date_estimated" in errors

    def test_id_client_required(self):
        payload = self.build_valid_payload(id_client=None)
        schema = NewOrderJsonSchema()
        errors = schema.validate(payload)
        assert "id_client" in errors

    def test_id_vendor_required(self):
        payload = self.build_valid_payload(id_vendor=None)
        schema = NewOrderJsonSchema()
        errors = schema.validate(payload)
        assert "id_vendor" in errors

    def test_valid_payload_passes(self):
        payload = self.build_valid_payload()
        schema = NewOrderJsonSchema()
        errors = schema.validate(payload)
        assert errors == {}
