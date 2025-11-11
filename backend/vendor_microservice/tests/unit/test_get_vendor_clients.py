from unittest.mock import patch, MagicMock
from src.queries.get_vendor_clients import GetVendorClients
from src.models.vendor import VendorModel


class TestGetVendorClients:
    @patch.object(VendorModel, "get_by_id")
    def test_get_vendor_clients(self, mock_get_by_id):
        mock_get_by_id.return_value = MagicMock(institutions=["client1", "client2"])
        query = GetVendorClients("vendor_id")
        result = query.execute()
        assert result == ["client1", "client2"]
        mock_get_by_id.assert_called_once_with("vendor_id")
