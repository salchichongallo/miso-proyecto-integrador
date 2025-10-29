export interface ProductFormValue {
  warehouse: string;
  sku: string;
  name: string;
  providerNit: string;
  productType: string;
  stock: number | null;
  lot: string;
  state: string;
  expirationDate: string;
  requiredTemperature: number | null;
  unitValue: number | null;
  storageConditions: string;
}
