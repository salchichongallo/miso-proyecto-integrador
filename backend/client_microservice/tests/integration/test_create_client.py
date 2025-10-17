import pytest
from unittest.mock import patch, MagicMock
from botocore.exceptions import ClientError

class TestClientEndpoints:

    @pytest.mark.usefixtures("client")
    @patch("src.blueprints.client.NewClientJsonSchema.check")
    @patch("src.blueprints.client.CreateClient.execute")
    def test_create_client_endpoint(self, mock_execute, mock_schema, client):
        """✅ Caso exitoso de creación"""
        mock_schema.return_value = True
        mock_execute.return_value = {
            "client_id": "1234",
            "name": "Hospital Central",
            "country": "CO",
            "level": "1",
            "specialty": "Cardiología",
            "location": "Bogotá",
            "message": "Cliente institucional registrado exitosamente"
        }

        payload = {
            "name": "Hospital Central",
            "tax_id": "123456789",
            "country": "CO",
            "level": "1",
            "specialty": "Cardiología",
            "location": "Bogotá"
        }

        response = client.post("/create", json=payload)
        assert response.status_code == 201
        data = response.get_json()
        assert "Client created successfully" in data["mssg"]
        assert data["vendor"]["name"] == "Hospital Central"
        mock_execute.assert_called_once()

    # ----------------- 🚫 Casos negativos -----------------

    @pytest.mark.usefixtures("client")
    @patch("src.blueprints.client.NewClientJsonSchema.check", side_effect=Exception("Falta campo obligatorio"))
    def test_create_client_schema_falla(self, mock_schema, client):
        """❌ Falla de validación en el schema JSON"""
        payload = {"name": "Clinica X"}  # faltan campos
        response = client.post("/create", json=payload)
        assert response.status_code == 500  # o 400 si lo manejás así
        data = response.get_json()
        assert "Falta campo obligatorio" in str(data)

    @pytest.mark.usefixtures("client")
    @patch("src.blueprints.client.NewClientJsonSchema.check", return_value=True)
    @patch("src.blueprints.client.CreateClient.validate")
    def test_create_client_campos_faltantes(self, mock_validate, mock_schema, client):
        """❌ Error de validación: campos faltantes"""
        mock_validate.side_effect = Exception("Todos los campos son obligatorios para registrar un cliente institucional.")
        payload = {"name": "Hospital"}  # incompleto
        response = client.post("/create", json=payload)
        assert response.status_code in (400, 500)
        data = response.get_json()
        assert "obligatorios" in str(data)

    @pytest.mark.usefixtures("client")
    @patch("src.blueprints.client.NewClientJsonSchema.check", return_value=True)
    @patch("src.blueprints.client.CreateClient.validate")
    def test_create_client_tax_id_invalido_colombia(self, mock_validate, mock_schema, client):
        """❌ NIT inválido (Colombia)"""
        mock_validate.side_effect = Exception("NIT inválido: debe tener entre 9 y 10 dígitos.")
        payload = {
            "name": "Hospital",
            "tax_id": "123",
            "country": "CO",
            "level": "1",
            "specialty": "Pediatría",
            "location": "Bogotá"
        }
        response = client.post("/create", json=payload)
        assert response.status_code in (400, 500)
        assert "NIT inválido" in str(response.get_json())

    @pytest.mark.usefixtures("client")
    @patch("src.blueprints.client.NewClientJsonSchema.check", return_value=True)
    @patch("src.blueprints.client.CreateClient.validate")
    def test_create_client_rfc_invalido_mexico(self, mock_validate, mock_schema, client):
        """❌ RFC inválido (México)"""
        mock_validate.side_effect = Exception("RFC inválido: formato incorrecto.")
        payload = {
            "name": "Clinica Norte",
            "tax_id": "1234",
            "country": "MX",
            "level": "2",
            "specialty": "Oncología",
            "location": "CDMX"
        }
        response = client.post("/create", json=payload)
        assert response.status_code in (400, 500)
        assert "RFC inválido" in str(response.get_json())

    @pytest.mark.usefixtures("client")
    @patch("src.blueprints.client.NewClientJsonSchema.check", return_value=True)
    @patch("src.blueprints.client.CreateClient.validate")
    def test_create_client_tax_id_corto_otro_pais(self, mock_validate, mock_schema, client):
        """❌ tax_id corto en otro país"""
        mock_validate.side_effect = Exception("Identificador tributario inválido.")
        payload = {
            "name": "Clinica Sur",
            "tax_id": "123",
            "country": "US",
            "level": "2",
            "specialty": "Dermatología",
            "location": "Miami"
        }
        response = client.post("/create", json=payload)
        assert response.status_code in (400, 500)
        assert "tributario inválido" in str(response.get_json())

    @pytest.mark.usefixtures("client")
    @patch("src.blueprints.client.NewClientJsonSchema.check", return_value=True)
    @patch("src.blueprints.client.CreateClient.validate")
    def test_create_client_duplicado(self, mock_validate, mock_schema, client):
        """❌ Cliente duplicado"""
        mock_validate.side_effect = Exception("El cliente institucional ya está registrado.")
        payload = {
            "name": "Hospital Central",
            "tax_id": "123456789",
            "country": "CO",
            "level": "1",
            "specialty": "Cardiología",
            "location": "Bogotá"
        }
        response = client.post("/create", json=payload)
        assert response.status_code in (400, 500)
        assert "ya está registrado" in str(response.get_json())

    @pytest.mark.usefixtures("client")
    @patch("src.blueprints.client.NewClientJsonSchema.check", return_value=True)
    @patch("src.blueprints.client.CreateClient.save")
    def test_create_client_error_dynamodb(self, mock_save, mock_schema, client):
        """❌ Error al guardar en DynamoDB"""
        mock_save.side_effect = Exception("Error al registrar cliente: fallo en DynamoDB")
        payload = {
            "name": "Clinica Norte",
            "tax_id": "123456789",
            "country": "CO",
            "level": "1",
            "specialty": "Pediatría",
            "location": "Medellín"
        }
        response = client.post("/create", json=payload)
        assert response.status_code in (400, 500)
        assert "DynamoDB" in str(response.get_json())

    @pytest.mark.usefixtures("client")
    @patch("src.blueprints.client.NewClientJsonSchema.check", return_value=True)
    @patch("src.blueprints.client.CreateClient.validate")
    def test_create_client_error_verificar_duplicado(self, mock_validate, mock_schema, client):
        """❌ Error al verificar duplicado"""
        mock_validate.side_effect = Exception("Error al verificar duplicado: AccessDenied")
        payload = {
            "name": "Hospital Andes",
            "tax_id": "123456789",
            "country": "CO",
            "level": "1",
            "specialty": "Neurología",
            "location": "Bogotá"
        }
        response = client.post("/create", json=payload)
        assert response.status_code in (400, 500)
        assert "Error al verificar duplicado" in str(response.get_json())
