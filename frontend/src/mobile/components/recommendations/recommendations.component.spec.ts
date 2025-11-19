import { TestBed } from '@angular/core/testing';
import { of } from 'rxjs';
import { ModalController, ToastController } from '@ionic/angular/standalone';

import { RecommendationsComponent } from './recommendations.component';
import { CartService } from '../../services/cart/cart.service';
import { ProductService } from '../../services/product/product.service';
import { Product } from '@mobile/models/product.model';
import { AddToCartModalComponent } from './add-to-cart-modal/add-to-cart-modal.component';

describe('RecommendationsComponent', () => {
  let component: RecommendationsComponent;
  let cartService: jest.Mocked<CartService>;
  let productService: jest.Mocked<ProductService>;
  let modalController: jest.Mocked<ModalController>;
  let toastController: jest.Mocked<ToastController>;

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

  const mockRecommendedProducts: Product[] = [
    { ...mockProduct, id: 'P-002', name: 'Recommended Product 1' },
    { ...mockProduct, id: 'P-003', name: 'Recommended Product 2' },
  ];

  beforeEach(() => {
    const cartServiceMock = {
      addToCart: jest.fn(),
    };

    const productServiceMock = {
      getProducts: jest.fn(),
    };

    const modalControllerMock = {
      create: jest.fn(),
    };

    const toastControllerMock = {
      create: jest.fn(),
    };

    TestBed.configureTestingModule({
      providers: [
        RecommendationsComponent,
        { provide: CartService, useValue: cartServiceMock },
        { provide: ProductService, useValue: productServiceMock },
        { provide: ModalController, useValue: modalControllerMock },
        { provide: ToastController, useValue: toastControllerMock },
      ],
    });

    component = TestBed.inject(RecommendationsComponent);
    cartService = TestBed.inject(CartService) as jest.Mocked<CartService>;
    productService = TestBed.inject(ProductService) as jest.Mocked<ProductService>;
    modalController = TestBed.inject(ModalController) as jest.Mocked<ModalController>;
    toastController = TestBed.inject(ToastController) as jest.Mocked<ToastController>;
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  describe('ngOnInit', () => {
    it('should load recommendations', async () => {
      component.currentProduct = mockProduct;
      productService.getProducts.mockReturnValue(of([mockProduct, ...mockRecommendedProducts]));

      await component.ngOnInit();

      expect(component.recommendedProducts().length).toBeGreaterThan(0);
    });
  });

  describe('onProductClick', () => {
    it('should prevent default and open modal', async () => {
      const event = new Event('click');
      const preventDefaultSpy = jest.spyOn(event, 'preventDefault');

      const mockModal = {
        present: jest.fn().mockResolvedValue(undefined),
        onWillDismiss: jest.fn().mockResolvedValue({
          data: { quantity: 2 },
          role: 'confirm',
        }),
      };

      modalController.create.mockResolvedValue(mockModal as any);

      const mockToast = {
        present: jest.fn().mockResolvedValue(undefined),
      };

      toastController.create.mockResolvedValue(mockToast as any);
      cartService.addToCart.mockReturnValue({ success: true, message: 'Producto agregado' });

      await component.onProductClick(event, mockProduct);

      expect(preventDefaultSpy).toHaveBeenCalled();
      expect(modalController.create).toHaveBeenCalledWith({
        component: AddToCartModalComponent,
        componentProps: {
          product: mockProduct,
        },
      });
    });
  });

  describe('addToCart', () => {
    it('should show success toast when product is added successfully', async () => {
      const mockToast = {
        present: jest.fn().mockResolvedValue(undefined),
      };

      toastController.create.mockResolvedValue(mockToast as any);
      cartService.addToCart.mockReturnValue({ success: true, message: 'Producto agregado' });

      await component['addToCart'](mockProduct, 2);

      expect(cartService.addToCart).toHaveBeenCalledWith(mockProduct, 2);
      expect(toastController.create).toHaveBeenCalledWith({
        message: 'Producto agregado',
        duration: 2500,
        position: 'bottom',
        color: 'success',
      });
      expect(mockToast.present).toHaveBeenCalled();
    });

    it('should show error toast when product cannot be added', async () => {
      const mockToast = {
        present: jest.fn().mockResolvedValue(undefined),
      };

      toastController.create.mockResolvedValue(mockToast as any);
      cartService.addToCart.mockReturnValue({ success: false, message: 'Stock insuficiente' });

      await component['addToCart'](mockProduct, 200);

      expect(toastController.create).toHaveBeenCalledWith({
        message: 'Stock insuficiente',
        duration: 2500,
        position: 'bottom',
        color: 'danger',
      });
      expect(mockToast.present).toHaveBeenCalled();
    });
  });
});
