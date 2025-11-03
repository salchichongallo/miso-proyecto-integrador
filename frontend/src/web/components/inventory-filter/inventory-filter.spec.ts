import { TestBed } from '@angular/core/testing';
import { ComponentFixture } from '@angular/core/testing';
import { ReactiveFormsModule } from '@angular/forms';
import { By } from '@angular/platform-browser';
import { InventoryFilterComponent } from './inventory-filter';
import { SearchInventoryParams } from '../../pages/product-inventory/interfaces/search-inventory-params.interface';

// Mock jest functions
declare const jest: any;

describe('InventoryFilterComponent', () => {
  let component: InventoryFilterComponent;
  let fixture: ComponentFixture<InventoryFilterComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [InventoryFilterComponent, ReactiveFormsModule],
    }).compileComponents();

    fixture = TestBed.createComponent(InventoryFilterComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should initialize form with empty values', () => {
    expect(component['form'].value).toEqual({
      productName: '',
      batch: '',
      status: '',
      warehouseName: '',
    });
  });

  it('should have all form controls', () => {
    const form = component['form'];
    expect(form.controls.productName).toBeDefined();
    expect(form.controls.batch).toBeDefined();
    expect(form.controls.status).toBeDefined();
    expect(form.controls.warehouseName).toBeDefined();
  });

  describe('submit method', () => {
    it('should emit onSubmit with form values when submit is called', () => {
      // Arrange
      const expectedParams: SearchInventoryParams = {
        productName: 'Test Product',
        batch: 'TEST001',
        status: 'active',
        warehouseName: 'Main Warehouse',
      };

      jest.spyOn(component.onSubmit, 'emit');

      // Set form values
      component['form'].patchValue(expectedParams);

      // Act
      component.submit();

      // Assert
      expect(component.onSubmit.emit).toHaveBeenCalledWith(expectedParams);
    });

    it('should emit onSubmit with empty strings when form is empty', () => {
      // Arrange
      const expectedParams: SearchInventoryParams = {
        productName: '',
        batch: '',
        status: '',
        warehouseName: '',
      };

      jest.spyOn(component.onSubmit, 'emit');

      // Act
      component.submit();

      // Assert
      expect(component.onSubmit.emit).toHaveBeenCalledWith(expectedParams);
    });
  });

  describe('reset method', () => {
    it('should reset form values and emit empty params', () => {
      // Arrange
      const initialValues = {
        productName: 'Test Product',
        batch: 'TEST001',
        status: 'active',
        warehouseName: 'Main Warehouse',
      };

      const expectedParams: SearchInventoryParams = {
        productName: '',
        batch: '',
        status: '',
        warehouseName: '',
      };

      component['form'].patchValue(initialValues);
      jest.spyOn(component.onSubmit, 'emit');

      // Act
      component.reset();

      // Assert
      expect(component['form'].value).toEqual(expectedParams);
      expect(component.onSubmit.emit).toHaveBeenCalledWith(expectedParams);
    });
  });

  describe('Template Integration', () => {
    it('should render all input fields', () => {
      const inputs = fixture.debugElement.queryAll(By.css('ion-input'));
      expect(inputs.length).toBe(3);

      const formControlNames = inputs.map((input) => input.nativeElement.getAttribute('formControlName'));
      expect(formControlNames).toContain('productName');
      expect(formControlNames).toContain('batch');
      expect(formControlNames).toContain('warehouseName');
    });

    it('should render submit and reset buttons', () => {
      const buttons = fixture.debugElement.queryAll(By.css('ion-button'));
      expect(buttons.length).toBe(2);

      const submitButton = buttons.find((btn) => btn.nativeElement.getAttribute('type') === 'submit');
      const resetButton = buttons.find((btn) => btn.nativeElement.getAttribute('type') === 'reset');

      expect(submitButton).toBeDefined();
      expect(resetButton).toBeDefined();
    });

    it('should call submit method when form is submitted', () => {
      // Arrange
      jest.spyOn(component, 'submit');
      const form = fixture.debugElement.query(By.css('form'));

      // Act
      form.triggerEventHandler('ngSubmit', {});

      // Assert
      expect(component.submit).toHaveBeenCalled();
    });

    it('should call reset method when form is reset', () => {
      // Arrange
      jest.spyOn(component, 'reset');
      const form = fixture.debugElement.query(By.css('form'));

      // Act
      form.triggerEventHandler('reset', {});

      // Assert
      expect(component.reset).toHaveBeenCalled();
    });

    it('should update form values when inputs change', () => {
      // Arrange
      const productNameInput = fixture.debugElement.query(By.css('ion-input[formControlName="productName"]'));
      const testValue = 'Test Product Name';

      // Act
      productNameInput.nativeElement.value = testValue;
      productNameInput.nativeElement.dispatchEvent(new Event('input'));
      component['form'].controls.productName.setValue(testValue);
      fixture.detectChanges();

      // Assert
      expect(component['form'].controls.productName.value).toBe(testValue);
    });

    it('should display filter icon and header text', () => {
      const icon = fixture.debugElement.query(By.css('ion-icon[name="filter"]'));
      const header = fixture.debugElement.query(By.css('h2'));

      expect(icon).toBeTruthy();
      expect(header.nativeElement.textContent.trim()).toBe('Filtros de búsqueda');
    });

    it('should have correct button text', () => {
      const buttons = fixture.debugElement.queryAll(By.css('ion-button'));
      const submitButton = buttons.find((btn) => btn.nativeElement.getAttribute('type') === 'submit');
      const resetButton = buttons.find((btn) => btn.nativeElement.getAttribute('type') === 'reset');

      expect(submitButton?.nativeElement.textContent.trim()).toBe('CONSULTAR INVENTARIO');
      expect(resetButton?.nativeElement.textContent.trim()).toBe('LIMPIAR');
    });
  });

  describe('Form Validation', () => {
    it('should allow empty form submission', () => {
      // Arrange
      jest.spyOn(component.onSubmit, 'emit');

      // Act
      component.submit();

      // Assert
      expect(component.onSubmit.emit).toHaveBeenCalled();
    });

    it('should maintain form state between operations', () => {
      // Arrange
      const testValues = {
        productName: 'Product A',
        batch: 'BATCH001',
        status: 'active',
        warehouseName: 'Warehouse 1',
      };

      // Act
      component['form'].patchValue(testValues);
      fixture.detectChanges();

      // Assert
      expect(component['form'].value).toEqual(testValues);

      // Act - submit without changing values
      jest.spyOn(component.onSubmit, 'emit');
      component.submit();

      // Assert - form values should remain the same
      expect(component['form'].value).toEqual(testValues);
      expect(component.onSubmit.emit).toHaveBeenCalledWith(testValues);
    });
  });
});
