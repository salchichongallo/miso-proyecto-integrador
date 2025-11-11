export interface OrderProduct {
  id: string;
  name: string;
  amount: number;
  id_warehouse: string;
}

export interface Order {
  id: string;
  priority: 'HIGH' | 'MEDIUM' | 'LOW';
  products: OrderProduct[];
  order_status: 'PENDING' | 'CONFIRMED' | 'SHIPPED' | 'DELIVERED' | 'CANCELLED';
  country: string;
  city: string;
  address: string;
  date_estimated: string;
  id_client: string;
  id_vendor: string;
  created_at: string;
  updated_at: string;
}
