import { ComponentFixture, TestBed } from '@angular/core/testing';
import { Router } from '@angular/router';
import { LoadingController, ToastController } from '@ionic/angular/standalone';

import { of, throwError } from 'rxjs';

import { SupplierRegistrationPage } from './supplier-registration.page';
import { SupplierService } from '@web/services/supplier/supplier.service';
import { RegisterSupplierResponse } from './interfaces/register-supplier-response.interface';

describe('SupplierRegistrationPage', () => {
  let component: SupplierRegistrationPage;
  let fixture: ComponentFixture<SupplierRegistrationPage>;
  let mockRouter: jest.Mocked<Pick<Router, 'navigate'>>;
  let mockSupplierService: jest.Mocked<Pick<SupplierService, 'createSupplier'>>;
  let mockLoadingController: jest.Mocked<Pick<LoadingController, 'create' | 'dismiss'>>;
  let mockToastController: jest.Mocked<Pick<ToastController, 'create'>>;
  let mockLoading: { present: jest.Mock };
  let mockToast: { present: jest.Mock };

  beforeEach(async () => {
    mockRouter = {
      navigate: jest.fn(),
    };

    mockSupplierService = {
      createSupplier: jest.fn().mockReturnValue(
        of({
          message: 'Success',
          provider: {
            name: 'Test',
            email: 'test@test.com',
            phone: '123',
            country: 'CO',
            nit: '123',
            address: 'Test address',
            message: 'Created',
            provider_id: '123',
          },
        }),
      ),
    };

    mockLoading = {
      present: jest.fn().mockResolvedValue(undefined),
    };

    mockToast = {
      present: jest.fn().mockResolvedValue(undefined),
    };

    mockLoadingController = {
      create: jest.fn().mockResolvedValue(mockLoading),
      dismiss: jest.fn().mockResolvedValue(true),
    };

    mockToastController = {
      create: jest.fn().mockResolvedValue(mockToast),
    };

    await TestBed.configureTestingModule({
      imports: [SupplierRegistrationPage],
      providers: [
        { provide: Router, useValue: mockRouter },
        { provide: SupplierService, useValue: mockSupplierService },
        { provide: LoadingController, useValue: mockLoadingController },
        { provide: ToastController, useValue: mockToastController },
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(SupplierRegistrationPage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  describe('Form Validation', () => {
    it('should have invalid form when empty', () => {
      expect(component.supplierForm.invalid).toBe(true);
    });

    it('should have valid form when all fields are filled correctly', () => {
      component.supplierForm.patchValue({
        name: 'Medical Supplies Inc.',
        email: 'contact@medicalsupplies.com',
        phone: '+57 300 123 4567',
        country: 'CO',
        nit: '900123456-7',
        address: 'Calle 123 #45-67',
      });
      expect(component.supplierForm.valid).toBe(true);
    });

    it('should invalidate form with invalid email', () => {
      component.supplierForm.patchValue({
        name: 'Medical Supplies Inc.',
        email: 'invalid-email',
        phone: '+57 300 123 4567',
        country: 'CO',
        nit: '900123456-7',
        address: 'Calle 123 #45-67',
      });
      expect(component.supplierForm.invalid).toBe(true);
      expect(component.emailControl?.hasError('email')).toBe(true);
    });

    it('should invalidate form with invalid phone pattern', () => {
      component.supplierForm.patchValue({
        name: 'Medical Supplies Inc.',
        email: 'contact@medicalsupplies.com',
        phone: 'invalid-phone',
        country: 'CO',
        nit: '900123456-7',
        address: 'Calle 123 #45-67',
      });
      expect(component.supplierForm.invalid).toBe(true);
      expect(component.phoneControl?.hasError('pattern')).toBe(true);
    });

    it('should invalidate form with invalid NIT pattern', () => {
      component.supplierForm.patchValue({
        name: 'Medical Supplies Inc.',
        email: 'contact@medicalsupplies.com',
        phone: '+57 300 123 4567',
        country: 'CO',
        nit: 'ABC123',
        address: 'Calle 123 #45-67',
      });
      expect(component.supplierForm.invalid).toBe(true);
      expect(component.nitControl?.hasError('pattern')).toBe(true);
    });

    it('should require minimum length for name', () => {
      component.supplierForm.patchValue({ name: 'AB' });
      expect(component.nameControl?.hasError('minlength')).toBe(true);
    });

    it('should require minimum length for address', () => {
      component.supplierForm.patchValue({ address: 'ABC' });
      expect(component.addressControl?.hasError('minlength')).toBe(true);
    });
  });

  describe('Form Controls', () => {
    it('should have nameControl', () => {
      expect(component.nameControl).toBeTruthy();
    });

    it('should have emailControl', () => {
      expect(component.emailControl).toBeTruthy();
    });

    it('should have phoneControl', () => {
      expect(component.phoneControl).toBeTruthy();
    });

    it('should have countryControl', () => {
      expect(component.countryControl).toBeTruthy();
    });

    it('should have nitControl', () => {
      expect(component.nitControl).toBeTruthy();
    });

    it('should have addressControl', () => {
      expect(component.addressControl).toBeTruthy();
    });
  });

  describe('onSubmit', () => {
    it('should not call service when form is invalid', () => {
      component.onSubmit();
      expect(mockSupplierService.createSupplier).not.toHaveBeenCalled();
      expect(mockLoadingController.create).not.toHaveBeenCalled();
    });

    it('should mark all fields as touched when form is invalid', () => {
      const markAllAsTouchedSpy = jest.spyOn(component.supplierForm, 'markAllAsTouched');
      component.onSubmit();
      expect(markAllAsTouchedSpy).toHaveBeenCalled();
    });

    it('should call supplier service with form data when valid', async () => {
      const mockResponse: RegisterSupplierResponse = {
        message: 'Success',
        provider: {
          name: 'Medical Supplies Inc.',
          email: 'contact@medicalsupplies.com',
          phone: '+57 300 123 4567',
          country: 'CO',
          nit: '900123456-7',
          address: 'Calle 123 #45-67',
          message: 'Created',
          provider_id: '123',
        },
      };

      mockSupplierService.createSupplier.mockReturnValue(of(mockResponse));

      component.supplierForm.patchValue({
        name: 'Medical Supplies Inc.',
        email: 'contact@medicalsupplies.com',
        phone: '+57 300 123 4567',
        country: 'CO',
        nit: '900123456-7',
        address: 'Calle 123 #45-67',
      });

      component.onSubmit();

      await fixture.whenStable();

      expect(mockSupplierService.createSupplier).toHaveBeenCalledWith({
        name: 'Medical Supplies Inc.',
        email: 'contact@medicalsupplies.com',
        phone: '+57 300 123 4567',
        country: 'CO',
        nit: '900123456-7',
        address: 'Calle 123 #45-67',
      });
    });

    it('should show loading spinner while submitting', async () => {
      const mockResponse: RegisterSupplierResponse = {
        message: 'Success',
        provider: {
          name: 'Test',
          email: 'test@test.com',
          phone: '123',
          country: 'CO',
          nit: '123',
          address: 'Test address',
          message: 'Created',
          provider_id: '123',
        },
      };

      mockSupplierService.createSupplier.mockReturnValue(of(mockResponse));

      component.supplierForm.patchValue({
        name: 'Medical Supplies Inc.',
        email: 'contact@medicalsupplies.com',
        phone: '+57 300 123 4567',
        country: 'CO',
        nit: '900123456-7',
        address: 'Calle 123 #45-67',
      });

      component.onSubmit();

      await fixture.whenStable();

      expect(mockLoadingController.create).toHaveBeenCalledWith({
        message: 'Registrando proveedor...',
      });
      expect(mockLoading.present).toHaveBeenCalled();
      expect(mockLoadingController.dismiss).toHaveBeenCalled();
    });

    it('should show success message on successful registration', async () => {
      const mockResponse: RegisterSupplierResponse = {
        message: 'Success',
        provider: {
          name: 'Test',
          email: 'test@test.com',
          phone: '123',
          country: 'CO',
          nit: '123',
          address: 'Test address',
          message: 'Created',
          provider_id: '123',
        },
      };

      mockSupplierService.createSupplier.mockReturnValue(of(mockResponse));

      component.supplierForm.patchValue({
        name: 'Medical Supplies Inc.',
        email: 'contact@medicalsupplies.com',
        phone: '+57 300 123 4567',
        country: 'CO',
        nit: '900123456-7',
        address: 'Calle 123 #45-67',
      });

      component.onSubmit();

      await fixture.whenStable();

      expect(mockToastController.create).toHaveBeenCalledWith({
        message: 'Proveedor registrado exitosamente.',
        duration: 3000,
        position: 'top',
      });
      expect(mockToast.present).toHaveBeenCalled();
    });

    it('should reset form after successful submission', async () => {
      const mockResponse: RegisterSupplierResponse = {
        message: 'Success',
        provider: {
          name: 'Test',
          email: 'test@test.com',
          phone: '123',
          country: 'CO',
          nit: '123',
          address: 'Test address',
          message: 'Created',
          provider_id: '123',
        },
      };

      mockSupplierService.createSupplier.mockReturnValue(of(mockResponse));

      component.supplierForm.patchValue({
        name: 'Medical Supplies Inc.',
        email: 'contact@medicalsupplies.com',
        phone: '+57 300 123 4567',
        country: 'CO',
        nit: '900123456-7',
        address: 'Calle 123 #45-67',
      });

      component.onSubmit();

      await fixture.whenStable();

      expect(component.supplierForm.value).toEqual({
        name: '',
        email: '',
        phone: '',
        country: '',
        nit: '',
        address: '',
      });
    });

    it('should show error message on registration failure', async () => {
      const errorResponse = {
        error: { message: 'Registration failed' },
        message: 'Http failure',
      };

      mockSupplierService.createSupplier.mockReturnValue(throwError(() => errorResponse));

      component.supplierForm.patchValue({
        name: 'Medical Supplies Inc.',
        email: 'contact@medicalsupplies.com',
        phone: '+57 300 123 4567',
        country: 'CO',
        nit: '900123456-7',
        address: 'Calle 123 #45-67',
      });

      component.onSubmit();

      await fixture.whenStable();

      expect(mockToastController.create).toHaveBeenCalledWith({
        message: 'Registration failed',
        duration: 3000,
        position: 'top',
        color: 'danger',
      });
      expect(mockToast.present).toHaveBeenCalled();
    });
  });

  describe('onCancel', () => {
    it('should reset form and navigate to home', () => {
      component.supplierForm.patchValue({
        name: 'Medical Supplies Inc.',
        email: 'contact@medicalsupplies.com',
        phone: '+57 300 123 4567',
        country: 'CO',
        nit: '900123456-7',
        address: 'Calle 123 #45-67',
      });

      component.onCancel();

      expect(component.supplierForm.value).toEqual({
        name: '',
        email: '',
        phone: '',
        country: '',
        nit: '',
        address: '',
      });
      expect(mockRouter.navigate).toHaveBeenCalledWith(['/home']);
    });
  });
});
