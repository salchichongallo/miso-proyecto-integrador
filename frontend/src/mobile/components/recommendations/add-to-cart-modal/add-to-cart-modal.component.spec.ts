import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ModalController } from '@ionic/angular/standalone';
import { TranslateModule } from '@ngx-translate/core';

import { AddToCartModalComponent } from './add-to-cart-modal.component';
import { Product } from '@mobile/models/product.model';

describe('AddToCartModalComponent', () => {
  let component: AddToCartModalComponent;
  let fixture: ComponentFixture<AddToCartModalComponent>;
  let modalControllerMock: { dismiss: jest.Mock };

  const mockProduct: Product = {
    id: 'P-001',
    provider_nit: '123456789',
    product_type: 'medication',
    storage_conditions: 'Cool and dry',
    temperature_required: 20,
    name: 'Test Product',
    batch: 'BATCH-001',
    unit_value: 250,
    created_at: '2025-01-15T10:00:00Z',
    sku: 'SKU-001',
    stock: 100,
    expiration_date: '2026-01-15',
    status: 'active',
    updated_at: '2025-01-15T10:00:00Z',
    warehouse: 'WH-001',
    warehouse_name: 'Main Warehouse',
    warehouse_address: '123 Main St',
    warehouse_city: 'Bogotá',
    warehouse_country: 'Colombia',
  };

  beforeEach(async () => {
    modalControllerMock = {
      dismiss: jest.fn(),
    };

    await TestBed.configureTestingModule({
      imports: [AddToCartModalComponent, TranslateModule.forRoot()],
      providers: [{ provide: ModalController, useValue: modalControllerMock }],
    }).compileComponents();

    fixture = TestBed.createComponent(AddToCartModalComponent);
    component = fixture.componentInstance;
    component.product = mockProduct;
    fixture.detectChanges();
  });

  it('should initialize with quantity 1', () => {
    expect(component.quantityControl?.value).toBe(1);
  });

  it('should call dismiss with cancel role when cancel is called', () => {
    component.cancel();
    expect(modalControllerMock.dismiss).toHaveBeenCalledWith(null, 'cancel');
  });

  it('should call dismiss with quantity when confirm is called with valid form', () => {
    component.quantityControl?.setValue(5);
    component.confirm();
    expect(modalControllerMock.dismiss).toHaveBeenCalledWith({ quantity: 5 }, 'confirm');
  });

  it('should not dismiss when form is invalid', () => {
    component.quantityControl?.setValue(0);
    component.confirm();
    expect(modalControllerMock.dismiss).not.toHaveBeenCalled();
  });

  it('should set error when quantity exceeds stock', () => {
    component.quantityControl?.setValue(150);
    component.confirm();
    expect(component.quantityControl?.hasError('max')).toBe(true);
    expect(modalControllerMock.dismiss).not.toHaveBeenCalled();
  });

  it('should return correct maxQuantity', () => {
    expect(component.maxQuantity).toBe(100);
  });
});
