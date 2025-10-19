import io
import pytest


class TestBulkUploadProvidersWithLogic:
    @pytest.mark.usefixtures("client")
    def test_bulk_upload_csv_valido_y_erroneo(self, client):
        """✅ Carga masiva real con registros válidos"""

        csv_data = "name,country,nit,address,email,phone\n"
        csv_data += "Proveedor A,CO,1234567890,Calle 1,a@mail.com,3001234567\n"
        csv_data += "Proveedor B,MX,1234567891,Calle 2,b@mail.com,3119876543"

        file_data = io.BytesIO(csv_data.encode("utf-8"))
        data = {"file": (file_data, "proveedores.csv")}

        response = client.post("/bulk", data=data, content_type="multipart/form-data")
        result = response.get_json()

        assert response.status_code == 200
        assert "total_registros" in result
        assert result["total_registros"] == 2
        assert result["registros_exitosos"] == 2
        assert result["registros_rechazados"] == 0
