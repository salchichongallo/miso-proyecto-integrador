from functools import reduce
from ..models.product_mirror import ProductMirrorModel


class SearchProductsQuery:
    def __init__(
        self,
        product_name: str = None,
        batch: str = None,
        status: str = None,
        warehouse_name: str = None,
    ):
        self.product_name = product_name
        self.batch = batch
        self.status = status
        self.warehouse_name = warehouse_name

    def execute(self):
        """Ejecuta la consulta de productos con los filtros dados."""
        filter_conditions = []

        if self.product_name:
            filter_conditions.append(
                ProductMirrorModel.name.contains(self.product_name)
            )
        if self.batch:
            filter_conditions.append(ProductMirrorModel.batch == self.batch)
        if self.status:
            filter_conditions.append(ProductMirrorModel.status == self.status)
        if self.warehouse_name:
            filter_conditions.append(
                ProductMirrorModel.warehouse_name.contains(self.warehouse_name)
            )

        if filter_conditions:
            combined_filter = reduce(lambda x, y: x & y, filter_conditions)
            products = ProductMirrorModel.scan(filter_condition=combined_filter)
        else:
            products = ProductMirrorModel.scan()

        sorted_products = [product.to_dict() for product in products]
        sorted_products.sort(key=lambda p: p.get("name", "").lower())

        return sorted_products
