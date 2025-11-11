import { HttpClient } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';

import { Observable } from 'rxjs';

import { environment } from '@env/environment';

import { Order } from './interfaces/order.interface';

@Injectable({
  providedIn: 'root',
})
export class OrdersService {
  private readonly baseUrl = environment.ordersMicroserviceUrl;
  private readonly http = inject(HttpClient);

  /**
   * Get all orders for a specific customer
   * @param customerId - The customer ID to filter orders
   * @returns Observable of orders array
   */
  public getOrdersByCustomerId(customerId: string): Observable<Order[]> {
    return this.http.get<Order[]>(`${this.baseUrl}/client/${customerId}`);
  }
}
