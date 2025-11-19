import { TestBed } from '@angular/core/testing';
import { CartService } from './cart.service';
import { Product } from '@mobile/models/product.model';

describe('CartService', () => {
  let service: CartService;

  const mockProduct1: Product = {
    id: '1',
    provider_nit: 'NIT123',
    product_type: 'Electronics',
    storage_conditions: 'Dry',
    temperature_required: 20,
    name: 'Laptop Dell',
    batch: 'BATCH001',
    unit_value: 1500,
    created_at: '2024-01-01',
    sku: 'SKU001',
    stock: 10,
    expiration_date: '2025-12-31',
    status: 'active',
    updated_at: '2024-01-01',
    warehouse: 'WH001',
    warehouse_name: 'Main Warehouse',
    warehouse_address: '123 Main St',
    warehouse_city: 'Bogota',
    warehouse_country: 'Colombia',
  };

  const mockProduct2: Product = {
    id: '2',
    provider_nit: 'NIT456',
    product_type: 'Furniture',
    storage_conditions: 'Indoor',
    temperature_required: 22,
    name: 'Office Chair',
    batch: 'BATCH002',
    unit_value: 300,
    created_at: '2024-01-02',
    sku: 'SKU002',
    stock: 25,
    expiration_date: '2026-12-31',
    status: 'active',
    updated_at: '2024-01-02',
    warehouse: 'WH002',
    warehouse_name: 'Secondary Warehouse',
    warehouse_address: '456 Second Ave',
    warehouse_city: 'Medellin',
    warehouse_country: 'Colombia',
  };

  const mockProduct3: Product = {
    ...mockProduct1,
    id: '3',
    warehouse: 'WH002',
    warehouse_name: 'Secondary Warehouse',
    stock: 5,
  };

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [CartService],
    });
    service = TestBed.inject(CartService);
  });

  afterEach(() => {
    service.clearCart();
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  describe('Initial State', () => {
    it('should start with empty cart', () => {
      expect(service.items()).toEqual([]);
      expect(service.itemCount()).toBe(0);
      expect(service.total()).toBe(0);
    });
  });

  describe('addToCart', () => {
    it('should add a new product to the cart', () => {
      const result = service.addToCart(mockProduct1, 2);

      expect(result.success).toBe(true);
      expect(result.message).toBe('Producto agregado al carrito');
      expect(service.items().length).toBe(1);
      expect(service.items()[0].product.sku).toBe('SKU001');
      expect(service.items()[0].quantity).toBe(2);
      expect(service.items()[0].subtotal).toBe(3000);
    });

    it('should calculate itemCount correctly', () => {
      service.addToCart(mockProduct1, 2);
      expect(service.itemCount()).toBe(2);

      service.addToCart(mockProduct2, 3);
      expect(service.itemCount()).toBe(5);
    });

    it('should calculate total correctly', () => {
      service.addToCart(mockProduct1, 2);
      expect(service.total()).toBe(3000);

      service.addToCart(mockProduct2, 3);
      expect(service.total()).toBe(3900);
    });

    it('should increase quantity if same product (same SKU and warehouse) is added again', () => {
      service.addToCart(mockProduct1, 2);
      const result = service.addToCart(mockProduct1, 3);

      expect(result.success).toBe(true);
      expect(service.items().length).toBe(1);
      expect(service.items()[0].quantity).toBe(5);
      expect(service.items()[0].subtotal).toBe(7500);
    });

    it('should treat same SKU with different warehouse as different products', () => {
      service.addToCart(mockProduct1, 2);
      service.addToCart(mockProduct3, 3);

      expect(service.items().length).toBe(2);
      expect(service.items()[0].product.warehouse).toBe('WH001');
      expect(service.items()[1].product.warehouse).toBe('WH002');
    });

    it('should reject quantity greater than stock', () => {
      const result = service.addToCart(mockProduct1, 15);

      expect(result.success).toBe(false);
      expect(result.message).toBe('Solo hay 10 unidades disponibles');
      expect(service.items().length).toBe(0);
    });

    it('should reject quantity less than or equal to 0', () => {
      const result1 = service.addToCart(mockProduct1, 0);
      expect(result1.success).toBe(false);
      expect(result1.message).toBe('La cantidad debe ser mayor a 0');

      const result2 = service.addToCart(mockProduct1, -5);
      expect(result2.success).toBe(false);
      expect(result2.message).toBe('La cantidad debe ser mayor a 0');

      expect(service.items().length).toBe(0);
    });

    it('should reject adding more items when total quantity exceeds stock', () => {
      service.addToCart(mockProduct1, 7);
      const result = service.addToCart(mockProduct1, 5);

      expect(result.success).toBe(false);
      expect(result.message).toBe('Solo puedes agregar 3 unidades más');
      expect(service.items()[0].quantity).toBe(7);
    });

    it('should allow adding up to exact stock limit', () => {
      service.addToCart(mockProduct1, 5);
      const result = service.addToCart(mockProduct1, 5);

      expect(result.success).toBe(true);
      expect(service.items()[0].quantity).toBe(10);
    });
  });

  describe('removeFromCart', () => {
    it('should remove a product from the cart', () => {
      service.addToCart(mockProduct1, 2);
      service.addToCart(mockProduct2, 3);

      service.removeFromCart('SKU001', 'WH001');

      expect(service.items().length).toBe(1);
      expect(service.items()[0].product.sku).toBe('SKU002');
    });

    it('should update itemCount after removal', () => {
      service.addToCart(mockProduct1, 2);
      service.addToCart(mockProduct2, 3);

      service.removeFromCart('SKU001', 'WH001');

      expect(service.itemCount()).toBe(3);
    });

    it('should update total after removal', () => {
      service.addToCart(mockProduct1, 2);
      service.addToCart(mockProduct2, 3);

      service.removeFromCart('SKU001', 'WH001');

      expect(service.total()).toBe(900);
    });

    it('should not remove product if SKU matches but warehouse does not', () => {
      service.addToCart(mockProduct1, 2);
      service.removeFromCart('SKU001', 'WH999');

      expect(service.items().length).toBe(1);
    });

    it('should handle removing non-existent product gracefully', () => {
      service.addToCart(mockProduct1, 2);
      service.removeFromCart('SKU999', 'WH999');

      expect(service.items().length).toBe(1);
    });

    it('should remove correct product when same SKU exists in different warehouses', () => {
      service.addToCart(mockProduct1, 2);
      service.addToCart(mockProduct3, 3);

      service.removeFromCart('SKU001', 'WH002');

      expect(service.items().length).toBe(1);
      expect(service.items()[0].product.warehouse).toBe('WH001');
    });
  });

  describe('updateQuantity', () => {
    beforeEach(() => {
      service.addToCart(mockProduct1, 5);
    });

    it('should update quantity of existing product', () => {
      const result = service.updateQuantity('SKU001', 'WH001', 8);

      expect(result.success).toBe(true);
      expect(result.message).toBe('Cantidad actualizada');
      expect(service.items()[0].quantity).toBe(8);
      expect(service.items()[0].subtotal).toBe(12000);
    });

    it('should reject quantity greater than stock', () => {
      const result = service.updateQuantity('SKU001', 'WH001', 15);

      expect(result.success).toBe(false);
      expect(result.message).toBe('Solo hay 10 unidades disponibles');
      expect(service.items()[0].quantity).toBe(5);
    });

    it('should remove product when quantity is set to 0', () => {
      const result = service.updateQuantity('SKU001', 'WH001', 0);

      expect(result.success).toBe(true);
      expect(result.message).toBe('Producto eliminado del carrito');
      expect(service.items().length).toBe(0);
    });

    it('should remove product when quantity is negative', () => {
      const result = service.updateQuantity('SKU001', 'WH001', -5);

      expect(result.success).toBe(true);
      expect(result.message).toBe('Producto eliminado del carrito');
      expect(service.items().length).toBe(0);
    });

    it('should return error for non-existent product', () => {
      const result = service.updateQuantity('SKU999', 'WH999', 5);

      expect(result.success).toBe(false);
      expect(result.message).toBe('Producto no encontrado en el carrito');
    });

    it('should update correct product when same SKU exists in different warehouses', () => {
      service.addToCart(mockProduct3, 2);

      service.updateQuantity('SKU001', 'WH002', 4);

      expect(service.items().length).toBe(2);
      const updatedItem = service.items().find((item) => item.product.warehouse === 'WH002');
      expect(updatedItem?.quantity).toBe(4);

      const unchangedItem = service.items().find((item) => item.product.warehouse === 'WH001');
      expect(unchangedItem?.quantity).toBe(5);
    });

    it('should update total after quantity change', () => {
      service.updateQuantity('SKU001', 'WH001', 3);

      expect(service.total()).toBe(4500);
    });

    it('should update itemCount after quantity change', () => {
      service.updateQuantity('SKU001', 'WH001', 7);

      expect(service.itemCount()).toBe(7);
    });
  });

  describe('clearCart', () => {
    it('should remove all items from cart', () => {
      service.addToCart(mockProduct1, 2);
      service.addToCart(mockProduct2, 3);

      service.clearCart();

      expect(service.items()).toEqual([]);
      expect(service.itemCount()).toBe(0);
      expect(service.total()).toBe(0);
    });

    it('should work on empty cart', () => {
      service.clearCart();

      expect(service.items()).toEqual([]);
    });
  });

  describe('getCartItem', () => {
    beforeEach(() => {
      service.addToCart(mockProduct1, 2);
      service.addToCart(mockProduct2, 3);
    });

    it('should return cart item when found', () => {
      const item = service.getCartItem('SKU001', 'WH001');

      expect(item).toBeDefined();
      expect(item?.product.sku).toBe('SKU001');
      expect(item?.quantity).toBe(2);
    });

    it('should return undefined when product not found', () => {
      const item = service.getCartItem('SKU999', 'WH999');

      expect(item).toBeUndefined();
    });

    it('should return undefined when SKU matches but warehouse does not', () => {
      const item = service.getCartItem('SKU001', 'WH999');

      expect(item).toBeUndefined();
    });

    it('should return correct item when same SKU exists in different warehouses', () => {
      service.addToCart(mockProduct3, 4);

      const item1 = service.getCartItem('SKU001', 'WH001');
      const item2 = service.getCartItem('SKU001', 'WH002');

      expect(item1?.product.warehouse).toBe('WH001');
      expect(item1?.quantity).toBe(2);
      expect(item2?.product.warehouse).toBe('WH002');
      expect(item2?.quantity).toBe(4);
    });
  });

  describe('Computed Signals', () => {
    it('should automatically update itemCount when items change', () => {
      expect(service.itemCount()).toBe(0);

      service.addToCart(mockProduct1, 2);
      expect(service.itemCount()).toBe(2);

      service.addToCart(mockProduct2, 3);
      expect(service.itemCount()).toBe(5);

      service.updateQuantity('SKU001', 'WH001', 4);
      expect(service.itemCount()).toBe(7);

      service.removeFromCart('SKU002', 'WH002');
      expect(service.itemCount()).toBe(4);
    });

    it('should automatically update total when items change', () => {
      expect(service.total()).toBe(0);

      service.addToCart(mockProduct1, 2);
      expect(service.total()).toBe(3000);

      service.addToCart(mockProduct2, 3);
      expect(service.total()).toBe(3900);

      service.updateQuantity('SKU001', 'WH001', 1);
      expect(service.total()).toBe(2400);

      service.removeFromCart('SKU001', 'WH001');
      expect(service.total()).toBe(900);
    });
  });

  describe('Complex Scenarios', () => {
    it('should handle multiple operations in sequence', () => {
      service.addToCart(mockProduct1, 3);
      service.addToCart(mockProduct2, 2);
      service.addToCart(mockProduct1, 2);
      service.updateQuantity('SKU002', 'WH002', 5);
      service.removeFromCart('SKU001', 'WH001');

      expect(service.items().length).toBe(1);
      expect(service.items()[0].product.sku).toBe('SKU002');
      expect(service.items()[0].quantity).toBe(5);
      expect(service.total()).toBe(1500);
    });

    it('should maintain integrity with products from different warehouses', () => {
      service.addToCart(mockProduct1, 2);
      service.addToCart(mockProduct3, 3);

      expect(service.items().length).toBe(2);
      expect(service.itemCount()).toBe(5);
      expect(service.total()).toBe(7500);

      service.updateQuantity('SKU001', 'WH001', 5);
      expect(service.itemCount()).toBe(8);

      service.removeFromCart('SKU001', 'WH002');
      expect(service.items().length).toBe(1);
      expect(service.items()[0].product.warehouse).toBe('WH001');
    });
  });
});
