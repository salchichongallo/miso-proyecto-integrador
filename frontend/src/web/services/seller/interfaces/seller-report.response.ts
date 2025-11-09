export interface HttpSellerReport {
  customers_served: number;
  ordered_products: number;
  remaining_to_goal: number;
  sales_percentage: number;
  sold_products: HttpSoldProduct[];
  target_units: number;
  target_value: number;
  total_sales: number;
  total_units_sold: number;
  vendor_id: string;
}

export interface HttpSoldProduct {
  id: string;
  name: string;
  quantity: number;
}
