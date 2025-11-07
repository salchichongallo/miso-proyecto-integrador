export interface ReportFilters {
  vendorId?: string;
  startDate?: string;
  endDate?: string;
  region?: string;
  productId?: string;
}

export interface ReportFilterOptions {
  vendors: FilterOption[];
  regions: FilterOption[];
  products: FilterOption[];
}

export interface FilterOption {
  id: string;
  name: string;
}
