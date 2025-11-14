import { TestBed } from '@angular/core/testing';
import { LoadingController, ToastController } from '@ionic/angular/standalone';
import { TranslateService } from '@ngx-translate/core';
import { of } from 'rxjs';
import { ScheduledDeliveriesPage } from './scheduled-deliveries.page';

describe('ScheduledDeliveriesPage', () => {
  let component: ScheduledDeliveriesPage;
  let mockLoadingController: Partial<jest.Mocked<LoadingController>>;
  let mockToastController: Partial<jest.Mocked<ToastController>>;
  let mockTranslateService: Partial<jest.Mocked<TranslateService>>;

  beforeEach(() => {
    const mockLoading = {
      present: jest.fn().mockResolvedValue(undefined),
      dismiss: jest.fn().mockResolvedValue(true),
    };

    const mockToast = {
      present: jest.fn().mockResolvedValue(undefined),
      dismiss: jest.fn().mockResolvedValue(true),
    };

    mockLoadingController = {
      create: jest.fn().mockResolvedValue(mockLoading as unknown as HTMLIonLoadingElement),
    };

    mockToastController = {
      create: jest.fn().mockResolvedValue(mockToast as unknown as HTMLIonToastElement),
    };

    mockTranslateService = {
      instant: jest.fn((key: string | string[]) => (Array.isArray(key) ? key[0] : key)),
      get: jest.fn((key: string | string[]) => of(Array.isArray(key) ? key[0] : key)),
    };

    TestBed.configureTestingModule({
      providers: [
        ScheduledDeliveriesPage,
        { provide: LoadingController, useValue: mockLoadingController },
        { provide: ToastController, useValue: mockToastController },
        { provide: TranslateService, useValue: mockTranslateService },
      ],
    });
    component = TestBed.inject(ScheduledDeliveriesPage);
  });

  it('should create the component', () => {
    expect(component).toBeTruthy();
  });
});
