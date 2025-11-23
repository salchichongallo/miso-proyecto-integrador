import { HttpClient } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';

import { Observable, filter, map } from 'rxjs';

import { environment } from '@env/environment';

import { OrderRequest, OrderResponse, Order, ScheduledOrder } from '@mobile/models/order.model';

@Injectable({
  providedIn: 'root',
})
export class OrderService {
  private readonly baseUrl = environment.ordersMicroserviceUrl;
  private readonly http = inject(HttpClient);

  public createOrder(orderRequest: OrderRequest): Observable<OrderResponse> {
    return this.http.post<OrderResponse>(`${this.baseUrl}/`, orderRequest);
  }

  public getOrders(): Observable<Order[]> {
    return this.http.get<Order[]>(`${this.baseUrl}/client`);
  }

  public getOrderById(orderId: string): Observable<Order> {
    return this.http.get<Order>(`${this.baseUrl}/${orderId}`);
  }

  public updateOrderStatus(orderId: string, status: OrderRequest['order_status']): Observable<Order> {
    return this.http.patch<Order>(`${this.baseUrl}/${orderId}/status`, { status });
  }

  public cancelOrder(orderId: string): Observable<Order> {
    return this.updateOrderStatus(orderId, 'CANCELLED');
  }

  public getMyScheduledOrders(): Observable<ScheduledOrder[]> {
    const allOrders = this.http.get<ScheduledOrder[]>(`${this.baseUrl}/client`);
    const scheduledOrders = allOrders.pipe(
      map((orders) => orders.filter((order) => ['PENDING', 'CONFIRMED', 'SHIPPED'].includes(order.order_status))),
    );
    return scheduledOrders;
  }
}
