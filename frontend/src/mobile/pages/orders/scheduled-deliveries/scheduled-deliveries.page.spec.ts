import { of } from 'rxjs';
import { TestBed } from '@angular/core/testing';
import { LoadingController, ToastController } from '@ionic/angular/standalone';
import { TranslateService } from '@ngx-translate/core';
import { OrderService } from '@mobile/services/order/order.service';
import { ScheduledDeliveriesPage } from './scheduled-deliveries.page';

jest.mock('@mobile/services/order/order.service');

describe('ScheduledDeliveriesPage', () => {
  let component: ScheduledDeliveriesPage;
  let mockLoadingController: jest.Mocked<Pick<LoadingController, 'create' | 'dismiss'>>;
  let mockToastController: jest.Mocked<Pick<ToastController, 'create'>>;
  let mockTranslateService: jest.Mocked<Pick<TranslateService, 'instant'>>;
  let mockLoading: { present: jest.Mock; dismiss: jest.Mock };

  beforeEach(() => {
    mockLoading = {
      present: jest.fn().mockResolvedValue(undefined),
      dismiss: jest.fn().mockResolvedValue(true),
    };

    mockLoadingController = {
      create: jest.fn().mockResolvedValue(mockLoading),
      dismiss: jest.fn().mockResolvedValue(true),
    };

    mockToastController = {
      create: jest.fn().mockResolvedValue({
        present: jest.fn().mockResolvedValue(undefined),
      }),
    };

    mockTranslateService = {
      instant: jest.fn((key: string | string[]) => key),
    };

    let ordersService: jest.Mocked<OrderService>;

    TestBed.configureTestingModule({
      providers: [
        ScheduledDeliveriesPage,
        OrderService,
        { provide: LoadingController, useValue: mockLoadingController },
        { provide: ToastController, useValue: mockToastController },
        { provide: TranslateService, useValue: mockTranslateService },
      ],
    });
    ordersService = TestBed.inject(OrderService) as jest.Mocked<OrderService>;
    ordersService.getMyScheduledOrders.mockReturnValue(of([]));

    component = TestBed.inject(ScheduledDeliveriesPage);
  });

  it('should create the component', () => {
    expect(component).toBeTruthy();
  });

  describe('ngOnInit', () => {
    it('should load orders on initialization', async () => {
      await component.ngOnInit();
      expect(mockLoadingController.create).toHaveBeenCalled();
      expect(mockLoading.present).toHaveBeenCalled();
      expect(mockLoading.dismiss).toHaveBeenCalled();
    });
  });

  describe('loadOrders', () => {
    it('should show loading indicator', async () => {
      await component.ngOnInit();
      expect(mockTranslateService.instant).toHaveBeenCalledWith('orders.scheduledDeliveries.loading');
      expect(mockLoadingController.create).toHaveBeenCalledWith({
        message: 'orders.scheduledDeliveries.loading',
        keyboardClose: false,
        backdropDismiss: false,
      });
    });

    it('should dismiss loading indicator after completion', async () => {
      await component.ngOnInit();
      expect(mockLoading.dismiss).toHaveBeenCalled();
    });
  });
});
