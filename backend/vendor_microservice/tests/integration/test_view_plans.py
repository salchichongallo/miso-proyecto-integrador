import pytest
import logging
from unittest.mock import patch
from src.errors.errors import ApiError


@pytest.mark.usefixtures("client")
class TestSalesPlanEndToEndIntegration:
    """🧪 Test de integración end-to-end para crear y listar planes de venta"""

    def test_create_then_get_sales_plans(self, client):
        """✅ Debe crear un plan y luego listar al menos uno"""

        # ---------- Paso 1: Crear un plan ----------
        create_payload = {
            "vendor_id": "v123",
            "period": "2025-Q1",
            "region": "Norte",
            "products": [
                {
                    "product_id": "p1",
                    "name": "Producto 1",
                    "target_units": 10,
                    "target_value": 5000.0
                }
            ]
        }

        headers = {"Authorization": "Bearer fake_token"}

        create_response = client.post("/sales_plan/", json=create_payload, headers=headers)
        create_json = create_response.get_json()

        logging.info("Create response: %s", create_json)

        assert create_response.status_code == 201
        assert "plan" in create_json
        created_plan_id = create_json["plan"]["plan_id"]

        # ---------- Paso 2: Obtener todos los planes ----------
        get_response = client.get("/sales_plan/", headers=headers)
        get_json = get_response.get_json()

        logging.info("Get response: %s", get_json)

        assert get_response.status_code == 200
        assert isinstance(get_json, list)

        # ✅ Verificar que el plan recién creado aparece en la lista
        plan_ids = [plan.get("plan_id") for plan in get_json]
        assert created_plan_id in plan_ids

    # 🚫 Caso: ApiError en ejecución
    @patch("src.commands.view_all_sales_plans.GetAllSalesPlans.execute")
    def test_should_return_500_on_api_error(self, mock_execute, client):
        """❌ Debe devolver 500 si ocurre un ApiError"""
        mock_execute.side_effect = ApiError("Error al obtener planes desde DynamoDB")

        headers = {"Authorization": "Bearer fake_token"}
        response = client.get("/sales_plan/", headers=headers)
        json_data = response.get_json()

        logging.info("Response JSON (ApiError 500): %s", json_data)

        # ✅ Verificaciones
        assert response.status_code == 500
        assert "error" in json_data
        assert "DynamoDB" in json_data["error"]

    # 🚫 Caso: excepción inesperada
    @patch("src.commands.view_all_sales_plans.GetAllSalesPlans.execute")
    def test_should_return_500_on_unexpected_exception(self, mock_execute, client):
        """❌ Debe devolver 500 si ocurre una excepción inesperada"""
        mock_execute.side_effect = Exception("Error inesperado al listar planes")

        headers = {"Authorization": "Bearer fake_token"}
        response = client.get("/sales_plan/", headers=headers)
        json_data = response.get_json()

        logging.info("Response JSON (Unexpected 500): %s", json_data)

        # ✅ Verificaciones
        assert response.status_code == 500
        assert "error" in json_data
        assert "Error inesperado" in json_data["error"]
