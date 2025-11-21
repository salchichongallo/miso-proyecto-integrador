import pytest
import logging
from unittest.mock import patch
from src.errors.errors import ApiError


@pytest.mark.usefixtures("client")
class TestGetAllProvidersIntegration:
    """🧪 Tests de integración para GET /"""

    # ============================================================
    # ✅ Caso exitoso: primero se crean proveedores y luego se listan
    # ============================================================
    @patch("src.models.provider.ProviderModel.get_all")
    @patch("src.models.provider.ProviderModel.create")
    def test_get_all_providers_success(self, mock_create, mock_get_all, client):
        """Debe retornar la lista de proveedores (200)"""

        # 1️⃣ Preparamos objetos mock de proveedores
        created_providers = [
            {
                "nit": "1111111111",
                "name": "Proveedor Uno",
                "country": "CO",
                "address": "Calle 11",
                "email": "uno@proveedor.com",
                "phone": "3001111111",
                "provider_id": "prov-uno",
            },
            {
                "nit": "2222222222",
                "name": "Proveedor Dos",
                "country": "MX",
                "address": "Calle 22",
                "email": "dos@proveedor.com",
                "phone": "3002222222",
                "provider_id": "prov-dos",
            },
        ]

        # 2️⃣ Mock: la creación devuelve obj con .to_dict()
        mock_create.side_effect = [
            type("Obj", (), {"to_dict": lambda self: created_providers[0]})(),
            type("Obj", (), {"to_dict": lambda self: created_providers[1]})(),
        ]

        # 3️⃣ Mock del GET
        mock_get_all.return_value = created_providers

        # 4️⃣ Creamos proveedores vía POST
        client.post("/", json=created_providers[0])
        client.post("/", json=created_providers[1])

        # 5️⃣ Ahora consultamos GET /
        response = client.get("/")
        json_data = response.get_json()

        # 6️⃣ Validaciones
        assert response.status_code == 200
        assert isinstance(json_data, list)
        assert len(json_data) == 2
        assert json_data[0]["name"] == "Proveedor Uno"

        mock_get_all.assert_called_once()

    # ============================================================
    # ❌ ApiError en la ejecución
    # ============================================================
    @patch("src.commands.view_all.GetAllProviders.execute", side_effect=ApiError("Fallo en DynamoDB"))
    def test_get_all_providers_api_error(self, mock_execute, client):
        response = client.get("/")
        json_data = response.get_json()

        assert response.status_code == 500
        assert "Fallo en DynamoDB" in json_data["error"]

    # ============================================================
    # ❌ Error inesperado
    # ============================================================
    @patch("src.commands.view_all.GetAllProviders.execute", side_effect=Exception("Explosión interna"))
    def test_get_all_providers_unexpected_exception(self, mock_execute, client):
        response = client.get("/")
        json_data = response.get_json()

        assert response.status_code == 500
        assert "Explosión interna" in json_data["error"]
