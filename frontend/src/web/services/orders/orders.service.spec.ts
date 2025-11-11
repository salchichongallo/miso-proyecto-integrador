import { TestBed } from '@angular/core/testing';
import { provideHttpClient } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';

import { OrdersService } from './orders.service';
import { Order } from './interfaces/order.interface';

// Mock environment
jest.mock('@env/environment', () => ({
  environment: {
    ordersMicroserviceUrl: 'http://test-orders-api.com',
  },
}));

describe('OrdersService', () => {
  let service: OrdersService;
  let httpMock: HttpTestingController;
  const mockBaseUrl = 'http://test-orders-api.com';

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [OrdersService, provideHttpClient(), provideHttpClientTesting()],
    });
    service = TestBed.inject(OrdersService);
    httpMock = TestBed.inject(HttpTestingController);
  });

  afterEach(() => {
    httpMock.verify();
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  describe('getOrdersByCustomerId', () => {
    it('should send GET request with customer ID as path parameter', () => {
      const customerId = 'customer-123';
      const mockOrders: Order[] = [
        {
          id: 'order-1',
          priority: 'HIGH',
          products: [
            {
              id: 'product-1',
              name: 'Ibuprofeno 400mg',
              amount: 10,
              id_warehouse: 'warehouse-1',
            },
          ],
          order_status: 'PENDING',
          country: 'Colombia',
          city: 'Bogotá',
          address: 'Calle 123 #45-67',
          date_estimated: '2025-12-01',
          id_client: customerId,
          id_vendor: 'vendor-1',
          created_at: '2025-11-10T10:00:00Z',
          updated_at: '2025-11-10T10:00:00Z',
        },
        {
          id: 'order-2',
          priority: 'MEDIUM',
          products: [
            {
              id: 'product-2',
              name: 'Paracetamol 500mg',
              amount: 20,
              id_warehouse: 'warehouse-2',
            },
          ],
          order_status: 'CONFIRMED',
          country: 'Colombia',
          city: 'Medellín',
          address: 'Carrera 45 #12-34',
          date_estimated: '2025-12-05',
          id_client: customerId,
          id_vendor: 'vendor-2',
          created_at: '2025-11-09T14:00:00Z',
          updated_at: '2025-11-09T14:00:00Z',
        },
      ];

      service.getOrdersByCustomerId(customerId).subscribe((orders) => {
        expect(orders).toEqual(mockOrders);
        expect(orders.length).toBe(2);
        expect(orders[0].id_client).toBe(customerId);
        expect(orders[1].id_client).toBe(customerId);
      });

      const req = httpMock.expectOne(`${mockBaseUrl}/client/${customerId}`);

      expect(req.request.method).toBe('GET');
      req.flush(mockOrders);
    });

    it('should return empty array when no orders exist for customer', () => {
      const customerId = 'customer-without-orders';
      const mockOrders: Order[] = [];

      service.getOrdersByCustomerId(customerId).subscribe((orders) => {
        expect(orders).toEqual(mockOrders);
        expect(orders.length).toBe(0);
      });

      const req = httpMock.expectOne(`${mockBaseUrl}/client/${customerId}`);

      expect(req.request.method).toBe('GET');
      req.flush(mockOrders);
    });

    it('should handle error response', () => {
      const customerId = 'customer-123';
      const mockError = {
        error: 'Customer not found',
        message: 'Not Found',
      };

      service.getOrdersByCustomerId(customerId).subscribe({
        next: () => fail('should have failed with error'),
        error: (error) => {
          expect(error.status).toBe(404);
          expect(error.error).toEqual(mockError);
        },
      });

      const req = httpMock.expectOne(`${mockBaseUrl}/client/${customerId}`);
      req.flush(mockError, { status: 404, statusText: 'Not Found' });
    });
  });
});
