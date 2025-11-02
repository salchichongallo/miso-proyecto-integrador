import pytest
from uuid import uuid4
from unittest.mock import patch
from src.models.product import ProductModel
from src.models.warehouse import WarehouseModel
from src.models.product_mirror import ProductMirrorModel


# --- Fixture de cliente Flask ---
@pytest.fixture
def client():
    # --- 💡 APLICAR MOCKS DE COGNITO ANTES DE IMPORTAR APP ---
    with patch("flask_cognito.cognito_auth_required", lambda f: f), \
        patch("flask_cognito.cognito_group_permissions", lambda x: (lambda f: f)), \
        patch("flask_cognito.current_cognito_jwt", {
            "username": "test-user",
            "email": "test@example.com",
            "cognito:groups": ["admins", "vendors"]
        }):
        from src.main import app
        with app.test_client() as client:
            app.testing = True
            clear_db()
            yield client
            clear_db()


@pytest.fixture()
def db_clearer():
    clear_db()
    yield
    clear_db()


def clear_db():
    models = [ProductModel, WarehouseModel, ProductMirrorModel]
    for model in models:
        with model.batch_write() as batch:
            for item in model.scan():
                batch.delete(item)


@pytest.fixture
def product_builder():
    return ProductBuilder()


class ProductBuilder:
    def __init__(self):
        self._warehouse = str(uuid4())
        self._sku = str(uuid4())
        self._provider_nit = "1234567890"
        self._name = "Producto de prueba"
        self._product_type = "Tipo1"
        self._stock = 100
        self._expiration_date = "2024-12-31"
        self._temperature_required = 4.0
        self._batch = "Lote1"
        self._status = "Disponible"
        self._unit_value = 50.0
        self._storage_conditions = "Refrigerado"

    def _copy_with(self, **kwargs):
        new_builder = ProductBuilder()
        new_builder._warehouse = kwargs.get('warehouse', self._warehouse)
        new_builder._sku = kwargs.get('sku', self._sku)
        new_builder._provider_nit = kwargs.get('provider_nit', self._provider_nit)
        new_builder._name = kwargs.get('name', self._name)
        new_builder._product_type = kwargs.get('product_type', self._product_type)
        new_builder._stock = kwargs.get('stock', self._stock)
        new_builder._expiration_date = kwargs.get('expiration_date', self._expiration_date)
        new_builder._temperature_required = kwargs.get('temperature_required', self._temperature_required)
        new_builder._batch = kwargs.get('batch', self._batch)
        new_builder._status = kwargs.get('status', self._status)
        new_builder._unit_value = kwargs.get('unit_value', self._unit_value)
        new_builder._storage_conditions = kwargs.get('storage_conditions', self._storage_conditions)
        return new_builder

    def with_warehouse(self, warehouse):
        return self._copy_with(warehouse=warehouse)

    def with_sku(self, sku):
        return self._copy_with(sku=sku)

    def with_provider_nit(self, provider_nit):
        return self._copy_with(provider_nit=provider_nit)

    def with_name(self, name):
        return self._copy_with(name=name)

    def with_product_type(self, product_type):
        return self._copy_with(product_type=product_type)

    def with_stock(self, stock):
        return self._copy_with(stock=stock)

    def with_expiration_date(self, expiration_date):
        return self._copy_with(expiration_date=expiration_date)

    def with_temperature_required(self, temperature_required):
        return self._copy_with(temperature_required=temperature_required)

    def with_batch(self, batch):
        return self._copy_with(batch=batch)

    def with_status(self, status):
        return self._copy_with(status=status)

    def with_unit_value(self, unit_value):
        return self._copy_with(unit_value=unit_value)

    def with_storage_conditions(self, storage_conditions):
        return self._copy_with(storage_conditions=storage_conditions)

    def build(self):
        return ProductModel(
            warehouse=self._warehouse,
            sku=self._sku,
            provider_nit=self._provider_nit,
            name=self._name,
            product_type=self._product_type,
            stock=self._stock,
            expiration_date=self._expiration_date,
            temperature_required=self._temperature_required,
            batch=self._batch,
            status=self._status,
            unit_value=self._unit_value,
            storage_conditions=self._storage_conditions,
        )
