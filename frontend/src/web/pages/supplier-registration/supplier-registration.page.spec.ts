import { ComponentFixture, TestBed } from '@angular/core/testing';
import { Router } from '@angular/router';

import { SupplierRegistrationPage } from './supplier-registration.page';

describe('SupplierRegistrationPage', () => {
  let component: SupplierRegistrationPage;
  let fixture: ComponentFixture<SupplierRegistrationPage>;
  let mockRouter: jest.Mocked<Pick<Router, 'navigate'>>;

  beforeEach(async () => {
    mockRouter = {
      navigate: jest.fn(),
    };

    await TestBed.configureTestingModule({
      imports: [SupplierRegistrationPage],
      providers: [{ provide: Router, useValue: mockRouter }],
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
        country: 'Colombia',
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
        country: 'Colombia',
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
        country: 'Colombia',
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
        country: 'Colombia',
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
    it('should not submit when form is invalid', () => {
      const consoleSpy = jest.spyOn(console, 'log').mockImplementation();
      component.onSubmit();
      expect(consoleSpy).not.toHaveBeenCalled();
      expect(mockRouter.navigate).not.toHaveBeenCalled();
      consoleSpy.mockRestore();
    });

    it('should submit and navigate when form is valid', () => {
      const consoleSpy = jest.spyOn(console, 'log').mockImplementation();
      component.supplierForm.patchValue({
        name: 'Medical Supplies Inc.',
        email: 'contact@medicalsupplies.com',
        phone: '+57 300 123 4567',
        country: 'Colombia',
        nit: '900123456-7',
        address: 'Calle 123 #45-67',
      });

      component.onSubmit();

      expect(consoleSpy).toHaveBeenCalledWith('Supplier registration data:', {
        name: 'Medical Supplies Inc.',
        email: 'contact@medicalsupplies.com',
        phone: '+57 300 123 4567',
        country: 'Colombia',
        nit: '900123456-7',
        address: 'Calle 123 #45-67',
      });
      expect(mockRouter.navigate).toHaveBeenCalledWith(['/home']);
      consoleSpy.mockRestore();
    });

    it('should reset form after successful submission', () => {
      component.supplierForm.patchValue({
        name: 'Medical Supplies Inc.',
        email: 'contact@medicalsupplies.com',
        phone: '+57 300 123 4567',
        country: 'Colombia',
        nit: '900123456-7',
        address: 'Calle 123 #45-67',
      });

      component.onSubmit();

      expect(component.supplierForm.value).toEqual({
        name: '',
        email: '',
        phone: '',
        country: '',
        nit: '',
        address: '',
      });
    });
  });

  describe('onCancel', () => {
    it('should navigate to home', () => {
      component.onCancel();
      expect(mockRouter.navigate).toHaveBeenCalledWith(['/home']);
    });
  });
});
