import { TestBed } from '@angular/core/testing';

import { ProductService } from '@web/services/product/product.service';

import { ProductInventoryPage } from './product-inventory.page';

jest.mock('@web/services/product/product.service');

describe('ProductInventoryPage', () => {
  let component: ProductInventoryPage;
  let productService: jest.Mocked<ProductService>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [ProductInventoryPage, ProductService],
    });
    component = TestBed.inject(ProductInventoryPage);
    productService = TestBed.inject(ProductService) as jest.Mocked<ProductService>;
    productService.search.mockResolvedValue([]);
  });

  it('should load initial products on init', async () => {
    await component.ngOnInit();

    expect(productService.search).toHaveBeenCalledWith({
      productName: '',
      batch: '',
      status: '',
      warehouseName: '',
    });
    expect(component['products']()).toEqual([]);
    expect(component['hasProducts']()).toBe(false);
  });

  it('should handle errors when loading initial products', async () => {
    const consoleErrorSpy = jest.spyOn(console, 'error').mockImplementation(() => {});
    const toastCreateSpy = jest.spyOn(component['toast'], 'create').mockResolvedValue({
      present: jest.fn().mockResolvedValue(undefined),
    } as any);

    const error = new Error('Test error');
    productService.search.mockRejectedValueOnce(error);
    await component.ngOnInit();

    expect(consoleErrorSpy).toHaveBeenCalledWith(error);
    expect(toastCreateSpy).toHaveBeenCalledWith({
      message: `Error al consultar productos. ${error.message}`,
      duration: 7000,
      color: 'danger',
    });

    consoleErrorSpy.mockRestore();
    toastCreateSpy.mockRestore();
  });

  describe('silent refresh', () => {
    jest.useFakeTimers();

    it('should refresh products at intervals', async () => {
      await component.ngOnInit();
      expect(productService.search).toHaveBeenCalledTimes(1);

      jest.advanceTimersByTime(30000); // Advance time by 30 seconds
      await Promise.resolve(); // Wait for any pending promises
      expect(productService.search).toHaveBeenCalledTimes(2);

      jest.advanceTimersByTime(30000); // Advance time by another 30 seconds
      await Promise.resolve(); // Wait for any pending promises
      expect(productService.search).toHaveBeenCalledTimes(3);
    });
  });
});
