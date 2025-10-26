from .base_command import BaseCommannd
from ..errors.errors import ApiError
from ..models.product import ProductModel


class GetAllProducts(BaseCommannd):
    """Comando para obtener todos los productos registrados."""

    def __init__(self):
        # No necesitamos conexión directa ya que usamos PynamoDB
        pass

    def execute(self):
        """Ejecuta la consulta para obtener todos los productos."""
        return self.fetch_all()

    def fetch_all(self):
        """Obtiene todos los productos usando el modelo ProductModel."""
        try:
            # Usar el modelo ProductModel para obtener todos los productos
            products = []
            for product in ProductModel.scan():
                products.append(product.to_dict())

            # 🧾 Ordenar por nombre
            products.sort(key=lambda p: p.get("name", "").lower())

            return products

        except Exception as e:
            raise ApiError(f"Error al obtener la lista de productos: {str(e)}")
