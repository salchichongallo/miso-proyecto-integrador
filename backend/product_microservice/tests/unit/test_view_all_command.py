import pytest
from unittest.mock import MagicMock, patch
from src.commands.view_all import GetAllProducts
from src.errors.errors import ApiError


class TestGetAllProductsCommand:

    # ✅ Caso exitoso básico
    @patch("src.commands.view_all.ProductModel")
    def test_fetch_all_exitoso(self, mock_product_model):
        """✅ Retorna lista de productos exitosamente"""
        # Mock de productos
        mock_product1 = MagicMock()
        mock_product1.to_dict.return_value = {"name": "Paracetamol", "stock": 100}

        mock_product2 = MagicMock()
        mock_product2.to_dict.return_value = {"name": "Aspirina", "stock": 50}

        # Mock del scan que retorna los productos
        mock_product_model.scan.return_value = [mock_product1, mock_product2]

        command = GetAllProducts()
        result = command.fetch_all()

        assert isinstance(result, list)
        assert len(result) == 2
        assert result[0]["name"] == "Aspirina"  # Verifica orden alfabético
        assert result[1]["stock"] == 100

        # Verificar que se llamó scan() del modelo
        mock_product_model.scan.assert_called_once()

        # Verificar que se llamó to_dict() en cada producto
        mock_product1.to_dict.assert_called_once()
        mock_product2.to_dict.assert_called_once()

    # 🔁 Múltiples productos (PynamoDB maneja paginación automáticamente)
    @patch("src.commands.view_all.ProductModel")
    def test_fetch_all_multiples_productos(self, mock_product_model):
        """🔁 Retorna múltiples productos correctamente"""
        # Mock de múltiples productos
        mock_products = []
        for i in range(1, 6):  # 5 productos
            mock_product = MagicMock()
            mock_product.to_dict.return_value = {"name": f"Producto {i}", "stock": i * 10}
            mock_products.append(mock_product)

        mock_product_model.scan.return_value = mock_products

        command = GetAllProducts()
        result = command.fetch_all()

        assert isinstance(result, list)
        assert len(result) == 5

        # Verificar que se llamó scan() una vez (PynamoDB maneja paginación internamente)
        mock_product_model.scan.assert_called_once()

    # ⚠️ Sin productos
    @patch("src.commands.view_all.ProductModel")
    def test_fetch_all_sin_productos(self, mock_product_model):
        """⚠️ Retorna lista vacía cuando no hay productos"""
        mock_product_model.scan.return_value = []

        command = GetAllProducts()
        result = command.fetch_all()

        assert isinstance(result, list)
        assert result == []

    # ❌ Error en ProductModel
    @patch("src.commands.view_all.ProductModel")
    def test_fetch_all_error_modelo(self, mock_product_model):
        """❌ Lanza ApiError si ProductModel falla"""
        mock_product_model.scan.side_effect = Exception("AccessDenied")

        command = GetAllProducts()

        with pytest.raises(ApiError, match="Error al obtener la lista de productos"):
            command.fetch_all()

    # 🧱 Verifica que execute() llama a fetch_all()
    @patch("src.commands.view_all.ProductModel")
    def test_execute_invoca_fetch_all(self, mock_product_model):
        """🧱 execute() debe llamar internamente a fetch_all"""
        mock_product = MagicMock()
        mock_product.to_dict.return_value = {"name": "Ibuprofeno"}
        mock_product_model.scan.return_value = [mock_product]

        command = GetAllProducts()
        result = command.execute()

        assert isinstance(result, list)
        assert len(result) == 1
        assert result[0]["name"] == "Ibuprofeno"

    # 🧩 Verifica que se ordena correctamente alfabéticamente
    @patch("src.commands.view_all.ProductModel")
    def test_fetch_all_orden_alfabetico(self, mock_product_model):
        """🧩 Los productos deben ordenarse alfabéticamente por nombre"""
        # Mock de productos en orden desordenado
        mock_product1 = MagicMock()
        mock_product1.to_dict.return_value = {"name": "Carlos"}

        mock_product2 = MagicMock()
        mock_product2.to_dict.return_value = {"name": "Ana"}

        mock_product3 = MagicMock()
        mock_product3.to_dict.return_value = {"name": "Beatriz"}

        mock_product_model.scan.return_value = [mock_product1, mock_product2, mock_product3]

        command = GetAllProducts()
        result = command.fetch_all()

        nombres = [p["name"] for p in result]
        assert nombres == ["Ana", "Beatriz", "Carlos"]
