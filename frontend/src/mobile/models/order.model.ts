export interface OrderProduct {
  id: string;
  name: string;
  amount: number;
}

export interface OrderRequest {
  priority: 'HIGH' | 'MEDIUM' | 'LOW';
  products: OrderProduct[];
  order_status: 'PENDING' | 'CONFIRMED' | 'SHIPPED' | 'DELIVERED' | 'CANCELLED';
  country: string;
  city: string;
  address: string;
  date_estimated: string;
  id_client: string;
  id_vendor: string;
}

export interface Order extends OrderRequest {
  id: string;
  created_at: string;
  updated_at: string;
}

export interface OrderResponse {
  id: string;
  message: string;
  order: Order;
}
