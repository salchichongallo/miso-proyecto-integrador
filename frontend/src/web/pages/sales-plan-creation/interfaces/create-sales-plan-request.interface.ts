import { ProductTarget } from './product-target.interface';

export interface CreateSalesPlanRequest {
  vendor_id: string;
  period: string;
  region: string;
  products: ProductTarget[];
}
