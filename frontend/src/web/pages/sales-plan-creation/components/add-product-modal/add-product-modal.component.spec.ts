import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ModalController } from '@ionic/angular/standalone';

import { AddProductModalComponent } from './add-product-modal.component';
import { Product } from '@mobile/models/product.model';

describe('AddProductModalComponent', () => {
  let component: AddProductModalComponent;
  let fixture: ComponentFixture<AddProductModalComponent>;
  let modalControllerMock: { dismiss: jest.Mock };

  const mockProducts: Product[] = [
    {
      id: 'P-001',
      provider_nit: '123456789',
      product_type: 'medication',
      storage_conditions: 'Cool and dry',
      temperature_required: 20,
      name: 'Smartwatch X',
      batch: 'BATCH-001',
      unit_value: 250,
      created_at: '2025-01-15T10:00:00Z',
      sku: 'SKU-001',
      stock: 100,
      expiration_date: '2026-01-15',
      status: 'active',
      updated_at: '2025-01-15T10:00:00Z',
      warehouse: 'WH-001',
      warehouse_name: 'Central Warehouse',
      warehouse_address: '123 Main St',
      warehouse_city: 'New York',
      warehouse_country: 'USA',
    },
    {
      id: 'P-002',
      provider_nit: '987654321',
      product_type: 'equipment',
      storage_conditions: 'Room temperature',
      temperature_required: 25,
      name: 'Smartband Pro',
      batch: 'BATCH-002',
      unit_value: 75,
      created_at: '2025-01-15T10:00:00Z',
      sku: 'SKU-002',
      stock: 200,
      expiration_date: '2026-06-15',
      status: 'active',
      updated_at: '2025-01-15T10:00:00Z',
      warehouse: 'WH-002',
      warehouse_name: 'East Warehouse',
      warehouse_address: '456 East Ave',
      warehouse_city: 'Boston',
      warehouse_country: 'USA',
    },
  ];

  beforeEach(async () => {
    modalControllerMock = {
      dismiss: jest.fn(),
    };

    await TestBed.configureTestingModule({
      imports: [AddProductModalComponent],
      providers: [{ provide: ModalController, useValue: modalControllerMock }],
    }).compileComponents();

    fixture = TestBed.createComponent(AddProductModalComponent);
    component = fixture.componentInstance;
    component.products = mockProducts;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  describe('Form initialization', () => {
    it('should initialize form with empty fields', () => {
      expect(component.productForm).toBeDefined();
      expect(component.productForm.get('product_id')?.value).toBe('');
      expect(component.productForm.get('target_units')?.value).toBe('');
      expect(component.productForm.get('target_value')?.value).toBe('');
    });

    it('should have required validator on product_id field', () => {
      const productIdControl = component.productForm.get('product_id');
      productIdControl?.setValue('');
      expect(productIdControl?.hasError('required')).toBe(true);

      productIdControl?.setValue('P-001');
      expect(productIdControl?.valid).toBe(true);
    });

    it('should have required validator on target_units field', () => {
      const targetUnitsControl = component.productForm.get('target_units');
      targetUnitsControl?.setValue('');
      expect(targetUnitsControl?.hasError('required')).toBe(true);

      targetUnitsControl?.setValue('100');
      expect(targetUnitsControl?.valid).toBe(true);
    });

    it('should have required validator on target_value field', () => {
      const targetValueControl = component.productForm.get('target_value');
      targetValueControl?.setValue('');
      expect(targetValueControl?.hasError('required')).toBe(true);

      targetValueControl?.setValue('25000');
      expect(targetValueControl?.valid).toBe(true);
    });

    it('should validate positive integer for target_units', () => {
      const targetUnitsControl = component.productForm.get('target_units');

      targetUnitsControl?.setValue('0');
      expect(targetUnitsControl?.hasError('positiveInteger')).toBe(true);

      targetUnitsControl?.setValue('-5');
      expect(targetUnitsControl?.hasError('positiveInteger')).toBe(true);

      targetUnitsControl?.setValue('10.5');
      expect(targetUnitsControl?.hasError('positiveInteger')).toBe(true);

      targetUnitsControl?.setValue('100');
      expect(targetUnitsControl?.valid).toBe(true);
    });

    it('should validate positive number for target_value', () => {
      const targetValueControl = component.productForm.get('target_value');

      targetValueControl?.setValue('-100');
      expect(targetValueControl?.hasError('positiveNumber')).toBe(true);

      targetValueControl?.setValue('0');
      expect(targetValueControl?.valid).toBe(true);

      targetValueControl?.setValue('25000.50');
      expect(targetValueControl?.valid).toBe(true);
    });
  });

  describe('Form control getters', () => {
    it('should return productIdControl', () => {
      expect(component.productIdControl).toBe(component.productForm.get('product_id'));
    });

    it('should return targetUnitsControl', () => {
      expect(component.targetUnitsControl).toBe(component.productForm.get('target_units'));
    });

    it('should return targetValueControl', () => {
      expect(component.targetValueControl).toBe(component.productForm.get('target_value'));
    });
  });

  describe('cancel', () => {
    it('should dismiss modal with cancel role', () => {
      component.cancel();

      expect(modalControllerMock.dismiss).toHaveBeenCalledWith(null, 'cancel');
    });
  });

  describe('confirm', () => {
    it('should dismiss modal with product data when form is valid', () => {
      component.productForm.patchValue({
        product_id: 'P-001',
        target_units: '100',
        target_value: '25000',
      });

      component.confirm();

      expect(modalControllerMock.dismiss).toHaveBeenCalledWith(
        {
          id: '',
          product_id: 'P-001',
          name: 'Smartwatch X',
          target_units: 100,
          target_value: 25000,
        },
        'confirm',
      );
    });

    it('should mark form as touched when invalid', () => {
      const markAllAsTouchedSpy = jest.spyOn(component.productForm, 'markAllAsTouched');

      component.confirm();

      expect(markAllAsTouchedSpy).toHaveBeenCalled();
      expect(modalControllerMock.dismiss).not.toHaveBeenCalled();
    });

    it('should not dismiss modal when form is invalid', () => {
      component.productForm.patchValue({
        product_id: '',
        target_units: '',
        target_value: '',
      });

      component.confirm();

      expect(modalControllerMock.dismiss).not.toHaveBeenCalled();
    });

    it('should not dismiss modal when product not found', () => {
      component.productForm.patchValue({
        product_id: 'NON-EXISTENT',
        target_units: '100',
        target_value: '25000',
      });

      component.confirm();

      expect(modalControllerMock.dismiss).not.toHaveBeenCalled();
    });

    it('should convert target_units and target_value to numbers', () => {
      component.productForm.patchValue({
        product_id: 'P-002',
        target_units: '200',
        target_value: '15000.50',
      });

      component.confirm();

      const dismissCall = modalControllerMock.dismiss.mock.calls[0][0];
      expect(typeof dismissCall.target_units).toBe('number');
      expect(typeof dismissCall.target_value).toBe('number');
      expect(dismissCall.target_units).toBe(200);
      expect(dismissCall.target_value).toBe(15000.5);
    });
  });
});
