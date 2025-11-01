import pytest
from backend.order_microservice.src.models.order import ProductModel
from ..conftest import ProductBuilder


@pytest.mark.usefixtures('db_clearer')
class TestFindExistingProduct:
    def test_should_find_product_by_its_id(self, product_builder: ProductBuilder):
        new_product = product_builder.build()
        new_product.save()
        warehouse = new_product.warehouse
        sku = new_product.sku

        product = ProductModel.find_existing_product(warehouse, sku)

        assert product

    def test_should_return_none_if_product_does_not_exist(self):
        warehouse = "NonExistentWarehouse"
        sku = "NonExistentSKU"
        product = ProductModel.find_existing_product(warehouse, sku)
        assert product is None

    def test_should_return_none_if_only_warehouse_matches(self, product_builder: ProductBuilder):
        new_product = product_builder.build()
        new_product.save()
        warehouse = new_product.warehouse
        sku = "DifferentSKU"

        product = ProductModel.find_existing_product(warehouse, sku)

        assert product is None

    def test_should_return_none_if_only_sku_matches(self, product_builder: ProductBuilder):
        new_product = product_builder.build()
        new_product.save()
        warehouse = "DifferentWarehouse"
        sku = new_product.sku

        product = ProductModel.find_existing_product(warehouse, sku)

        assert product is None


@pytest.mark.usefixtures('db_clearer')
class TestUpdateStock:
    def test_should_update_stock_correctly(self, product_builder: ProductBuilder):
        initial_stock = 100
        additional_stock = 50
        expected_stock = initial_stock + additional_stock

        product = product_builder.with_stock(initial_stock).build()
        product.save()

        product.update_stock(additional_stock)

        updated_product = ProductModel.get(hash_key=product.warehouse, range_key=product.sku)
        assert updated_product.stock == expected_stock


@pytest.mark.usefixtures('db_clearer')
class TestToDict:
    def test_should_convert_product_to_dict(self, product_builder: ProductBuilder):
        product = product_builder.build()
        product.save()

        product_dict = product.to_dict()

        assert product_dict["sku"] == product.sku
        assert product_dict["provider_nit"] == product.provider_nit
        assert product_dict["name"] == product.name
        assert product_dict["product_type"] == product.product_type
        assert product_dict["stock"] == int(product.stock)
        assert product_dict["expiration_date"] == product.expiration_date
        assert product_dict["temperature_required"] == float(product.temperature_required)
        assert product_dict["batch"] == product.batch
        assert product_dict["status"] == product.status
        assert product_dict["unit_value"] == float(product.unit_value)
        assert product_dict["storage_conditions"] == product.storage_conditions
        assert product_dict["created_at"] is None
        assert product_dict["updated_at"] is None
