import pytest
import logging
from unittest.mock import patch
from src.errors.errors import ApiError


@pytest.mark.usefixtures("client")
class TestGetAllVendorsIntegration:
    """🧪 Test de integración para listar todos los vendedores"""

    def test_get_all_vendors_success(self, client):
        """✅ Crea un vendedor y luego lo lista correctamente"""
        # 1️⃣ Crear un vendedor primero
        payload = {
            "name": "Jhorman Galindo",
            "email": "jhorman@example.com",
            "institutions": ["Clinica Norte", "Hospital Central"]
        }

        create_response = client.post("/", json=payload)
        create_data = create_response.get_json()

        logging.info("Create Response: %s", create_data)
        assert create_response.status_code == 201

        # 2️⃣ Obtener todos los vendedores
        response = client.get("/")
        json_data = response.get_json()

        logging.info("Response JSON (listado): %s", json_data)

        # ✅ Verificaciones
        assert response.status_code == 200
        assert isinstance(json_data, list)
        assert any(v["email"] == "jhorman@example.com" for v in json_data)

        # Verifica campos esperados
        first = next(v for v in json_data if v["email"] == "jhorman@example.com")
        assert "name" in first
        assert "email" in first
        assert "institutions" in first
        assert isinstance(first["institutions"], list)

    # 🚫 Caso: ApiError en el comando
    @patch("src.commands.view_all.GetAllVendors.execute")
    def test_get_all_vendors_api_error(self, mock_execute, client):
        """❌ Debe devolver 500 si ocurre un ApiError"""
        mock_execute.side_effect = ApiError("Error en DynamoDB al listar vendedores")

        response = client.get("/")
        json_data = response.get_json()

        logging.info("Response JSON (ApiError 500): %s", json_data)

        assert response.status_code == 500
        assert "error" in json_data
        assert "Error en DynamoDB" in json_data["error"]

    # 🚫 Caso: excepción inesperada
    @patch("src.commands.view_all.GetAllVendors.execute")
    def test_get_all_vendors_unexpected_exception(self, mock_execute, client):
        """❌ Debe devolver 500 si ocurre una excepción inesperada"""
        mock_execute.side_effect = Exception("Error inesperado en ejecución")

        response = client.get("/")
        json_data = response.get_json()

        logging.info("Response JSON (Exception 500): %s", json_data)

        assert response.status_code == 500
        assert "error" in json_data
        assert "Error inesperado" in json_data["error"]
