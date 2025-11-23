export interface OrderProduct {
  id: string;
  name: string;
  amount: number;
  id_warehouse: string;
  unit_price: number;
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

export interface ScheduledOrder {
  address: string;
  city: string;
  country: string;
  created_at: string;
  date_estimated: string;
  delivery_date: string;
  delivery_vehicle: string;
  dispatch_warehouse: string;
  driver_name: string;
  id: string;
  id_client: string;
  id_vendor: string;
  order_status: 'PENDING' | 'CONFIRMED' | 'SHIPPED' | 'DELIVERED' | 'CANCELLED' | 'RETURNED';
  priority: string;
  updated_at: string;
  products: OrderProduct[];
}
