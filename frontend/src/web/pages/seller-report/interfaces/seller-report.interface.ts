export interface SellerReport {
  /** ID del vendedor */
  sellerId: string;

  /** Pedidos generados */
  orderedProducts: number;

  /** Cumplimiento de meta */
  salesPercentage: number;

  /** Clientes atendidos */
  customersServed: number;

  /** Ventas totales */
  totalSales: number;

  /** Productos vendidos */
  soldProducts: SoldProduct[];
}

export interface SoldProduct {
  id: string;
  name: string;
  quantity: string;
}
