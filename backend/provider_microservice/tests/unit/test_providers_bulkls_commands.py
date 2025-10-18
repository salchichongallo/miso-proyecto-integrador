import pytest
import pandas as pd
from unittest.mock import MagicMock, patch
from botocore.exceptions import ClientError
from src.commands.create_providers_bulk import CreateProvidersBulk
from src.errors.errors import ApiError


class TestCreateProvidersBulkCommand:

    # ✅ Caso exitoso con archivo CSV válido
    @patch("boto3.resource")
    def test_execute_carga_masiva_exitosa(self, mock_dynamodb):
        mock_table = MagicMock()
        mock_dynamodb.return_value.Table.return_value = mock_table
        mock_batch = MagicMock()
        mock_table.batch_writer.return_value.__enter__.return_value = mock_batch

        # Crear un DataFrame con registros válidos
        df = pd.DataFrame([
            {"name": "Proveedor A", "country": "CO", "nit": "1234567890",
             "address": "Calle 1", "email": "a@correo.com", "phone": "3001234567"},
            {"name": "Proveedor B", "country": "MX", "nit": "9876543210",
             "address": "Calle 2", "email": "b@correo.com", "phone": "3012345678"},
        ])

        # Simular lectura de archivo
        with patch.object(CreateProvidersBulk, "_read_file", return_value=df):
            cmd = CreateProvidersBulk(b"fake_bytes", "proveedores.csv")
            result = cmd.execute()

        assert result["registros_exitosos"] == 2
        assert result["registros_rechazados"] == 0
        assert "✅ Carga masiva exitosa" in result["mensaje"]

    # ⚙️ Test: archivo con formato incorrecto
    def test_read_file_formato_no_soportado(self):
        cmd = CreateProvidersBulk(b"contenido", "proveedores.txt")
        with pytest.raises(ApiError, match="Formato de archivo no soportado"):
            cmd._read_file()

    # ⚙️ Test: faltan columnas obligatorias
    def test_read_file_faltan_columnas(self):
        data = "nombre,correo\nProveedor1,a@b.com"
        cmd = CreateProvidersBulk(data.encode(), "archivo.csv")
        with patch("pandas.read_csv", return_value=pd.DataFrame({"nombre": ["A"], "correo": ["a@b.com"]})):
            with pytest.raises(ApiError, match="Faltan columnas obligatorias"):
                cmd._read_file()

    # 🚫 Test: registro con NIT inválido
    @patch("boto3.resource")
    def test_process_registro_nit_invalido(self, mock_dynamodb):
        mock_table = MagicMock()
        mock_dynamodb.return_value.Table.return_value = mock_table

        df = pd.DataFrame([{
            "name": "Proveedor A", "country": "CO", "nit": "123",
            "address": "Calle 1", "email": "a@correo.com", "phone": "3001234567"
        }])

        cmd = CreateProvidersBulk(b"", "proveedores.csv")
        cmd.table = mock_table
        result = cmd._process(df)
        assert result["registros_rechazados"] == 1
        assert "NIT inválido" in result["rechazados"][0]["error"]

    # 🚫 Test: registro con email inválido
    @patch("boto3.resource")
    def test_process_email_invalido(self, mock_dynamodb):
        mock_table = MagicMock()
        mock_dynamodb.return_value.Table.return_value = mock_table

        df = pd.DataFrame([{
            "name": "Proveedor", "country": "CO", "nit": "1234567890",
            "address": "Calle 1", "email": "correo_invalido", "phone": "3001234567"
        }])

        cmd = CreateProvidersBulk(b"", "proveedores.csv")
        cmd.table = mock_table
        result = cmd._process(df)
        assert result["registros_rechazados"] == 1
        assert "Email inválido" in result["rechazados"][0]["error"]

    # 🚫 Test: teléfono inválido
    @patch("boto3.resource")
    def test_process_telefono_invalido(self, mock_dynamodb):
        mock_table = MagicMock()
        mock_dynamodb.return_value.Table.return_value = mock_table

        df = pd.DataFrame([{
            "name": "Proveedor", "country": "CO", "nit": "1234567890",
            "address": "Calle 1", "email": "a@b.com", "phone": "12"
        }])

        cmd = CreateProvidersBulk(b"", "proveedores.csv")
        cmd.table = mock_table
        result = cmd._process(df)
        assert result["registros_rechazados"] == 1
        assert "Teléfono inválido" in result["rechazados"][0]["error"]

    # ⚠️ Test: duplicado existente en DynamoDB
    @patch("boto3.resource")
    def test_process_duplicado_existente(self, mock_dynamodb):
        mock_table = MagicMock()
        mock_dynamodb.return_value.Table.return_value = mock_table
        mock_table.get_item.return_value = {"Item": {"nit": "1234567890"}}

        df = pd.DataFrame([{
            "name": "Proveedor", "country": "CO", "nit": "1234567890",
            "address": "Calle 1", "email": "a@b.com", "phone": "3001234567"
        }])

        cmd = CreateProvidersBulk(b"", "proveedores.csv")
        cmd.table = mock_table
        result = cmd._process(df)
        assert result["registros_rechazados"] == 1
        assert "Duplicado" in result["rechazados"][0]["error"]

    # ⚡ Test: error al consultar DynamoDB
    @patch("boto3.resource")
    def test_process_error_dynamodb(self, mock_dynamodb):
        mock_table = MagicMock()
        mock_dynamodb.return_value.Table.return_value = mock_table
        mock_table.get_item.side_effect = ClientError(
            {"Error": {"Message": "Falla de red"}}, "GetItem"
        )

        df = pd.DataFrame([{
            "name": "Proveedor", "country": "CO", "nit": "1234567890",
            "address": "Calle 1", "email": "a@b.com", "phone": "3001234567"
        }])

        cmd = CreateProvidersBulk(b"", "proveedores.csv")
        cmd.table = mock_table
        result = cmd._process(df)
        assert result["registros_rechazados"] == 1
        assert "Error DynamoDB" in result["rechazados"][0]["error"]

    # ✅ Test: tasa menor al 95%
    @patch("boto3.resource")
    def test_process_carga_parcial(self, mock_dynamodb):
        mock_table = MagicMock()
        mock_dynamodb.return_value.Table.return_value = mock_table

        df = pd.DataFrame([
            {"name": "Proveedor A", "country": "CO", "nit": "1234567890",
             "address": "Calle 1", "email": "a@b.com", "phone": "3001234567"},
            {"name": "Proveedor B", "country": "", "nit": "9876543210",
             "address": "Calle 2", "email": "b@b.com", "phone": "3012345678"},
        ])

        cmd = CreateProvidersBulk(b"", "proveedores.csv")
        cmd.table = mock_table
        result = cmd._process(df)
        assert "⚠️ Carga parcial" in result["mensaje"]
        assert result["registros_rechazados"] == 1
