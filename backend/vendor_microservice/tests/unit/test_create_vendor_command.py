import pytest
from unittest.mock import MagicMock, patch
from botocore.exceptions import ClientError
from src.commands.create_vendor import CreateVendor
from src.errors.errors import ParamError, ApiError


class TestCreateVendorCommand:

    # ✅ Caso exitoso de creación
    @patch("boto3.resource")
    def test_execute_crea_vendor_exitosamente(self, mock_dynamodb):
        """✅ Vendor creado correctamente"""
        mock_table = MagicMock()
        mock_dynamodb.return_value.Table.return_value = mock_table
        mock_table.get_item.return_value = {}  # no existe
        mock_table.put_item.return_value = {"ResponseMetadata": {"HTTPStatusCode": 200}}

        vendor = CreateVendor(
            name="Jhorman Galindo",
            email="jhorman@example.com",
            institutions=["Clinica Norte", "Hospital Central"]
        )

        result = vendor.execute()

        assert "vendor_id" in result
        assert result["name"] == "Jhorman Galindo"
        assert result["email"] == "jhorman@example.com"
        assert result["institutions"] == ["Clinica Norte", "Hospital Central"]
        mock_table.put_item.assert_called_once()

    # 🚫 Falta nombre o email
    def test_validate_campos_obligatorios_faltantes(self):
        """❌ No debe permitir name o email vacíos"""
        vendor = CreateVendor(name="", email="", institutions=[])
        with pytest.raises(ParamError, match="obligatorios"):
            vendor.validate()

    # 🚫 Demasiadas instituciones
    def test_validate_demasiadas_instituciones(self):
        """❌ No debe permitir más de 30 instituciones"""
        institutions = [f"Inst_{i}" for i in range(31)]
        vendor = CreateVendor("Jhorman", "jhorman@example.com", institutions)
        with pytest.raises(ParamError, match="30 instituciones"):
            vendor.validate()

    # 🚫 Correo ya existente
    @patch("boto3.resource")
    def test_validate_vendor_duplicado(self, mock_dynamodb):
        """❌ Email duplicado en DynamoDB"""
        mock_table = MagicMock()
        mock_dynamodb.return_value.Table.return_value = mock_table
        mock_table.get_item.return_value = {"Item": {"email": "jhorman@example.com"}}

        vendor = CreateVendor("Jhorman", "jhorman@example.com", ["Clinica X"])

        with pytest.raises(ParamError, match="ya está registrado"):
            vendor.validate()

    # ⚡ Error al verificar duplicado (ClientError)
    @patch("boto3.resource")
    def test_validate_error_verificar_duplicado(self, mock_dynamodb):
        """❌ Falla AWS en get_item debe lanzar ApiError"""
        mock_table = MagicMock()
        mock_dynamodb.return_value.Table.return_value = mock_table
        mock_table.get_item.side_effect = ClientError(
            {"Error": {"Message": "AccessDenied"}}, "GetItem"
        )

        vendor = CreateVendor("Jhorman", "jhorman@example.com", ["Clinica Y"])

        with pytest.raises(ApiError, match="Error al verificar duplicado"):
            vendor.validate()

    # 💾 Error al guardar en DynamoDB
    @patch("boto3.resource")
    def test_save_error_dynamodb(self, mock_dynamodb):
        """❌ Falla en put_item debe lanzar ApiError"""
        mock_table = MagicMock()
        mock_dynamodb.return_value.Table.return_value = mock_table
        mock_table.put_item.side_effect = ClientError(
            {"Error": {"Message": "Network error"}}, "PutItem"
        )

        vendor = CreateVendor("Jhorman", "jhorman@example.com", ["Inst1"])
        vendor.vendor_id = "abc-123"

        with pytest.raises(ApiError, match="Error al registrar vendedor"):
            vendor.save()
