import pytest
from unittest.mock import patch, MagicMock
from botocore.exceptions import ClientError


class TestProviderEndpoints:

    # ✅ Caso exitoso
    @pytest.mark.usefixtures("client")
    @patch("src.blueprints.provider.NewProviderJsonSchema.check")
    @patch("src.blueprints.provider.CreateProvider.execute")
    def test_create_provider_exitoso(self, mock_execute, mock_schema, client):
        """✅ Caso exitoso de creación"""
        mock_schema.return_value = True
        mock_execute.return_value = {
            "provider_id": "uuid-123",
            "name": "Proveedor A",
            "country": "CO",
            "nit": "1234567890",
            "address": "Calle 123",
            "email": "proveedor@correo.com",
            "phone": "3001234567",
            "message": "Proveedor registrado exitosamente"
        }

        payload = {
            "name": "Proveedor A",
            "country": "CO",
            "nit": "1234567890",
            "address": "Calle 123",
            "email": "proveedor@correo.com",
            "phone": "3001234567"
        }

        response = client.post("/", json=payload)
        data = response.get_json()

        assert response.status_code == 201
        assert data["message"] == "Proveedor creado exitosamente"
        assert data["provider"]["name"] == "Proveedor A"
        mock_execute.assert_called_once()

    # 🚫 Falla de validación del schema
    @pytest.mark.usefixtures("client")
    @patch("src.blueprints.provider.NewProviderJsonSchema.check", side_effect=Exception("Falta campo obligatorio"))
    def test_create_provider_schema_invalido(self, mock_schema, client):
        """❌ Falla al validar el schema JSON"""
        response = client.post("/", json={"name": "Proveedor"})
        data = response.get_json()
        assert response.status_code == 500
        assert "Falta campo obligatorio" in str(data)

    # 🚫 Campos faltantes
    @pytest.mark.usefixtures("client")
    @patch("src.blueprints.provider.NewProviderJsonSchema.check", return_value=True)
    @patch("src.blueprints.provider.CreateProvider.validate", side_effect=Exception("Todos los campos son obligatorios"))
    def test_create_provider_campos_faltantes(self, mock_validate, mock_schema, client):
        """❌ Campos obligatorios faltantes"""
        response = client.post("/", json={"name": "Proveedor"})
        data = response.get_json()
        assert response.status_code in (400, 500)
        assert "obligatorios" in str(data)

    # 🚫 NIT inválido
    @pytest.mark.usefixtures("client")
    @patch("src.blueprints.provider.NewProviderJsonSchema.check", return_value=True)
    @patch("src.blueprints.provider.CreateProvider.validate", side_effect=Exception("El NIT debe contener exactamente 10 dígitos"))
    def test_create_provider_nit_invalido(self, mock_validate, mock_schema, client):
        """❌ NIT inválido"""
        payload = {
            "name": "Proveedor X",
            "country": "CO",
            "nit": "123",
            "address": "Calle 10",
            "email": "a@b.com",
            "phone": "3001234567"
        }
        response = client.post("/", json=payload)
        data = response.get_json()
        assert response.status_code in (400, 500)
        assert "NIT" in str(data)

    # 🚫 Email inválido
    @pytest.mark.usefixtures("client")
    @patch("src.blueprints.provider.NewProviderJsonSchema.check", return_value=True)
    @patch("src.blueprints.provider.CreateProvider.validate", side_effect=Exception("El formato del email es inválido"))
    def test_create_provider_email_invalido(self, mock_validate, mock_schema, client):
        """❌ Email inválido"""
        payload = {
            "name": "Proveedor X",
            "country": "CO",
            "nit": "1234567890",
            "address": "Calle 10",
            "email": "correo_invalido",
            "phone": "3001234567"
        }
        response = client.post("/", json=payload)
        data = response.get_json()
        assert response.status_code in (400, 500)
        assert "email" in str(data).lower()

    # 🚫 Teléfono inválido
    @pytest.mark.usefixtures("client")
    @patch("src.blueprints.provider.NewProviderJsonSchema.check", return_value=True)
    @patch("src.blueprints.provider.CreateProvider.validate", side_effect=Exception("El teléfono debe contener exactamente 10 dígitos numéricos"))
    def test_create_provider_telefono_invalido(self, mock_validate, mock_schema, client):
        """❌ Teléfono inválido"""
        payload = {
            "name": "Proveedor X",
            "country": "CO",
            "nit": "1234567890",
            "address": "Calle 10",
            "email": "a@b.com",
            "phone": "123"
        }
        response = client.post("/", json=payload)
        data = response.get_json()
        assert response.status_code in (400, 500)
        assert "teléfono" in str(data).lower()

    # ⚠️ Duplicado existente
    @pytest.mark.usefixtures("client")
    @patch("src.blueprints.provider.NewProviderJsonSchema.check", return_value=True)
    @patch("src.blueprints.provider.CreateProvider.validate", side_effect=Exception("El proveedor con este NIT ya está registrado."))
    def test_create_provider_duplicado(self, mock_validate, mock_schema, client):
        """❌ Duplicado: proveedor existente"""
        payload = {
            "name": "Proveedor Y",
            "country": "CO",
            "nit": "1234567890",
            "address": "Calle 100",
            "email": "a@b.com",
            "phone": "3001234567"
        }
        response = client.post("/", json=payload)
        data = response.get_json()
        assert response.status_code in (400, 409, 500)
        assert "ya está registrado" in str(data)

    # ⚡ Error en DynamoDB
    @pytest.mark.usefixtures("client")
    @patch("src.blueprints.provider.NewProviderJsonSchema.check", return_value=True)
    @patch("src.blueprints.provider.CreateProvider.save", side_effect=Exception("Error al registrar proveedor: DynamoDB no disponible"))
    def test_create_provider_error_dynamodb(self, mock_save, mock_schema, client):
        """❌ Error al guardar en DynamoDB"""
        payload = {
            "name": "Proveedor Y",
            "country": "CO",
            "nit": "1234567890",
            "address": "Calle 100",
            "email": "a@b.com",
            "phone": "3001234567"
        }
        response = client.post("/", json=payload)
        data = response.get_json()
        assert response.status_code in (400, 500)
        assert "DynamoDB" in str(data)

    # ⚡ Error inesperado
    @pytest.mark.usefixtures("client")
    @patch("src.blueprints.provider.NewProviderJsonSchema.check", return_value=True)
    @patch("src.blueprints.provider.CreateProvider.execute", side_effect=Exception("Error inesperado general"))
    def test_create_provider_error_inesperado(self, mock_execute, mock_schema, client):
        """❌ Error inesperado general"""
        payload = {
            "name": "Proveedor Z",
            "country": "CO",
            "nit": "1234567890",
            "address": "Calle 200",
            "email": "z@b.com",
            "phone": "3001234567"
        }
        response = client.post("/", json=payload)
        data = response.get_json()
        assert response.status_code == 500
        assert "Error inesperado" in str(data)
