export interface SellerReport {
  vendorId: string;
  vendorName: string;
  totalSales: number;
  goalCompletion: number;
  customersServed: number;
  ordersGenerated: number;
  salesGrowth: number;
  goalGrowth: number;
  customersGrowth: number;
  ordersGrowth: number;
  topProducts: TopProduct[];
  salesByMonth: SalesByMonth[];
}

export interface TopProduct {
  productId: string;
  productName: string;
  unitsSold: number;
}

export interface SalesByMonth {
  month: string;
  year: number;
  amount: number;
}

export interface SellerDetailRow {
  vendorId: string;
  vendorName: string;
  email: string;
  institutions: string[];
}
