import { ComponentFixture, TestBed } from '@angular/core/testing';
import { Router } from '@angular/router';

import { ProductRegistrationPage } from './product-registration.page';

describe('ProductRegistrationPage', () => {
  let component: ProductRegistrationPage;
  let fixture: ComponentFixture<ProductRegistrationPage>;
  let mockRouter: jest.Mocked<Pick<Router, 'navigate'>>;

  // Helper function to get tomorrow's date
  const getTomorrowDate = (): string => {
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    return tomorrow.toISOString().split('T')[0];
  };

  // Helper function to get yesterday's date
  const getYesterdayDate = (): string => {
    const yesterday = new Date();
    yesterday.setDate(yesterday.getDate() - 1);
    return yesterday.toISOString().split('T')[0];
  };

  beforeEach(async () => {
    mockRouter = {
      navigate: jest.fn(),
    };

    await TestBed.configureTestingModule({
      imports: [ProductRegistrationPage],
      providers: [{ provide: Router, useValue: mockRouter }],
    }).compileComponents();

    fixture = TestBed.createComponent(ProductRegistrationPage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  describe('Form Validation', () => {
    it('should have invalid form when empty', () => {
      expect(component.productForm.invalid).toBe(true);
    });

    it('should have valid form when all fields are filled correctly', () => {
      component.productForm.patchValue({
        name: 'Paracetamol 500mg',
        productType: 'medication',
        stock: 100,
        lot: 'LOT-2024-001',
        state: 'available',
        expirationDate: getTomorrowDate(),
        requiredTemperature: 25,
        unitValue: 5.50,
        storageConditions: 'Mantener en lugar fresco y seco',
      });
      expect(component.productForm.valid).toBe(true);
    });

    it('should invalidate form with short name', () => {
      component.productForm.patchValue({ name: 'AB' });
      expect(component.nameControl?.hasError('minlength')).toBe(true);
    });

    it('should invalidate form with zero stock', () => {
      component.productForm.patchValue({ stock: 0 });
      expect(component.stockControl?.hasError('positiveInteger')).toBe(true);
    });

    it('should invalidate form with negative stock', () => {
      component.productForm.patchValue({ stock: -1 });
      expect(component.stockControl?.hasError('positiveInteger')).toBe(true);
    });

    it('should invalidate form with decimal stock', () => {
      component.productForm.patchValue({ stock: 10.5 });
      expect(component.stockControl?.hasError('positiveInteger')).toBe(true);
    });

    it('should accept positive integer as valid stock', () => {
      component.productForm.patchValue({ stock: 100 });
      expect(component.stockControl?.hasError('positiveInteger')).toBeFalsy();
    });

    it('should invalidate form with past expiration date', () => {
      component.productForm.patchValue({ expirationDate: getYesterdayDate() });
      expect(component.expirationDateControl?.hasError('futureDate')).toBe(true);
    });

    it('should invalidate form with today as expiration date', () => {
      const today = new Date().toISOString().split('T')[0];
      component.productForm.patchValue({ expirationDate: today });
      expect(component.expirationDateControl?.hasError('futureDate')).toBe(true);
    });

    it('should accept future date as expiration date', () => {
      component.productForm.patchValue({ expirationDate: getTomorrowDate() });
      expect(component.expirationDateControl?.hasError('futureDate')).toBeFalsy();
    });

    it('should require minimum length for lot', () => {
      component.productForm.patchValue({ lot: 'AB' });
      expect(component.lotControl?.hasError('minlength')).toBe(true);
    });

    it('should require minimum length for storage conditions', () => {
      component.productForm.patchValue({ storageConditions: 'Short' });
      expect(component.storageConditionsControl?.hasError('minlength')).toBe(true);
    });

    it('should accept valid storage conditions', () => {
      component.productForm.patchValue({ storageConditions: 'Mantener en lugar fresco' });
      expect(component.storageConditionsControl?.hasError('minlength')).toBeFalsy();
    });
  });

  describe('Form Controls', () => {
    it('should have nameControl', () => {
      expect(component.nameControl).toBeTruthy();
    });

    it('should have productTypeControl', () => {
      expect(component.productTypeControl).toBeTruthy();
    });

    it('should have stockControl', () => {
      expect(component.stockControl).toBeTruthy();
    });

    it('should have lotControl', () => {
      expect(component.lotControl).toBeTruthy();
    });

    it('should have stateControl', () => {
      expect(component.stateControl).toBeTruthy();
    });

    it('should have expirationDateControl', () => {
      expect(component.expirationDateControl).toBeTruthy();
    });

    it('should have requiredTemperatureControl', () => {
      expect(component.requiredTemperatureControl).toBeTruthy();
    });

    it('should have unitValueControl', () => {
      expect(component.unitValueControl).toBeTruthy();
    });

    it('should have storageConditionsControl', () => {
      expect(component.storageConditionsControl).toBeTruthy();
    });
  });

  describe('Product Types', () => {
    it('should have product types defined', () => {
      expect(component.productTypes).toBeDefined();
      expect(component.productTypes.length).toBeGreaterThan(0);
    });

    it('should include medication type', () => {
      const medicationType = component.productTypes.find((t) => t.value === 'medication');
      expect(medicationType).toBeDefined();
      expect(medicationType?.label).toBe('Medicamento');
    });
  });

  describe('Product States', () => {
    it('should have product states defined', () => {
      expect(component.productStates).toBeDefined();
      expect(component.productStates.length).toBeGreaterThan(0);
    });

    it('should include available state', () => {
      const availableState = component.productStates.find((s) => s.value === 'available');
      expect(availableState).toBeDefined();
      expect(availableState?.label).toBe('Disponible');
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
      const validData = {
        name: 'Paracetamol 500mg',
        productType: 'medication',
        stock: 100,
        lot: 'LOT-2024-001',
        state: 'available',
        expirationDate: getTomorrowDate(),
        requiredTemperature: 25,
        unitValue: 5.50,
        storageConditions: 'Mantener en lugar fresco y seco',
      };

      component.productForm.patchValue(validData);
      component.onSubmit();

      expect(consoleSpy).toHaveBeenCalledWith('Product registration data:', validData);
      expect(mockRouter.navigate).toHaveBeenCalledWith(['/home']);
      consoleSpy.mockRestore();
    });

    it('should reset form after successful submission', () => {
      component.productForm.patchValue({
        name: 'Paracetamol 500mg',
        productType: 'medication',
        stock: 100,
        lot: 'LOT-2024-001',
        state: 'available',
        expirationDate: getTomorrowDate(),
        requiredTemperature: 25,
        unitValue: 5.50,
        storageConditions: 'Mantener en lugar fresco y seco',
      });

      component.onSubmit();

      expect(component.productForm.value).toEqual({
        name: '',
        productType: '',
        stock: null,
        lot: '',
        state: '',
        expirationDate: '',
        requiredTemperature: null,
        unitValue: null,
        storageConditions: '',
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
