export interface ProductLocation {
  city: string;
  country: string;
  batch: string;
  priority: 'HIGH' | 'MEDIUM' | 'LOW';
  stock: number;
}

export interface Product {
  id: string;
  provider_nit: string;
  product_type: string;
  storage_conditions: string;
  temperature_required: number;
  name: string;
  batch: string;
  unit_value: number;
  created_at: string;
  sku: string;
  stock: number;
  expiration_date: string;
  status: string;
  updated_at: string;
  warehouse: string;
  warehouse_name: string;
  warehouse_address: string;
  warehouse_city: string;
  warehouse_country: string;
  locations?: ProductLocation[];
}
