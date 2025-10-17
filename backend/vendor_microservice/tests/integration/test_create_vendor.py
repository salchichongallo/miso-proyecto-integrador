import pytest
from unittest.mock import patch


class TestVendorEndpoints:

    # ✅ Caso exitoso
    @pytest.mark.usefixtures("client")
    @patch("src.blueprints.vendor.NewVendorJsonSchema.check")
    @patch("src.blueprints.vendor.CreateVendor.execute")
    def test_create_vendor_endpoint(self, mock_execute, mock_schema, client):
        """✅ Caso exitoso de creación"""
        mock_schema.return_value = True
        mock_execute.return_value = {
            "vendor_id": "abcd-1234",
            "name": "Jhorman Galindo",
            "email": "jhorman@example.com",
            "institutions": ["Clinica Norte", "Hospital Central"]
        }

        payload = {
            "name": "Jhorman Galindo",
            "email": "jhorman@example.com",
            "institutions": ["Clinica Norte", "Hospital Central"]
        }

        response = client.post("/", json=payload)
        assert response.status_code == 201
        data = response.get_json()
        assert "Vendor created successfully" in data["mssg"]
        assert data["vendor"]["name"] == "Jhorman Galindo"
        mock_execute.assert_called_once()

    # ❌ Error en schema (falta campo)
    @pytest.mark.usefixtures("client")
    @patch("src.blueprints.vendor.NewVendorJsonSchema.check", side_effect=Exception("Falta campo obligatorio"))
    def test_create_vendor_schema_falla(self, mock_schema, client):
        """❌ Falla en validación del JSON schema"""
        payload = {"name": "Vendor X"}  # falta email e institutions
        response = client.post("/", json=payload)
        assert response.status_code in (400, 500)
        data = response.get_json()
        assert "Falta campo obligatorio" in str(data)

    # ❌ Error: campos obligatorios vacíos
    @pytest.mark.usefixtures("client")
    @patch("src.blueprints.vendor.NewVendorJsonSchema.check", return_value=True)
    @patch("src.blueprints.vendor.CreateVendor.validate")
    def test_create_vendor_campos_obligatorios(self, mock_validate, mock_schema, client):
        """❌ Falla cuando faltan campos obligatorios"""
        mock_validate.side_effect = Exception("El nombre y el correo son obligatorios.")
        payload = {"name": "", "email": "", "institutions": []}
        response = client.post("/", json=payload)
        assert response.status_code in (400, 500)
        data = response.get_json()
        assert "obligatorios" in str(data)

    # ❌ Error: demasiadas instituciones
    @pytest.mark.usefixtures("client")
    @patch("src.blueprints.vendor.NewVendorJsonSchema.check", return_value=True)
    @patch("src.blueprints.vendor.CreateVendor.validate")
    def test_create_vendor_instituciones_excedidas(self, mock_validate, mock_schema, client):
        """❌ Más de 30 instituciones"""
        mock_validate.side_effect = Exception("No se pueden asignar más de 30 instituciones por vendedor.")
        payload = {
            "name": "Vendedor Saturado",
            "email": "vendedor@example.com",
            "institutions": [f"Inst_{i}" for i in range(31)]
        }
        response = client.post("/", json=payload)
        assert response.status_code in (400, 500)
        data = response.get_json()
        assert "instituciones" in str(data)

    # ❌ Error: correo duplicado
    @pytest.mark.usefixtures("client")
    @patch("src.blueprints.vendor.NewVendorJsonSchema.check", return_value=True)
    @patch("src.blueprints.vendor.CreateVendor.validate")
    def test_create_vendor_duplicado(self, mock_validate, mock_schema, client):
        """❌ Correo duplicado"""
        mock_validate.side_effect = Exception("El correo electrónico ya está registrado.")
        payload = {
            "name": "Vendor Duplicado",
            "email": "duplicado@example.com",
            "institutions": ["Clinica Norte"]
        }
        response = client.post("/", json=payload)
        assert response.status_code in (400, 500)
        data = response.get_json()
        assert "ya está registrado" in str(data)

    # ❌ Error al guardar en DynamoDB
    @pytest.mark.usefixtures("client")
    @patch("src.blueprints.vendor.NewVendorJsonSchema.check", return_value=True)
    @patch("src.blueprints.vendor.CreateVendor.save")
    def test_create_vendor_error_dynamodb(self, mock_save, mock_schema, client):
        """❌ Error al registrar vendedor en DynamoDB"""
        mock_save.side_effect = Exception("Error al registrar vendedor: fallo en DynamoDB")
        payload = {
            "name": "Vendor Test",
            "email": "vendor@example.com",
            "institutions": ["Inst1", "Inst2"]
        }
        response = client.post("/", json=payload)
        assert response.status_code in (400, 500)
        data = response.get_json()
        assert "DynamoDB" in str(data)

    # ❌ Error al verificar duplicado
    @pytest.mark.usefixtures("client")
    @patch("src.blueprints.vendor.NewVendorJsonSchema.check", return_value=True)
    @patch("src.blueprints.vendor.CreateVendor.validate")
    def test_create_vendor_error_verificar_duplicado(self, mock_validate, mock_schema, client):
        """❌ Error al verificar duplicado (ClientError)"""
        mock_validate.side_effect = Exception("Error al verificar duplicado: AccessDenied")
        payload = {
            "name": "Vendor Error",
            "email": "error@example.com",
            "institutions": ["Clinica X"]
        }
        response = client.post("/", json=payload)
        assert response.status_code in (400, 500)
        data = response.get_json()
        assert "verificar duplicado" in str(data)
