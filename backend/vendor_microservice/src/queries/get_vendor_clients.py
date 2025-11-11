import logging
from ..models.vendor import VendorModel


logger = logging.getLogger(__name__)


class GetVendorClients:
    """ Obtiene los clientes asociados a un vendor. """

    def __init__(self, vendor_id):
        self.vendor_id = vendor_id

    def execute(self):
        vendor = VendorModel.get_by_id(self.vendor_id)
        return vendor.institutions
