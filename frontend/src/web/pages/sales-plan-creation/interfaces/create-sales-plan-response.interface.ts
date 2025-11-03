import { ProductTarget } from './product-target.interface';

export interface SalesPlan {
  plan_id: string;
  vendor_id: string;
  period: string;
  region: string;
  products: ProductTarget[];
  created_at: string;
  updated_at: string;
}

export interface CreateSalesPlanResponse {
  message: string;
  plan: SalesPlan;
}
