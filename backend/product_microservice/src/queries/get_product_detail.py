from ..models.product_mirror import ProductMirrorModel


class GetProductDetailQuery:
    def __init__(self, sku: str):
        self.sku = sku

    def execute(self):
        """Obtener los productos que coinciden con el SKU dado."""
        products = ProductMirrorModel.scan(ProductMirrorModel.sku == self.sku)

        sorted_products = [product.to_dict() for product in products]
        sorted_products.sort(key=lambda p: p.get("name", "").lower())

        return sorted_products
