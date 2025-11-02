import { Injectable, computed, signal } from '@angular/core';

import { CartItem } from '@mobile/models/cart-item.model';
import { Product } from '@mobile/models/product.model';

@Injectable({
  providedIn: 'root',
})
export class CartService {
  private readonly cartItems = signal<CartItem[]>([]);

  public readonly items = this.cartItems.asReadonly();
  public readonly itemCount = computed(() => this.cartItems().reduce((total, item) => total + item.quantity, 0));
  public readonly total = computed(() => this.cartItems().reduce((total, item) => total + item.subtotal, 0));

  public addToCart(product: Product, quantity: number): { success: boolean; message: string } {
    if (quantity > product.stock) {
      return {
        success: false,
        message: `Solo hay ${product.stock} unidades disponibles`,
      };
    }

    if (quantity <= 0) {
      return {
        success: false,
        message: 'La cantidad debe ser mayor a 0',
      };
    }

    const currentItems = [...this.cartItems()];
    // Usar SKU + warehouse para identificar productos únicos
    const existingItemIndex = currentItems.findIndex(
      (item) => item.product.sku === product.sku && item.product.warehouse === product.warehouse
    );

    if (existingItemIndex >= 0) {
      const newQuantity = currentItems[existingItemIndex].quantity + quantity;

      if (newQuantity > product.stock) {
        return {
          success: false,
          message: `Solo puedes agregar ${product.stock - currentItems[existingItemIndex].quantity} unidades más`,
        };
      }

      currentItems[existingItemIndex] = {
        ...currentItems[existingItemIndex],
        quantity: newQuantity,
        subtotal: newQuantity * product.unit_value,
      };
    } else {
      const cartItem: CartItem = {
        product,
        quantity,
        subtotal: quantity * product.unit_value,
      };
      currentItems.push(cartItem);
    }

    this.cartItems.set(currentItems);
    return {
      success: true,
      message: 'Producto agregado al carrito',
    };
  }

  public removeFromCart(sku: string, warehouse: string): void {
    const currentItems = this.cartItems().filter(
      (item) => !(item.product.sku === sku && item.product.warehouse === warehouse)
    );
    this.cartItems.set(currentItems);
  }

  public updateQuantity(
    sku: string,
    warehouse: string,
    quantity: number
  ): { success: boolean; message: string } {
    const currentItems = [...this.cartItems()];
    const itemIndex = currentItems.findIndex(
      (item) => item.product.sku === sku && item.product.warehouse === warehouse
    );

    if (itemIndex < 0) {
      return {
        success: false,
        message: 'Producto no encontrado en el carrito',
      };
    }

    const item = currentItems[itemIndex];

    if (quantity <= 0) {
      this.removeFromCart(sku, warehouse);
      return {
        success: true,
        message: 'Producto eliminado del carrito',
      };
    }

    if (quantity > item.product.stock) {
      return {
        success: false,
        message: `Solo hay ${item.product.stock} unidades disponibles`,
      };
    }

    currentItems[itemIndex] = {
      ...item,
      quantity,
      subtotal: quantity * item.product.unit_value,
    };

    this.cartItems.set(currentItems);
    return {
      success: true,
      message: 'Cantidad actualizada',
    };
  }

  public clearCart(): void {
    this.cartItems.set([]);
  }

  public getCartItem(sku: string, warehouse: string): CartItem | undefined {
    return this.cartItems().find(
      (item) => item.product.sku === sku && item.product.warehouse === warehouse
    );
  }
}
