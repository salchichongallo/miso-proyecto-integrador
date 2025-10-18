export interface RegisterSellerResponse {
  mssg: string;
  vendor: Vendor;
}

export interface Vendor {
  email: string;
  institutions: string[];
  name: string;
  vendor_id: string;
}
