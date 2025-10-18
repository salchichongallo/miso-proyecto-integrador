import io
import pytest
from unittest.mock import patch, MagicMock


class TestBulkUploadProvidersWithLogic:

    # ✅ Caso mixto: válidos, inválidos y duplicados
    @pytest.mark.usefixtures("client")
    @patch("boto3.resource")
    def test_bulk_upload_csv_valido_y_erroneo(self, mock_dynamodb, client):
        """✅ Carga masiva real con mezcla de registros válidos, inválidos y duplicados"""
        mock_table = MagicMock()
        mock_dynamodb.return_value.Table.return_value = mock_table

        # Simular que los primeros NIT no existen y el último sí (duplicado)
        mock_table.get_item.side_effect = [
            {},  # A no existe
            {},  # B no existe
            {},  # C no existe
            {"Item": {"nit": "1234567890"}},  # D duplicado
        ]

        # CSV: A y C válidos, B inválido (email sin @), D duplicado
        csv_data = """name,country,nit,address,email,phone
Proveedor A,CO,1234567890,Calle 1,a@mail.com,3001234567
Proveedor B,MX,0987654321,Calle 2,sinarroba.com,3119876543
Proveedor C,CO,2222222222,Calle 3,c@mail.com,3009998888
Proveedor D,CO,1234567890,Calle 4,d@mail.com,3011112222
"""
        file_data = io.BytesIO(csv_data.encode("utf-8"))
        data = {"file": (file_data, "proveedores.csv")}

        response = client.post("/bulk-upload", data=data, content_type="multipart/form-data")
        result = response.get_json()

        # ✅ Validaciones de respuesta
        assert response.status_code == 200
        assert "total_registros" in result
        assert result["total_registros"] == 4
        assert result["registros_exitosos"] == 3
        assert result["registros_rechazados"] == 1


    # 🚫 CSV con columnas faltantes
    @pytest.mark.usefixtures("client")
    @patch("boto3.resource")
    def test_bulk_upload_csv_columnas_faltantes(self, mock_dynamodb, client):
        """❌ CSV con columnas incompletas"""
        csv_data = """name,country,address,email,phone
Proveedor X,CO,Calle 1,x@mail.com,3001234567
"""
        file_data = io.BytesIO(csv_data.encode("utf-8"))
        data = {"file": (file_data, "proveedores.csv")}

        response = client.post("/bulk-upload", data=data, content_type="multipart/form-data")
        result = response.get_json()

        assert response.status_code == 400
        assert "Faltan columnas obligatorias" in result["error"]

    # 🚫 Formato no soportado
    @pytest.mark.usefixtures("client")
    @patch("boto3.resource")
    def test_bulk_upload_formato_no_soportado(self, mock_dynamodb, client):
        """❌ Archivo con extensión no soportada"""
        file_data = io.BytesIO(b"dummy data")
        data = {"file": (file_data, "proveedores.txt")}

        response = client.post("/bulk-upload", data=data, content_type="multipart/form-data")
        result = response.get_json()

        assert response.status_code == 400
        assert "Formato de archivo no soportado" in result["error"]

    # 💣 Error inesperado durante escritura en DynamoDB
    @pytest.mark.usefixtures("client")
    @patch("boto3.resource")
    def test_bulk_upload_error_dynamodb(self, mock_dynamodb, client):
        """💣 Error inesperado durante escritura en DynamoDB"""
        mock_table = MagicMock()
        mock_dynamodb.return_value.Table.return_value = mock_table

        # Simular error en batch_writer (como si DynamoDB fallara)
        mock_table.batch_writer.side_effect = Exception("Error al escribir en DynamoDB")

        csv_data = """name,country,nit,address,email,phone
Proveedor X,CO,1234567890,Dir1,x@mail.com,3001234567
"""
        file_data = io.BytesIO(csv_data.encode("utf-8"))
        data = {"file": (file_data, "proveedores.csv")}

        response = client.post("/bulk-upload", data=data, content_type="multipart/form-data")
        result = response.get_json()

        assert response.status_code == 400
        assert "Error al escribir en DynamoDB" in result["error"]
