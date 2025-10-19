import { ComponentFixture, TestBed, fakeAsync, tick } from '@angular/core/testing';
import { Router } from '@angular/router';
import { LoadingController, ToastController } from '@ionic/angular/standalone';
import { of, throwError } from 'rxjs';

import { ProductRegistrationPage } from './product-registration.page';
import { ProductService } from '@web/services/product/product.service';
import { RegisterProductResponse } from './interfaces/register-product-response.interface';

describe('ProductRegistrationPage', () => {
  let component: ProductRegistrationPage;
  let fixture: ComponentFixture<ProductRegistrationPage>;
  let mockRouter: jest.Mocked<Pick<Router, 'navigate'>>;
  let mockProductService: jest.Mocked<Pick<ProductService, 'createProduct'>>;
  let mockLoadingController: jest.Mocked<Pick<LoadingController, 'create' | 'dismiss'>>;
  let mockToastController: jest.Mocked<Pick<ToastController, 'create'>>;

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
    const mockLoading = {
      present: jest.fn().mockResolvedValue(undefined),
      dismiss: jest.fn().mockResolvedValue(undefined),
    };

    const mockToast = {
      present: jest.fn().mockResolvedValue(undefined),
    };

    mockRouter = {
      navigate: jest.fn(),
    };

    mockProductService = {
      createProduct: jest.fn(),
    };

    mockLoadingController = {
      create: jest.fn().mockResolvedValue(mockLoading),
      dismiss: jest.fn().mockResolvedValue(undefined),
    };

    mockToastController = {
      create: jest.fn().mockResolvedValue(mockToast),
    };

    await TestBed.configureTestingModule({
      imports: [ProductRegistrationPage],
      providers: [
        { provide: Router, useValue: mockRouter },
        { provide: ProductService, useValue: mockProductService },
        { provide: LoadingController, useValue: mockLoadingController },
        { provide: ToastController, useValue: mockToastController },
      ],
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
        providerNit: '123456789-1',
        productType: 'medication',
        stock: 100,
        lot: 'LOT-2024-001',
        state: 'Disponible',
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

    it('should require providerNit field', () => {
      component.productForm.patchValue({ providerNit: '' });
      expect(component.providerNitControl?.hasError('required')).toBe(true);
    });

    it('should invalidate form with invalid providerNit format', () => {
      component.productForm.patchValue({ providerNit: 'ABC123' });
      expect(component.providerNitControl?.hasError('pattern')).toBe(true);
    });

    it('should accept valid providerNit format', () => {
      component.productForm.patchValue({ providerNit: '123456789-1' });
      expect(component.providerNitControl?.hasError('pattern')).toBeFalsy();
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
      // Use the same logic as the validator to get today's date
      const today = new Date();
      const todayString = `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, '0')}-${String(today.getDate()).padStart(2, '0')}`;
      component.productForm.patchValue({ expirationDate: todayString });
      expect(component.expirationDateControl?.hasError('futureDate')).toBe(true);
    });

    it('should accept future date as expiration date', () => {
      component.productForm.patchValue({ expirationDate: getTomorrowDate() });
      expect(component.expirationDateControl?.hasError('futureDate')).toBe(false);
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

    it('should have providerNitControl', () => {
      expect(component.providerNitControl).toBeTruthy();
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
      const availableState = component.productStates.find((s) => s.value === 'Disponible');
      expect(availableState).toBeDefined();
      expect(availableState?.label).toBe('Disponible');
    });
  });

  describe('onSubmit', () => {
    it('should not submit when form is invalid', () => {
      const markAllAsTouchedSpy = jest.spyOn(component.productForm, 'markAllAsTouched');
      component.onSubmit();
      expect(markAllAsTouchedSpy).toHaveBeenCalled();
      expect(mockProductService.createProduct).not.toHaveBeenCalled();
    });

    it('should submit when form is valid and handle success', async () => {
      const validData = {
        name: 'Paracetamol 500mg',
        providerNit: '123456789-1',
        productType: 'medication',
        stock: 100,
        lot: 'LOT-2024-001',
        state: 'Disponible',
        expirationDate: getTomorrowDate(),
        requiredTemperature: 25,
        unitValue: 5.50,
        storageConditions: 'Mantener en lugar fresco y seco',
      };

      const mockResponse: RegisterProductResponse = {
        message: 'Producto registrado exitosamente',
        sku: 'SKU-12345',
      };

      mockProductService.createProduct.mockReturnValue(of(mockResponse));
      component.productForm.patchValue(validData);

      component.onSubmit();

      await new Promise(resolve => setTimeout(resolve, 100));

      expect(mockProductService.createProduct).toHaveBeenCalledWith({
        name: validData.name,
        provider_nit: validData.providerNit,
        product_type: validData.productType,
        stock: validData.stock,
        expiration_date: validData.expirationDate,
        temperature_required: validData.requiredTemperature,
        batch: validData.lot,
        status: validData.state,
        unit_value: validData.unitValue,
        storage_conditions: validData.storageConditions,
      });
      expect(mockLoadingController.create).toHaveBeenCalled();
    });

    it('should handle submission error', async () => {
      const validData = {
        name: 'Paracetamol 500mg',
        providerNit: '123456789-1',
        productType: 'medication',
        stock: 100,
        lot: 'LOT-2024-001',
        state: 'Disponible',
        expirationDate: getTomorrowDate(),
        requiredTemperature: 25,
        unitValue: 5.50,
        storageConditions: 'Mantener en lugar fresco y seco',
      };

      const mockError = {
        error: { message: 'Error al registrar el producto' },
        message: 'HTTP Error',
      };

      mockProductService.createProduct.mockReturnValue(throwError(() => mockError));
      component.productForm.patchValue(validData);

      component.onSubmit();

      await new Promise(resolve => setTimeout(resolve, 100));

      expect(mockProductService.createProduct).toHaveBeenCalled();
      expect(mockLoadingController.create).toHaveBeenCalled();
    });
  });

  describe('onCancel', () => {
    it('should reset form and navigate to home', () => {
      const resetSpy = jest.spyOn(component.productForm, 'reset');
      component.onCancel();
      expect(resetSpy).toHaveBeenCalled();
      expect(mockRouter.navigate).toHaveBeenCalledWith(['/home']);
    });
  });
});
