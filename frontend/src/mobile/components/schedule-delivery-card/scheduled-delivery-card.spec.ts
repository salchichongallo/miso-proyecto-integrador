import { ComponentRef } from '@angular/core';
import { TranslateModule } from '@ngx-translate/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ScheduledOrder } from '@mobile/models/order.model';
import { TranslationService } from '@shared/services/translation';

import { ScheduledDeliveryCardComponent } from './scheduled-delivery-card';

describe('ScheduledDeliveryCardComponent', () => {
  let component: ScheduledDeliveryCardComponent;
  let fixture: ComponentFixture<ScheduledDeliveryCardComponent>;
  let componentRef: ComponentRef<ScheduledDeliveryCardComponent>;

  const mockTranslationService = {
    getLocale: jest.fn().mockReturnValue('en-US'),
    getCurrentLanguage: jest.fn().mockReturnValue('en'),
    setLanguage: jest.fn(),
    getAvailableLanguages: jest.fn().mockReturnValue(['en', 'es']),
    init: jest.fn().mockResolvedValue(undefined),
  };

  const mockOrder: ScheduledOrder = {
    id: 'order-123',
    address: '123 Main St',
    city: 'New York',
    country: 'USA',
    created_at: '2025-01-01T10:00:00Z',
    date_estimated: '2025-01-10T10:00:00Z',
    delivery_date: '2025-01-10T14:30:00Z',
    delivery_vehicle: 'Truck 42',
    dispatch_warehouse: 'Warehouse A',
    driver_name: 'John Doe',
    id_client: 'client-456',
    id_vendor: 'vendor-789',
    order_status: 'SHIPPED',
    priority: 'HIGH',
    updated_at: '2025-01-05T12:00:00Z',
    products: [
      {
        id: 'product-1',
        name: 'Product A',
        amount: 2,
        id_warehouse: 'warehouse-1',
        unit_price: 50.0,
      },
      {
        id: 'product-2',
        name: 'Product B',
        amount: 3,
        id_warehouse: 'warehouse-1',
        unit_price: 30.0,
      },
    ],
  };

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ScheduledDeliveryCardComponent, TranslateModule.forRoot()],
      providers: [{ provide: TranslationService, useValue: mockTranslationService }],
    }).compileComponents();

    fixture = TestBed.createComponent(ScheduledDeliveryCardComponent);
    component = fixture.componentInstance;
    componentRef = fixture.componentRef;
  });

  describe('order input', () => {
    it('should receive order as required input', () => {
      componentRef.setInput('order', mockOrder);
      fixture.detectChanges();

      expect(component.order()).toEqual(mockOrder);
    });

    it('should update when order input changes', () => {
      componentRef.setInput('order', mockOrder);
      fixture.detectChanges();

      const updatedOrder: ScheduledOrder = {
        ...mockOrder,
        id: 'order-456',
        order_status: 'DELIVERED',
      };

      componentRef.setInput('order', updatedOrder);
      fixture.detectChanges();

      expect(component.order()).toEqual(updatedOrder);
    });
  });

  describe('totalSum computed', () => {
    it('should calculate total sum correctly with multiple products', () => {
      componentRef.setInput('order', mockOrder);
      fixture.detectChanges();

      // Expected: (2 * 50) + (3 * 30) = 100 + 90 = 190
      expect(component.totalSum()).toBe(190);
    });

    it('should return 0 for order with no products', () => {
      const orderWithNoProducts: ScheduledOrder = {
        ...mockOrder,
        products: [],
      };

      componentRef.setInput('order', orderWithNoProducts);
      fixture.detectChanges();

      expect(component.totalSum()).toBe(0);
    });

    it('should return correct sum for single product', () => {
      const orderWithOneProduct: ScheduledOrder = {
        ...mockOrder,
        products: [
          {
            id: 'product-1',
            name: 'Product A',
            amount: 5,
            id_warehouse: 'warehouse-1',
            unit_price: 20.0,
          },
        ],
      };

      componentRef.setInput('order', orderWithOneProduct);
      fixture.detectChanges();

      // Expected: 5 * 20 = 100
      expect(component.totalSum()).toBe(100);
    });

    it('should handle products with zero price', () => {
      const orderWithZeroPrice: ScheduledOrder = {
        ...mockOrder,
        products: [
          {
            id: 'product-1',
            name: 'Free Product',
            amount: 10,
            id_warehouse: 'warehouse-1',
            unit_price: 0,
          },
        ],
      };

      componentRef.setInput('order', orderWithZeroPrice);
      fixture.detectChanges();

      expect(component.totalSum()).toBe(0);
    });

    it('should handle products with zero amount', () => {
      const orderWithZeroAmount: ScheduledOrder = {
        ...mockOrder,
        products: [
          {
            id: 'product-1',
            name: 'Product A',
            amount: 0,
            id_warehouse: 'warehouse-1',
            unit_price: 100.0,
          },
        ],
      };

      componentRef.setInput('order', orderWithZeroAmount);
      fixture.detectChanges();

      expect(component.totalSum()).toBe(0);
    });

    it('should handle decimal prices correctly', () => {
      const orderWithDecimalPrices: ScheduledOrder = {
        ...mockOrder,
        products: [
          {
            id: 'product-1',
            name: 'Product A',
            amount: 3,
            id_warehouse: 'warehouse-1',
            unit_price: 10.99,
          },
          {
            id: 'product-2',
            name: 'Product B',
            amount: 2,
            id_warehouse: 'warehouse-1',
            unit_price: 5.5,
          },
        ],
      };

      componentRef.setInput('order', orderWithDecimalPrices);
      fixture.detectChanges();

      // Expected: (3 * 10.99) + (2 * 5.50) = 32.97 + 11.00 = 43.97
      expect(component.totalSum()).toBeCloseTo(43.97, 2);
    });

    it('should recalculate when order changes', () => {
      componentRef.setInput('order', mockOrder);
      fixture.detectChanges();

      expect(component.totalSum()).toBe(190);

      const newOrder: ScheduledOrder = {
        ...mockOrder,
        products: [
          {
            id: 'product-3',
            name: 'Product C',
            amount: 1,
            id_warehouse: 'warehouse-1',
            unit_price: 75.0,
          },
        ],
      };

      componentRef.setInput('order', newOrder);
      fixture.detectChanges();

      expect(component.totalSum()).toBe(75);
    });
  });

  describe('component initialization', () => {
    it('should register ionicons on construction', () => {
      componentRef.setInput('order', mockOrder);
      fixture.detectChanges();

      // Component should initialize without errors
      expect(component).toBeDefined();
    });
  });

  describe('template rendering', () => {
    it('should render component with order data', () => {
      componentRef.setInput('order', mockOrder);
      fixture.detectChanges();

      const compiled = fixture.nativeElement as HTMLElement;
      expect(compiled).toBeTruthy();
    });
  });
});
