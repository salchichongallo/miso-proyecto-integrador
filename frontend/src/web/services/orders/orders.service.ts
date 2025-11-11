import { HttpClient } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';

import { Observable, of } from 'rxjs';

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
    // TODO: Replace with actual API call when backend is ready
    // return this.http.get<Order[]>(`${this.baseUrl}/client/${customerId}`);

    // Mock data for CLIENT-1234
    if (customerId === '9fe4d034-580f-466a-8813-57a60960641c') {
      return of([
        {
          id: 'ORDER-001',
          priority: 'HIGH',
          products: [
            {
              id: 'PROD-101',
              name: 'Ibuprofeno 400mg',
              amount: 100,
              id_warehouse: 'WH-BOGOTA-01',
            },
            {
              id: 'PROD-102',
              name: 'Paracetamol 500mg',
              amount: 150,
              id_warehouse: 'WH-BOGOTA-01',
            },
          ],
          order_status: 'PENDING',
          country: 'Colombia',
          city: 'Bogotá',
          address: 'Calle 123 #45-67, Chapinero',
          date_estimated: '2025-11-15',
          id_client: 'CLIENT-1234',
          id_vendor: 'VENDOR-001',
          created_at: '2025-11-10T08:30:00Z',
          updated_at: '2025-11-10T08:30:00Z',
        },
        {
          id: 'ORDER-002',
          priority: 'MEDIUM',
          products: [
            {
              id: 'PROD-201',
              name: 'Amoxicilina 500mg',
              amount: 200,
              id_warehouse: 'WH-BOGOTA-02',
            },
          ],
          order_status: 'CONFIRMED',
          country: 'Colombia',
          city: 'Bogotá',
          address: 'Carrera 7 #32-16, Centro',
          date_estimated: '2025-11-16',
          id_client: 'CLIENT-1234',
          id_vendor: 'VENDOR-002',
          created_at: '2025-11-09T14:00:00Z',
          updated_at: '2025-11-09T16:00:00Z',
        },
        {
          id: 'ORDER-003',
          priority: 'LOW',
          products: [
            {
              id: 'PROD-301',
              name: 'Aspirina 100mg',
              amount: 50,
              id_warehouse: 'WH-BOGOTA-01',
            },
            {
              id: 'PROD-302',
              name: 'Loratadina 10mg',
              amount: 75,
              id_warehouse: 'WH-BOGOTA-03',
            },
          ],
          order_status: 'PENDING',
          country: 'Colombia',
          city: 'Bogotá',
          address: 'Avenida 68 #25-33, Kennedy',
          date_estimated: '2025-11-17',
          id_client: 'CLIENT-1234',
          id_vendor: 'VENDOR-001',
          created_at: '2025-11-08T10:00:00Z',
          updated_at: '2025-11-08T10:00:00Z',
        },
      ]);
    }

    // Return empty array for other clients (or mock other data as needed)
    return of([]);
  }
}
