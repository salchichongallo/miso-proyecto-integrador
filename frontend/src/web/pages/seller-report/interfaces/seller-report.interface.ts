export interface SellerReport {
  orderedProducts: number;
  salesPercentage: number;
  customersServed: number;
  totalSales: number;
  soldProducts: SoldProduct[];
}

export interface SoldProduct {
  id: string;
  name: string;
  quantity: string;
}
