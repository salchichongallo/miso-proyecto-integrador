import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ReactiveFormsModule } from '@angular/forms';
import { HttpErrorResponse } from '@angular/common/http';
import { LoadingController, ModalController, ToastController } from '@ionic/angular/standalone';
import { of, throwError } from 'rxjs';

import { SalesPlanCreationPage } from './sales-plan-creation.page';
import { SalesPlanService } from '@web/services/sales-plan/sales-plan.service';
import { SellerService } from '@web/services/seller/seller.service';
import { ProductService } from '@web/services/product/product.service';
import { AddProductModalComponent } from './components/add-product-modal/add-product-modal.component';
import { CreateSalesPlanResponse } from './interfaces/create-sales-plan-response.interface';
import { Vendor } from '@web/services/seller/interfaces/vendor.interface';
import { Product } from '@mobile/models/product.model';

describe('SalesPlanCreationPage', () => {
  let component: SalesPlanCreationPage;
  let fixture: ComponentFixture<SalesPlanCreationPage>;
  let salesPlanService: { createSalesPlan: jest.Mock };
  let sellerService: { getVendors: jest.Mock };
  let productService: { getProducts: jest.Mock };
  let modalController: { create: jest.Mock };
  let loadingController: { create: jest.Mock; dismiss: jest.Mock };
  let toastController: { create: jest.Mock };

  const mockLoading = {
    present: jest.fn().mockResolvedValue(undefined),
    dismiss: jest.fn().mockResolvedValue(true),
  };

  const mockToast = {
    present: jest.fn().mockResolvedValue(undefined),
  };

  const mockVendors: Vendor[] = [
    {
      vendor_id: 'VENDOR-001',
      name: 'John Doe',
      email: 'john@example.com',
      institutions: ['inst-1', 'inst-2'],
      created_at: '2025-01-15T10:00:00Z',
      updated_at: '2025-01-15T10:00:00Z',
    },
    {
      vendor_id: 'VENDOR-002',
      name: 'Jane Smith',
      email: 'jane@example.com',
      institutions: ['inst-3'],
      created_at: '2025-01-15T10:00:00Z',
      updated_at: '2025-01-15T10:00:00Z',
    },
  ];

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
  ];

  beforeEach(async () => {
    const salesPlanServiceMock = {
      createSalesPlan: jest.fn(),
    };

    const sellerServiceMock = {
      getVendors: jest.fn().mockReturnValue(of(mockVendors)),
    };

    const productServiceMock = {
      getProducts: jest.fn().mockReturnValue(of(mockProducts)),
    };

    const modalControllerMock = {
      create: jest.fn(),
    };

    const loadingControllerMock = {
      create: jest.fn().mockResolvedValue(mockLoading),
      dismiss: jest.fn().mockResolvedValue(true),
    };

    const toastControllerMock = {
      create: jest.fn().mockResolvedValue(mockToast),
    };

    await TestBed.configureTestingModule({
      imports: [SalesPlanCreationPage],
      providers: [
        { provide: SalesPlanService, useValue: salesPlanServiceMock },
        { provide: SellerService, useValue: sellerServiceMock },
        { provide: ProductService, useValue: productServiceMock },
        { provide: ModalController, useValue: modalControllerMock },
        { provide: LoadingController, useValue: loadingControllerMock },
        { provide: ToastController, useValue: toastControllerMock },
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(SalesPlanCreationPage);
    component = fixture.componentInstance;
    salesPlanService = salesPlanServiceMock;
    sellerService = sellerServiceMock;
    productService = productServiceMock;
    modalController = modalControllerMock;
    loadingController = loadingControllerMock;
    toastController = toastControllerMock;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  describe('Form initialization', () => {
    it('should initialize form with empty fields', () => {
      expect(component.salesPlanForm.get('vendor_id')?.value).toBe('');
      expect(component.salesPlanForm.get('period')?.value).toBe('');
      expect(component.salesPlanForm.get('region')?.value).toBe('');
    });

    it('should have validators on vendor_id field', () => {
      const vendorControl = component.salesPlanForm.get('vendor_id');
      vendorControl?.setValue('');
      expect(vendorControl?.hasError('required')).toBe(true);

      vendorControl?.setValue('VENDOR-001');
      expect(vendorControl?.valid).toBe(true);
    });

    it('should have validators on period field', () => {
      const periodControl = component.salesPlanForm.get('period');
      periodControl?.setValue('');
      expect(periodControl?.hasError('required')).toBe(true);

      periodControl?.setValue('Q1');
      expect(periodControl?.hasError('minlength')).toBe(true);

      periodControl?.setValue('Q1-2025');
      expect(periodControl?.valid).toBe(true);
    });

    it('should have validators on region field', () => {
      const regionControl = component.salesPlanForm.get('region');
      regionControl?.setValue('');
      expect(regionControl?.hasError('required')).toBe(true);

      regionControl?.setValue('North America');
      expect(regionControl?.valid).toBe(true);
    });
  });

  describe('ngOnInit', () => {
    it('should load vendors and products on init', () => {
      expect(sellerService.getVendors).toHaveBeenCalled();
      expect(productService.getProducts).toHaveBeenCalled();
      expect(component.vendors).toEqual(mockVendors);
      expect(component.products).toEqual(mockProducts);
    });

    it('should handle error when loading vendors fails', () => {
      const mockError = new HttpErrorResponse({
        error: { error: 'Failed to load vendors' },
        status: 500,
      });

      sellerService.getVendors.mockReturnValue(throwError(() => mockError));

      component.ngOnInit();

      expect(toastController.create).toHaveBeenCalledWith({
        message: 'Failed to load vendors',
        duration: 3000,
        position: 'top',
        color: 'danger',
      });
    });

    it('should handle error when loading products fails', () => {
      const mockError = new HttpErrorResponse({
        error: { error: 'Failed to load products' },
        status: 500,
      });

      productService.getProducts.mockReturnValue(throwError(() => mockError));

      component.ngOnInit();

      expect(toastController.create).toHaveBeenCalledWith({
        message: 'Failed to load products',
        duration: 3000,
        position: 'top',
        color: 'danger',
      });
    });
  });

  describe('Form control getters', () => {
    it('should return vendorControl', () => {
      expect(component.vendorControl).toBe(component.salesPlanForm.get('vendor_id'));
    });

    it('should return periodControl', () => {
      expect(component.periodControl).toBe(component.salesPlanForm.get('period'));
    });

    it('should return regionControl', () => {
      expect(component.regionControl).toBe(component.salesPlanForm.get('region'));
    });
  });

  describe('onCancel', () => {
    it('should reset form and clear selected products', () => {
      component.salesPlanForm.patchValue({
        vendor_id: 'VENDOR-001',
        period: 'Q1-2025',
        region: 'North America',
      });
      component.selectedProducts = [
        {
          id: '1',
          product_id: 'P-001',
          name: 'Product 1',
          target_units: 100,
          target_value: 25000,
        },
      ];

      component.onCancel();

      expect(component.salesPlanForm.get('vendor_id')?.value).toBeNull();
      expect(component.salesPlanForm.get('period')?.value).toBeNull();
      expect(component.salesPlanForm.get('region')?.value).toBeNull();
      expect(component.selectedProducts).toEqual([]);
    });
  });

  describe('onSubmit', () => {
    it('should mark form as touched when invalid', () => {
      const markAllAsTouchedSpy = jest.spyOn(component.salesPlanForm, 'markAllAsTouched');

      component.onSubmit();

      expect(markAllAsTouchedSpy).toHaveBeenCalled();
      expect(salesPlanService.createSalesPlan).not.toHaveBeenCalled();
    });

    it('should show error when no products selected', () => {
      component.salesPlanForm.patchValue({
        vendor_id: 'VENDOR-001',
        period: 'Q1-2025',
        region: 'North America',
      });

      component.onSubmit();

      expect(toastController.create).toHaveBeenCalledWith({
        message: 'Debe agregar al menos un producto al plan de venta',
        duration: 3000,
        position: 'top',
        color: 'danger',
      });
    });

    it('should call createSalesPlan when form is valid and products selected', async () => {
      const mockResponse: CreateSalesPlanResponse = {
        message: 'Sales Plan successfully created.',
        plan: {
          plan_id: 'PLAN-001',
          vendor_id: 'VENDOR-001',
          period: 'Q1-2025',
          region: 'North America',
          products: [
            {
              product_id: 'P-001',
              name: 'Product 1',
              target_units: 100,
              target_value: 25000,
            },
          ],
          created_at: '2025-01-15T10:00:00Z',
          updated_at: '2025-01-15T10:00:00Z',
        },
      };

      salesPlanService.createSalesPlan.mockReturnValue(of(mockResponse));

      component.salesPlanForm.patchValue({
        vendor_id: 'VENDOR-001',
        period: 'Q1-2025',
        region: 'North America',
      });
      component.selectedProducts = [
        {
          id: '1',
          product_id: 'P-001',
          name: 'Product 1',
          target_units: 100,
          target_value: 25000,
        },
      ];

      component.onSubmit();

      await fixture.whenStable();

      expect(salesPlanService.createSalesPlan).toHaveBeenCalled();
    });
  });

  describe('openAddProductModal', () => {
    it('should open modal and add product on confirm', async () => {
      const mockModal = {
        present: jest.fn().mockResolvedValue(undefined),
        onWillDismiss: jest.fn().mockResolvedValue({
          data: {
            id: '',
            product_id: 'P-001',
            name: 'Smartwatch X',
            target_units: 100,
            target_value: 25000,
          },
          role: 'confirm',
        }),
      };

      modalController.create.mockResolvedValue(mockModal as unknown as HTMLIonModalElement);

      await component.openAddProductModal();

      expect(modalController.create).toHaveBeenCalledWith({
        component: AddProductModalComponent,
        componentProps: {
          products: mockProducts,
        },
      });
      expect(mockModal.present).toHaveBeenCalled();
      expect(component.selectedProducts.length).toBe(1);
      expect(component.selectedProducts[0].product_id).toBe('P-001');
    });

    it('should not add product on cancel', async () => {
      const mockModal = {
        present: jest.fn().mockResolvedValue(undefined),
        onWillDismiss: jest.fn().mockResolvedValue({
          data: null,
          role: 'cancel',
        }),
      };

      modalController.create.mockResolvedValue(mockModal as unknown as HTMLIonModalElement);

      await component.openAddProductModal();

      expect(component.selectedProducts.length).toBe(0);
    });
  });

  describe('addProduct', () => {
    it('should add product to the list', () => {
      const productData = {
        id: '',
        product_id: 'P-001',
        name: 'Smartwatch X',
        target_units: 100,
        target_value: 25000,
      };

      component.addProduct(productData);

      expect(component.selectedProducts.length).toBe(1);
      expect(component.selectedProducts[0].product_id).toBe('P-001');
      expect(component.selectedProducts[0].id).toBeDefined();
    });

    it('should show error when adding duplicate product', () => {
      component.selectedProducts = [
        {
          id: '1',
          product_id: 'P-001',
          name: 'Smartwatch X',
          target_units: 100,
          target_value: 25000,
        },
      ];

      const productData = {
        id: '',
        product_id: 'P-001',
        name: 'Smartwatch X',
        target_units: 200,
        target_value: 50000,
      };

      component.addProduct(productData);

      expect(toastController.create).toHaveBeenCalledWith({
        message: 'Este producto ya ha sido agregado al plan',
        duration: 3000,
        position: 'top',
        color: 'danger',
      });
      expect(component.selectedProducts.length).toBe(1);
    });
  });

  describe('removeProduct', () => {
    it('should remove product from the list', () => {
      component.selectedProducts = [
        {
          id: '1',
          product_id: 'P-001',
          name: 'Product 1',
          target_units: 100,
          target_value: 25000,
        },
        {
          id: '2',
          product_id: 'P-002',
          name: 'Product 2',
          target_units: 200,
          target_value: 15000,
        },
      ];

      component.removeProduct('1');

      expect(component.selectedProducts.length).toBe(1);
      expect(component.selectedProducts.find((p) => p.id === '1')).toBeUndefined();
    });
  });

  describe('createSalesPlan', () => {
    beforeEach(() => {
      component.salesPlanForm.patchValue({
        vendor_id: 'VENDOR-001',
        period: 'Q1-2025',
        region: 'North America',
      });
      component.selectedProducts = [
        {
          id: '1',
          product_id: 'P-001',
          name: 'Product 1',
          target_units: 100,
          target_value: 25000,
        },
      ];
    });

    it('should show loading, call service, and show success message', async () => {
      const mockResponse: CreateSalesPlanResponse = {
        message: 'Sales Plan successfully created.',
        plan: {
          plan_id: 'PLAN-001',
          vendor_id: 'VENDOR-001',
          period: 'Q1-2025',
          region: 'North America',
          products: [
            {
              product_id: 'P-001',
              name: 'Product 1',
              target_units: 100,
              target_value: 25000,
            },
          ],
          created_at: '2025-01-15T10:00:00Z',
          updated_at: '2025-01-15T10:00:00Z',
        },
      };

      salesPlanService.createSalesPlan.mockReturnValue(of(mockResponse));

      component.onSubmit();

      await fixture.whenStable();

      expect(loadingController.create).toHaveBeenCalledWith({
        message: 'Creando plan de venta...',
      });
      expect(mockLoading.present).toHaveBeenCalled();
      expect(salesPlanService.createSalesPlan).toHaveBeenCalledWith({
        vendor_id: 'VENDOR-001',
        period: 'Q1-2025',
        region: 'North America',
        products: [
          {
            product_id: 'P-001',
            name: 'Product 1',
            target_units: 100,
            target_value: 25000,
          },
        ],
      });
      expect(loadingController.dismiss).toHaveBeenCalled();
      expect(toastController.create).toHaveBeenCalledWith({
        message: 'Plan de venta creado exitosamente.',
        duration: 3000,
        position: 'top',
      });
      expect(component.salesPlanForm.get('vendor_id')?.value).toBeNull();
      expect(component.selectedProducts).toEqual([]);
    });

    it('should handle error with error.error property', async () => {
      const mockError = new HttpErrorResponse({
        error: { error: 'Vendor already has an active plan' },
        status: 400,
        statusText: 'Bad Request',
      });

      salesPlanService.createSalesPlan.mockReturnValue(throwError(() => mockError));

      component.onSubmit();

      await fixture.whenStable();

      expect(loadingController.dismiss).toHaveBeenCalled();
      expect(toastController.create).toHaveBeenCalledWith({
        message: 'Vendor already has an active plan',
        duration: 3000,
        position: 'top',
        color: 'danger',
      });
    });

    it('should handle error with default message', async () => {
      const mockError = new HttpErrorResponse({
        error: {},
        status: 500,
        statusText: 'Internal Server Error',
        url: 'http://test.com',
      });

      salesPlanService.createSalesPlan.mockReturnValue(throwError(() => mockError));

      component.onSubmit();

      await fixture.whenStable();

      expect(toastController.create).toHaveBeenCalledWith({
        message: 'Http failure response for http://test.com: 500 Internal Server Error',
        duration: 3000,
        position: 'top',
        color: 'danger',
      });
    });
  });

  describe('regions and periods', () => {
    it('should have predefined regions', () => {
      expect(component.regions.length).toBeGreaterThan(0);
      expect(component.regions[0]).toHaveProperty('value');
      expect(component.regions[0]).toHaveProperty('label');
    });

    it('should have predefined periods', () => {
      expect(component.periods.length).toBeGreaterThan(0);
      expect(component.periods[0]).toHaveProperty('value');
      expect(component.periods[0]).toHaveProperty('label');
    });
  });
});
