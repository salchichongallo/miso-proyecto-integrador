# import pytest
# from unittest.mock import MagicMock, patch
# from botocore.exceptions import ClientError
# from src.commands.view_all import GetAllVendors
# from src.errors.errors import ApiError


# class TestGetAllVendorsCommand:

#     # ✅ Caso exitoso
#     @patch("boto3.resource")
#     def test_fetch_all_exitoso(self, mock_dynamodb):
#         """✅ Retorna lista de vendedores exitosamente"""
#         mock_table = MagicMock()
#         mock_dynamodb.return_value.Table.return_value = mock_table

#         mock_table.scan.return_value = {
#             "Items": [
#                 {"name": "Vendor Z", "email": "z@example.com"},
#                 {"name": "Vendor A", "email": "a@example.com"},
#             ]
#         }

#         command = GetAllVendors()
#         result = command.execute()

#         assert "vendors" in result
#         assert isinstance(result["vendors"], list)
#         assert len(result["vendors"]) == 2
#         assert result["vendors"][0]["name"] == "Vendor A"  # ordenado alfabéticamente
#         mock_table.scan.assert_called()

#     # ⚙️ Paginación simulada
#     @patch("boto3.resource")
#     def test_fetch_all_con_paginacion(self, mock_dynamodb):
#         """🔁 Maneja correctamente la paginación"""
#         mock_table = MagicMock()
#         mock_dynamodb.return_value.Table.return_value = mock_table

#         mock_table.scan.side_effect = [
#             {"Items": [{"name": "Vendor 1"}], "LastEvaluatedKey": "key1"},
#             {"Items": [{"name": "Vendor 2"}]},
#         ]

#         command = GetAllVendors()
#         result = command.fetch_all()

#         assert len(result["vendors"]) == 2
#         names = [v["name"] for v in result["vendors"]]
#         assert "Vendor 1" in names and "Vendor 2" in names
#         assert mock_table.scan.call_count == 2

#     # ⚠️ Caso sin resultados
#     @patch("boto3.resource")
#     def test_fetch_all_sin_vendedores(self, mock_dynamodb):
#         """⚠️ Retorna lista vacía cuando no hay vendedores"""
#         mock_table = MagicMock()
#         mock_dynamodb.return_value.Table.return_value = mock_table

#         mock_table.scan.return_value = {"Items": []}

#         command = GetAllVendors()
#         result = command.fetch_all()

#         assert result == {"vendors": []}

#     # ❌ Error en DynamoDB (ClientError)
#     @patch("boto3.resource")
#     def test_fetch_all_error_dynamodb(self, mock_dynamodb):
#         """❌ Lanza ApiError si DynamoDB falla"""
#         mock_table = MagicMock()
#         mock_dynamodb.return_value.Table.return_value = mock_table

#         mock_table.scan.side_effect = ClientError(
#             {"Error": {"Message": "AccessDenied"}}, "Scan"
#         )

#         command = GetAllVendors()

#         with pytest.raises(ApiError, match="Error al obtener la lista de vendedores"):
#             command.fetch_all()
