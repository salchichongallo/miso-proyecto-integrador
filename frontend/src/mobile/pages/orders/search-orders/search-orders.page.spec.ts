import { TestBed } from '@angular/core/testing';
import { of, throwError } from 'rxjs';

import { SearchOrdersPage } from './search-orders.page';
import { OrderService } from '@mobile/services/order/order.service';
import { Order } from '@mobile/models/order.model';

describe('SearchOrdersPage', () => {
  let page: SearchOrdersPage;
  let mockOrderService: jest.Mocked<Pick<OrderService, 'getOrders'>>;

  const mockOrders: Order[] = [
    {
      id: 'order-1',
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
      created_at: '2025-11-06T10:00:00.000Z',
      updated_at: '2025-11-06T10:00:00.000Z',
    },
    {
      id: 'order-2',
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

  beforeEach(() => {
    mockOrderService = {
      getOrders: jest.fn(),
    };

    TestBed.configureTestingModule({
      providers: [
        SearchOrdersPage,
        {
          provide: OrderService,
          useValue: mockOrderService,
        },
      ],
    });

    page = TestBed.inject(SearchOrdersPage);
  });

  it('should create an instance', () => {
    expect(page).toBeTruthy();
  });

  it('should initialize with empty orders array', () => {
    expect(page.orders).toBeDefined();
    expect(page.orders).toEqual([]);
  });

  it('should initialize with isLoading set to true', () => {
    expect(page.isLoading()).toBe(true);
  });

  describe('ngOnInit', () => {
    it('should call fetchOrders on initialization', () => {
      const fetchOrdersSpy = jest.spyOn(page as never, 'fetchOrders');
      mockOrderService.getOrders.mockReturnValue(of(mockOrders));

      page.ngOnInit();

      expect(fetchOrdersSpy).toHaveBeenCalled();
    });
  });

  describe('fetchOrders', () => {
    it('should update orders and set isLoading to false on successful fetch', () => {
      mockOrderService.getOrders.mockReturnValue(of(mockOrders));

      page.ngOnInit();

      expect(mockOrderService.getOrders).toHaveBeenCalled();
      expect(page.isLoading()).toBe(false);
    });

    it('should set isLoading to false on error', () => {
      const error = new Error('Failed to fetch orders');
      mockOrderService.getOrders.mockReturnValue(throwError(() => error));

      page.ngOnInit();

      expect(mockOrderService.getOrders).toHaveBeenCalled();
      expect(page.isLoading()).toBe(false);
    });

    it('should set isLoading to true before fetching', () => {
      mockOrderService.getOrders.mockReturnValue(of(mockOrders));

      page.isLoading.set(false);
      page.ngOnInit();

      expect(mockOrderService.getOrders).toHaveBeenCalled();
    });
  });

  describe('getStatusColor', () => {
    it('should return "warning" for PENDING status', () => {
      expect(page.getStatusColor('PENDING')).toBe('warning');
    });

    it('should return "secondary" for CONFIRMED status', () => {
      expect(page.getStatusColor('CONFIRMED')).toBe('secondary');
    });

    it('should return "primary" for PROCESSING status', () => {
      expect(page.getStatusColor('PROCESSING')).toBe('primary');
    });

    it('should return "tertiary" for SHIPPED status', () => {
      expect(page.getStatusColor('SHIPPED')).toBe('tertiary');
    });

    it('should return "success" for DELIVERED status', () => {
      expect(page.getStatusColor('DELIVERED')).toBe('success');
    });

    it('should return "danger" for CANCELLED status', () => {
      expect(page.getStatusColor('CANCELLED')).toBe('danger');
    });

    it('should return "medium" for RETURNED status', () => {
      expect(page.getStatusColor('RETURNED')).toBe('medium');
    });

    it('should return "medium" for unknown status', () => {
      expect(page.getStatusColor('UNKNOWN')).toBe('medium');
    });
  });

  describe('getStatusLabel', () => {
    it('should return "Pendiente" for PENDING status', () => {
      expect(page.getStatusLabel('PENDING')).toBe('Pendiente');
    });

    it('should return "Confirmado" for CONFIRMED status', () => {
      expect(page.getStatusLabel('CONFIRMED')).toBe('Confirmado');
    });

    it('should return "Procesando" for PROCESSING status', () => {
      expect(page.getStatusLabel('PROCESSING')).toBe('Procesando');
    });

    it('should return "Enviado" for SHIPPED status', () => {
      expect(page.getStatusLabel('SHIPPED')).toBe('Enviado');
    });

    it('should return "Entregado" for DELIVERED status', () => {
      expect(page.getStatusLabel('DELIVERED')).toBe('Entregado');
    });

    it('should return "Cancelado" for CANCELLED status', () => {
      expect(page.getStatusLabel('CANCELLED')).toBe('Cancelado');
    });

    it('should return "Devuelto" for RETURNED status', () => {
      expect(page.getStatusLabel('RETURNED')).toBe('Devuelto');
    });

    it('should return the original status for unknown status', () => {
      expect(page.getStatusLabel('UNKNOWN')).toBe('UNKNOWN');
    });
  });
});
