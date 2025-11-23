export interface Vendor {
  vendor_id: string;
  name: string;
  email: string;
  institutions: string[];
  created_at: string;
  updated_at: string;
}

export interface VendorResponse {
  vendor_id: string;
  name: string;
  email: string;
  institutions: { name: string }[];
  created_at: string;
  updated_at: string;
}
