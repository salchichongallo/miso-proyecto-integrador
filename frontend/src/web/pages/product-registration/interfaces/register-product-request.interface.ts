export interface RegisterProductRequest {
  warehouse: string;
  sku: string;
  name: string;
  provider_nit: string;
  product_type: string;
  stock: number;
  expiration_date: string;
  temperature_required: number;
  batch: string;
  status: string;
  unit_value: number;
  storage_conditions: string;
}
