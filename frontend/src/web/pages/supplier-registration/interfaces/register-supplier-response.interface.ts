export interface RegisterSupplierResponse {
  message: string;
  provider: Provider;
}

export interface Provider {
  address: string;
  country: string;
  email: string;
  message: string;
  name: string;
  nit: string;
  phone: string;
  provider_id: string;
}
