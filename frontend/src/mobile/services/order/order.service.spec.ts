import { TestBed } from '@angular/core/testing';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { provideHttpClient } from '@angular/common/http';

import { OrderService } from './order.service';
import { Order, OrderRequest, OrderResponse } from '@mobile/models/order.model';
import { environment } from '@env/environment';

describe('OrderService', () => {
  let service: OrderService;
  let httpMock: HttpTestingController;

  const mockOrderRequest: OrderRequest = {
    priority: 'HIGH',
    order_status: 'PENDING',
    country: 'Colombia',
    city: 'Bogotá',
    address: 'Calle 123',
    date_estimated: '2025-11-15',
    id_client: 'client-001',
    id_vendor: 'vendor-001',
    products: [
      {
        id: 'prod-001',
        name: 'Product 1',
        amount: 10,
        id_warehouse: 'warehouse-001',
      },
    ],
  };

  const mockOrder: Order = {
    id: 'order-001',
    ...mockOrderRequest,
    created_at: '2025-11-06T10:00:00.000Z',
    updated_at: '2025-11-06T10:00:00.000Z',
  };

  const mockOrders: Order[] = [
    mockOrder,
    {
      id: 'order-002',
      priority: 'MEDIUM',
      order_status: 'CONFIRMED',
      country: 'Colombia',
      city: 'Medellín',
      address: 'Carrera 45',
      date_estimated: '2025-11-20',
      id_client: 'client-002',
      id_vendor: 'vendor-002',
      products: [
        {
          id: 'prod-002',
          name: 'Product 2',
          amount: 5,
          id_warehouse: 'warehouse-002',
        },
      ],
      created_at: '2025-11-06T11:00:00.000Z',
      updated_at: '2025-11-06T11:00:00.000Z',
    },
  ];

  const mockOrderResponse: OrderResponse = {
    id: 'order-001',
    message: 'Order created successfully',
    order: mockOrder,
  };

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [OrderService, provideHttpClient(), provideHttpClientTesting()],
    });

    service = TestBed.inject(OrderService);
    httpMock = TestBed.inject(HttpTestingController);
  });

  afterEach(() => {
    httpMock.verify();
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  describe('createOrder', () => {
    it('should create an order via POST request', () => {
      service.createOrder(mockOrderRequest).subscribe((response) => {
        expect(response).toEqual(mockOrderResponse);
        expect(response.order.id).toBe('order-001');
        expect(response.message).toBe('Order created successfully');
      });

      const req = httpMock.expectOne(`${environment.ordersMicroserviceUrl}/`);
      expect(req.request.method).toBe('POST');
      expect(req.request.body).toEqual(mockOrderRequest);
      req.flush(mockOrderResponse);
    });

    it('should handle error when creating an order', () => {
      const errorMessage = 'Failed to create order';

      service.createOrder(mockOrderRequest).subscribe({
        next: () => fail('should have failed with error'),
        error: (error) => {
          expect(error.status).toBe(400);
          expect(error.statusText).toBe('Bad Request');
        },
      });

      const req = httpMock.expectOne(`${environment.ordersMicroserviceUrl}/`);
      req.flush(errorMessage, { status: 400, statusText: 'Bad Request' });
    });
  });

  describe('getOrders', () => {
    it('should retrieve all orders via GET request', () => {
      service.getOrders().subscribe((orders) => {
        expect(orders).toEqual(mockOrders);
        expect(orders.length).toBe(2);
        expect(orders[0].id).toBe('order-001');
        expect(orders[1].id).toBe('order-002');
      });

      const req = httpMock.expectOne(`${environment.ordersMicroserviceUrl}/`);
      expect(req.request.method).toBe('GET');
      req.flush(mockOrders);
    });

    it('should return empty array when no orders exist', () => {
      service.getOrders().subscribe((orders) => {
        expect(orders).toEqual([]);
        expect(orders.length).toBe(0);
      });

      const req = httpMock.expectOne(`${environment.ordersMicroserviceUrl}/`);
      req.flush([]);
    });

    it('should handle error when retrieving orders', () => {
      service.getOrders().subscribe({
        next: () => fail('should have failed with error'),
        error: (error) => {
          expect(error.status).toBe(500);
          expect(error.statusText).toBe('Internal Server Error');
        },
      });

      const req = httpMock.expectOne(`${environment.ordersMicroserviceUrl}/`);
      req.flush('Server error', { status: 500, statusText: 'Internal Server Error' });
    });
  });

  describe('getOrderById', () => {
    it('should retrieve a specific order by ID via GET request', () => {
      const orderId = 'order-001';

      service.getOrderById(orderId).subscribe((order) => {
        expect(order).toEqual(mockOrder);
        expect(order.id).toBe(orderId);
        expect(order.priority).toBe('HIGH');
      });

      const req = httpMock.expectOne(`${environment.ordersMicroserviceUrl}/${orderId}`);
      expect(req.request.method).toBe('GET');
      req.flush(mockOrder);
    });

    it('should handle error when order is not found', () => {
      const orderId = 'non-existent-order';

      service.getOrderById(orderId).subscribe({
        next: () => fail('should have failed with error'),
        error: (error) => {
          expect(error.status).toBe(404);
          expect(error.statusText).toBe('Not Found');
        },
      });

      const req = httpMock.expectOne(`${environment.ordersMicroserviceUrl}/${orderId}`);
      req.flush('Order not found', { status: 404, statusText: 'Not Found' });
    });
  });

  describe('updateOrderStatus', () => {
    it('should update order status via PATCH request', () => {
      const orderId = 'order-001';
      const newStatus: OrderRequest['order_status'] = 'CONFIRMED';
      const updatedOrder: Order = { ...mockOrder, order_status: newStatus };

      service.updateOrderStatus(orderId, newStatus).subscribe((order) => {
        expect(order).toEqual(updatedOrder);
        expect(order.order_status).toBe(newStatus);
      });

      const req = httpMock.expectOne(`${environment.ordersMicroserviceUrl}/${orderId}/status`);
      expect(req.request.method).toBe('PATCH');
      expect(req.request.body).toEqual({ status: newStatus });
      req.flush(updatedOrder);
    });

    it('should handle different status updates', () => {
      const orderId = 'order-001';
      const statuses: Array<OrderRequest['order_status']> = [
        'PENDING',
        'CONFIRMED',
        'SHIPPED',
        'DELIVERED',
        'CANCELLED',
      ];

      statuses.forEach((status) => {
        const updatedOrder: Order = { ...mockOrder, order_status: status };

        service.updateOrderStatus(orderId, status).subscribe((order) => {
          expect(order.order_status).toBe(status);
        });

        const req = httpMock.expectOne(`${environment.ordersMicroserviceUrl}/${orderId}/status`);
        expect(req.request.body).toEqual({ status });
        req.flush(updatedOrder);
      });
    });

    it('should handle error when updating order status', () => {
      const orderId = 'order-001';
      const newStatus: OrderRequest['order_status'] = 'CONFIRMED';

      service.updateOrderStatus(orderId, newStatus).subscribe({
        next: () => fail('should have failed with error'),
        error: (error) => {
          expect(error.status).toBe(403);
          expect(error.statusText).toBe('Forbidden');
        },
      });

      const req = httpMock.expectOne(`${environment.ordersMicroserviceUrl}/${orderId}/status`);
      req.flush('Cannot update order status', { status: 403, statusText: 'Forbidden' });
    });
  });

  describe('cancelOrder', () => {
    it('should cancel an order by updating status to CANCELLED', () => {
      const orderId = 'order-001';
      const cancelledOrder: Order = { ...mockOrder, order_status: 'CANCELLED' };

      service.cancelOrder(orderId).subscribe((order) => {
        expect(order).toEqual(cancelledOrder);
        expect(order.order_status).toBe('CANCELLED');
      });

      const req = httpMock.expectOne(`${environment.ordersMicroserviceUrl}/${orderId}/status`);
      expect(req.request.method).toBe('PATCH');
      expect(req.request.body).toEqual({ status: 'CANCELLED' });
      req.flush(cancelledOrder);
    });

    it('should handle error when cancelling an order', () => {
      const orderId = 'order-001';

      service.cancelOrder(orderId).subscribe({
        next: () => fail('should have failed with error'),
        error: (error) => {
          expect(error.status).toBe(400);
          expect(error.statusText).toBe('Bad Request');
        },
      });

      const req = httpMock.expectOne(`${environment.ordersMicroserviceUrl}/${orderId}/status`);
      req.flush('Cannot cancel order', { status: 400, statusText: 'Bad Request' });
    });

    it('should use updateOrderStatus method internally', () => {
      const orderId = 'order-001';
      const cancelledOrder: Order = { ...mockOrder, order_status: 'CANCELLED' };
      const updateSpy = jest.spyOn(service, 'updateOrderStatus');

      service.cancelOrder(orderId).subscribe();

      expect(updateSpy).toHaveBeenCalledWith(orderId, 'CANCELLED');

      const req = httpMock.expectOne(`${environment.ordersMicroserviceUrl}/${orderId}/status`);
      req.flush(cancelledOrder);
    });
  });
});
