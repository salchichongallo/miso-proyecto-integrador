import { TestBed } from '@angular/core/testing';
import { FormBuilder } from '@angular/forms';
import { Router } from '@angular/router';
import { LoadingController, ToastController } from '@ionic/angular/standalone';
import { TranslateModule, TranslateService } from '@ngx-translate/core';
import { of, throwError } from 'rxjs';

import { RegisterInstitutionalPage } from './register-institutional.page';
import { CustomersService } from '@mobile/services/customers/customers.service';
import { CreateInstitutionalClientResponse } from '@mobile/models';

describe('RegisterInstitutionalPage', () => {
  let component: RegisterInstitutionalPage;
  let mockRouter: Partial<jest.Mocked<Router>>;
  let mockCustomersService: Partial<jest.Mocked<CustomersService>>;
  let mockLoadingController: Partial<jest.Mocked<LoadingController>>;
  let mockToastController: Partial<jest.Mocked<ToastController>>;
  let mockTranslateService: jest.Mocked<any>;
  let mockLoading: {
    present: jest.Mock;
    dismiss: jest.Mock;
  };
  let mockToast: {
    present: jest.Mock;
  };

  beforeEach(() => {
    mockLoading = {
      present: jest.fn().mockResolvedValue(undefined),
      dismiss: jest.fn().mockResolvedValue(undefined),
    };

    mockToast = {
      present: jest.fn().mockResolvedValue(undefined),
    };

    mockRouter = {
      navigate: jest.fn(),
    };

    mockCustomersService = {
      createInstitutionalClient: jest.fn(),
    };

    mockLoadingController = {
      create: jest.fn().mockResolvedValue(mockLoading),
    };

    mockToastController = {
      create: jest.fn().mockResolvedValue(mockToast),
    };

    mockTranslateService = {
      get: jest.fn().mockReturnValue({ subscribe: jest.fn() }),
      instant: jest.fn((key: string) => {
        const translations: Record<string, string> = {
          'customers.register.toast.loading': 'Registrando cliente institucional...',
          'customers.register.toast.success': 'Cliente institucional registrado exitosamente.',
          'customers.register.toast.error': 'Error al registrar el cliente institucional.',
        };
        return translations[key] || key;
      }),
    };

    TestBed.configureTestingModule({
      imports: [TranslateModule.forRoot()],
      providers: [
        FormBuilder,
        { provide: Router, useValue: mockRouter },
        { provide: CustomersService, useValue: mockCustomersService },
        { provide: LoadingController, useValue: mockLoadingController },
        { provide: ToastController, useValue: mockToastController },
        { provide: TranslateService, useValue: mockTranslateService },
      ],
    });

    const fb = TestBed.inject(FormBuilder);
    const router = TestBed.inject(Router);
    const customerService = TestBed.inject(CustomersService);
    const loadingController = TestBed.inject(LoadingController);
    const toastController = TestBed.inject(ToastController);
    const translateService = mockTranslateService;

    component = new RegisterInstitutionalPage(fb, router, customerService, loadingController, toastController, translateService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('Component Initialization', () => {
    it('should create', () => {
      expect(component).toBeTruthy();
    });

    it('should initialize form with empty values', () => {
      expect(component.institutionalClientForm.value).toEqual({
        taxId: '',
        companyName: '',
        country: '',
        careLevel: '',
        specialty: '',
        location: '',
      });
    });

    it('should have countries list loaded', () => {
      expect(component.countries).toBeDefined();
      expect(component.countries.length).toBeGreaterThan(0);
      expect(component.countries).toContainEqual({ name: 'Colombia', code: 'CO' });
    });

    it('should have care levels list loaded', () => {
      expect(component.careLevels).toBeDefined();
      expect(component.careLevels).toEqual([
        { value: 1, roman: 'I' },
        { value: 2, roman: 'II' },
        { value: 3, roman: 'III' },
        { value: 4, roman: 'IV' },
      ]);
    });

    it('should have specialties list loaded', () => {
      expect(component.specialties).toBeDefined();
      expect(component.specialties.length).toBe(15);
      expect(component.specialties).toContain('Oncología');
    });
  });

  describe('Form Validation', () => {
    it('should mark form as invalid when fields are empty', () => {
      expect(component.institutionalClientForm.valid).toBeFalsy();
    });

    it('should mark form as valid when all fields are filled', () => {
      component.institutionalClientForm.patchValue({
        taxId: '123456789',
        companyName: 'Test Company S.A.',
        country: 'CO',
        careLevel: 3,
        specialty: 'Oncología',
        location: 'Calle 123 #45-67',
      });
      expect(component.institutionalClientForm.valid).toBeTruthy();
    });

    it('should invalidate form when taxId is empty', () => {
      component.institutionalClientForm.patchValue({
        taxId: '',
        companyName: 'Test Company S.A.',
        country: 'CO',
        careLevel: 3,
        specialty: 'Oncología',
        location: 'Calle 123 #45-67',
      });
      expect(component.institutionalClientForm.valid).toBeFalsy();
      expect(component.institutionalClientForm.get('taxId')?.errors).toEqual({ required: true });
    });

    it('should invalidate form when taxId exceeds max length', () => {
      component.institutionalClientForm.patchValue({
        taxId: '123456789012345678901',
        companyName: 'Test Company S.A.',
        country: 'CO',
        careLevel: 3,
        specialty: 'Oncología',
        location: 'Calle 123 #45-67',
      });
      expect(component.institutionalClientForm.get('taxId')?.valid).toBeFalsy();
      expect(component.institutionalClientForm.get('taxId')?.errors).toHaveProperty('maxlength');
    });

    it('should invalidate form when location exceeds max length', () => {
      component.institutionalClientForm.patchValue({
        taxId: '123456789',
        companyName: 'Test Company S.A.',
        country: 'CO',
        careLevel: 3,
        specialty: 'Oncología',
        location: 'a'.repeat(201),
      });
      expect(component.institutionalClientForm.get('location')?.valid).toBeFalsy();
    });
  });

  describe('cancelRegister', () => {
    it('should navigate back to customers page on cancel', () => {
      component.cancelRegister();
      expect(mockRouter.navigate).toHaveBeenCalledWith(['/tabs/customers']);
    });
  });

  describe('submit', () => {
    it('should not submit when form is invalid', async () => {
      component.institutionalClientForm.patchValue({
        taxId: '',
        companyName: '',
        country: '',
        careLevel: '',
        specialty: '',
        location: '',
      });

      await component.submit();

      expect(mockCustomersService.createInstitutionalClient).not.toHaveBeenCalled();
      expect(mockRouter.navigate).not.toHaveBeenCalled();
    });

    it('should mark all fields as touched when form is invalid', async () => {
      const markAllAsTouchedSpy = jest.spyOn(component.institutionalClientForm, 'markAllAsTouched');

      await component.submit();

      expect(markAllAsTouchedSpy).toHaveBeenCalled();
    });

    it('should transform care level to roman numerals when submitting', async () => {
      const mockResponse: CreateInstitutionalClientResponse = {
        mssg: 'Client created successfully',
        vendor: {
          client_id: 'test-id',
          name: 'Test Company S.A.',
          tax_id: '123456789',
          country: 'CO',
          level: 'III',
          specialty: 'Oncología',
          location: 'Calle 123 #45-67',
          message: 'Cliente institucional registrado exitosamente',
        },
      };

      mockCustomersService.createInstitutionalClient = jest.fn().mockReturnValue(of(mockResponse));

      component.institutionalClientForm.patchValue({
        taxId: '123456789',
        companyName: 'Test Company S.A.',
        country: 'CO',
        careLevel: 3,
        specialty: 'Oncología',
        location: 'Calle 123 #45-67',
      });

      await component.submit();

      expect(mockCustomersService.createInstitutionalClient).toHaveBeenCalledWith({
        name: 'Test Company S.A.',
        tax_id: '123456789',
        country: 'CO',
        level: 'III',
        specialty: 'Oncología',
        location: 'Calle 123 #45-67',
      });
    });

    it('should show loading indicator while submitting', async () => {
      const mockResponse: CreateInstitutionalClientResponse = {
        mssg: 'Client created successfully',
        vendor: {
          client_id: 'test-id',
          name: 'Test Company S.A.',
          tax_id: '123456789',
          country: 'CO',
          level: 'III',
          specialty: 'Oncología',
          location: 'Calle 123 #45-67',
          message: 'Cliente institucional registrado exitosamente',
        },
      };

      mockCustomersService.createInstitutionalClient = jest.fn().mockReturnValue(of(mockResponse));

      component.institutionalClientForm.patchValue({
        taxId: '123456789',
        companyName: 'Test Company S.A.',
        country: 'CO',
        careLevel: 3,
        specialty: 'Oncología',
        location: 'Calle 123 #45-67',
      });

      await component.submit();

      expect(mockLoadingController.create).toHaveBeenCalledWith({
        message: 'Registrando cliente institucional...',
      });
      expect(mockLoading.present).toHaveBeenCalled();
      expect(mockLoading.dismiss).toHaveBeenCalled();
    });

    it('should reset form, navigate and show success message on successful submission', async () => {
      const mockResponse: CreateInstitutionalClientResponse = {
        mssg: 'Client created successfully',
        vendor: {
          client_id: 'test-id',
          name: 'Test Company S.A.',
          tax_id: '123456789',
          country: 'CO',
          level: 'III',
          specialty: 'Oncología',
          location: 'Calle 123 #45-67',
          message: 'Cliente institucional registrado exitosamente',
        },
      };

      mockCustomersService.createInstitutionalClient = jest.fn().mockReturnValue(of(mockResponse));

      component.institutionalClientForm.patchValue({
        taxId: '123456789',
        companyName: 'Test Company S.A.',
        country: 'CO',
        careLevel: 3,
        specialty: 'Oncología',
        location: 'Calle 123 #45-67',
      });

      await component.submit();

      // Wait for async operations to complete
      await Promise.resolve();

      expect(component.institutionalClientForm.value).toEqual({
        taxId: null,
        companyName: null,
        country: null,
        careLevel: null,
        specialty: null,
        location: null,
      });
      expect(mockRouter.navigate).toHaveBeenCalledWith(['/tabs/customers']);
      expect(mockToastController.create).toHaveBeenCalledWith({
        message: 'Cliente institucional registrado exitosamente.',
        duration: 3000,
        position: 'top',
      });
      expect(mockToast.present).toHaveBeenCalled();
    });

    it('should show error toast with error.error.error message when submission fails', async () => {
      const errorResponse = {
        error: {
          error: 'Custom error message from backend',
        },
      };

      mockCustomersService.createInstitutionalClient = jest
        .fn()
        .mockReturnValue(throwError(() => errorResponse));

      component.institutionalClientForm.patchValue({
        taxId: '123456789',
        companyName: 'Test Company S.A.',
        country: 'CO',
        careLevel: 3,
        specialty: 'Oncología',
        location: 'Calle 123 #45-67',
      });

      await component.submit();

      // Wait for async operations to complete
      await Promise.resolve();

      expect(mockToastController.create).toHaveBeenCalledWith({
        message: 'Custom error message from backend',
        duration: 3000,
        position: 'bottom',
        color: 'danger',
      });
      expect(mockToast.present).toHaveBeenCalled();
      expect(mockRouter.navigate).not.toHaveBeenCalled();
    });

    it('should show error toast with error.error.message when error.error.error is not present', async () => {
      const errorResponse = {
        error: {
          message: 'Error message from backend',
        },
      };

      mockCustomersService.createInstitutionalClient = jest
        .fn()
        .mockReturnValue(throwError(() => errorResponse));

      component.institutionalClientForm.patchValue({
        taxId: '123456789',
        companyName: 'Test Company S.A.',
        country: 'CO',
        careLevel: 3,
        specialty: 'Oncología',
        location: 'Calle 123 #45-67',
      });

      await component.submit();

      expect(mockToastController.create).toHaveBeenCalledWith({
        message: 'Error message from backend',
        duration: 3000,
        position: 'bottom',
        color: 'danger',
      });
    });

    it('should show default error message when no error message is provided', async () => {
      mockCustomersService.createInstitutionalClient = jest.fn().mockReturnValue(throwError(() => ({})));

      component.institutionalClientForm.patchValue({
        taxId: '123456789',
        companyName: 'Test Company S.A.',
        country: 'CO',
        careLevel: 3,
        specialty: 'Oncología',
        location: 'Calle 123 #45-67',
      });

      await component.submit();

      expect(mockToastController.create).toHaveBeenCalledWith({
        message: 'Error al registrar el cliente institucional.',
        duration: 3000,
        position: 'bottom',
        color: 'danger',
      });
    });

    it('should dismiss loading even when submission fails', async () => {
      mockCustomersService.createInstitutionalClient = jest
        .fn()
        .mockReturnValue(throwError(() => new Error('Test error')));

      component.institutionalClientForm.patchValue({
        taxId: '123456789',
        companyName: 'Test Company S.A.',
        country: 'CO',
        careLevel: 3,
        specialty: 'Oncología',
        location: 'Calle 123 #45-67',
      });

      await component.submit();

      expect(mockLoading.dismiss).toHaveBeenCalled();
    });
  });

  describe('Care Level Transformation', () => {
    it.each([
      [1, 'I'],
      [2, 'II'],
      [3, 'III'],
      [4, 'IV'],
    ])('should transform care level %i to roman numeral %s', async (value, roman) => {
      const mockResponse: CreateInstitutionalClientResponse = {
        mssg: 'Client created successfully',
        vendor: {
          client_id: 'test-id',
          name: 'Test Company S.A.',
          tax_id: '123456789',
          country: 'CO',
          level: roman,
          specialty: 'Oncología',
          location: 'Calle 123 #45-67',
          message: 'Cliente institucional registrado exitosamente',
        },
      };

      mockCustomersService.createInstitutionalClient = jest.fn().mockReturnValue(of(mockResponse));

      component.institutionalClientForm.patchValue({
        taxId: '123456789',
        companyName: 'Test Company S.A.',
        country: 'CO',
        careLevel: value,
        specialty: 'Oncología',
        location: 'Calle 123 #45-67',
      });

      await component.submit();

      expect(mockCustomersService.createInstitutionalClient).toHaveBeenCalledWith(
        expect.objectContaining({
          level: roman,
        })
      );
    });
  });
});
