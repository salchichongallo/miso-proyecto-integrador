import { HttpClient } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';

import { Observable } from 'rxjs';

import { environment } from '@env/environment';

import { OrderRequest, OrderResponse, Order } from '@mobile/models/order.model';

@Injectable({
  providedIn: 'root',
})
export class OrderService {
  private readonly baseUrl = environment.ordersMicroserviceUrl;
  private readonly http = inject(HttpClient);

  public createOrder(orderRequest: OrderRequest): Observable<OrderResponse> {
    return this.http.post<OrderResponse>(`${this.baseUrl}/orders/`, orderRequest);
  }

  public getOrders(): Observable<Order[]> {
    return this.http.get<Order[]>(`${this.baseUrl}/orders`);
  }

  public getOrderById(orderId: string): Observable<Order> {
    return this.http.get<Order>(`${this.baseUrl}/orders/${orderId}`);
  }

  public updateOrderStatus(
    orderId: string,
    status: OrderRequest['order_status']
  ): Observable<Order> {
    return this.http.patch<Order>(`${this.baseUrl}/orders/${orderId}/status`, { status });
  }

  public cancelOrder(orderId: string): Observable<Order> {
    return this.updateOrderStatus(orderId, 'CANCELLED');
  }
}
