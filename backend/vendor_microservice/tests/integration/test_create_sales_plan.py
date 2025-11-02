import pytest
import logging
from unittest.mock import patch
from src.errors.errors import ApiError, ParamError


@pytest.mark.usefixtures("client")
class TestCreateSalesPlanIntegration:
    """🧪 Test de integración para la creación de planes de venta"""

    def test_successful_sales_plan_creation(self, client):
        """✅ Debe crear un plan de venta exitosamente y devolver 201"""
        payload = {
            "vendor_id": "v123",
            "period": "2025-Q1",
            "region": "Norte",
            "products": [
                {
                    "product_id": "p1",
                    "name": "Producto 1",
                    "target_units": 10,
                    "target_value": 5000.0
                },
                {
                    "product_id": "p2",
                    "name": "Producto 2",
                    "target_units": 20,
                    "target_value": 10000.0
                }
            ]
        }

        # 👇 Simula cabecera de autorización de Cognito
        headers = {
                "Authorization": "Bearer fake_token",
                "Content-Type": "application/json"
            }

        response = client.post("/sales_plan/", json=payload, headers=headers)
        json_data = response.get_json()

        logging.info("Response JSON: %s", json_data)

        # ✅ Verificaciones
        assert response.status_code == 201
        assert "message" in json_data
        assert "plan" in json_data
        assert json_data["plan"]["vendor_id"] == "v123"
        assert json_data["plan"]["period"] == "2025-Q1"
        assert isinstance(json_data["plan"]["products"], list)
        assert len(json_data["plan"]["products"]) == 2

    # def test_missing_required_field(self, client):
    #     """❌ Debe retornar 400 si falta un campo obligatorio"""
    #     payload = {
    #         # Falta el campo 'vendor_id'
    #         "period": "2025-Q1",
    #         "region": "Norte",
    #         "products": [
    #             {"product_id": "p1", "name": "Producto 1", "target_units": 10, "target_value": 5000.0}
    #         ]
    #     }

    #     headers = {"Authorization": "Bearer fake_token"}

    #     response = client.post("/sales_plan/", json=payload, headers=headers)
    #     json_data = response.get_json()

    #     logging.info("Response JSON (error 400): %s", json_data)

    #     # ✅ Verificaciones
    #     assert response.status_code == 400
    #     assert "error" in json_data
    #     assert "vendor_id" in json_data["error"] or "requerido" in json_data["error"]

    # # 🚫 Caso: ApiError durante la creación
    # @patch("src.commands.create_sales_plan.CreateSalesPlan.execute")
    # def test_create_sales_plan_api_error(self, mock_execute, client):
    #     """❌ Debe devolver 500 si ocurre un ApiError en el comando"""
    #     mock_execute.side_effect = ApiError("Error en DynamoDB al guardar el plan")

    #     payload = {
    #         "vendor_id": "v123",
    #         "period": "2025-Q1",
    #         "region": "Norte",
    #         "products": [
    #             {"product_id": "p1", "name": "Producto 1", "target_units": 10, "target_value": 5000.0}
    #         ]
    #     }

    #     headers = {"Authorization": "Bearer fake_token"}

    #     response = client.post("/sales_plan/", json=payload, headers=headers)
    #     json_data = response.get_json()

    #     logging.info("Response JSON (ApiError 500): %s", json_data)

    #     # ✅ Verificaciones
    #     assert response.status_code == 500
    #     assert "error" in json_data
    #     assert "Error en DynamoDB" in json_data["error"]

    # # 🚫 Caso: excepción inesperada
    # @patch("src.commands.create_sales_plan.CreateSalesPlan.execute")
    # def test_create_sales_plan_unexpected_exception(self, mock_execute, client):
    #     """❌ Debe devolver 500 si ocurre una excepción inesperada"""
    #     mock_execute.side_effect = Exception("Error inesperado en ejecución")

    #     payload = {
    #         "vendor_id": "v123",
    #         "period": "2025-Q1",
    #         "region": "Norte",
    #         "products": [
    #             {"product_id": "p1", "name": "Producto 1", "target_units": 10, "target_value": 5000.0}
    #         ]
    #     }

    #     headers = {"Authorization": "Bearer fake_token"}

    #     response = client.post("/sales_plan/", json=payload, headers=headers)
    #     json_data = response.get_json()

    #     logging.info("Response JSON (Exception 500): %s", json_data)

    #     # ✅ Verificaciones
    #     assert response.status_code == 500
    #     assert "error" in json_data
    #     assert "Error inesperado" in json_data["error"]
