import { Component, inject, OnInit, signal } from '@angular/core';
import { Router } from '@angular/router';
import { FormsModule } from '@angular/forms';

import {
  IonTitle,
  IonBackButton,
  IonHeader,
  IonToolbar,
  IonButtons,
  IonContent,
  IonInput,
  IonItem,
  IonLabel,
  IonNote,
  IonIcon,
  IonBadge,
  IonFab,
  IonFabButton,
} from '@ionic/angular/standalone';

import { ProductService } from '@mobile/services/product/product.service';
import { CartService } from '@mobile/services/cart/cart.service';

import { Product } from '@mobile/models/product.model';

import { addIcons } from 'ionicons';
import { cartOutline } from 'ionicons/icons';

@Component({
  selector: 'app-create-order-with-products',
  templateUrl: './create-order-with-products.page.html',
  styleUrls: ['./create-order-with-products.page.scss'],
  imports: [
    IonFabButton,
    IonFab,
    IonBadge,
    IonNote,
    IonLabel,
    IonItem,
    IonContent,
    IonButtons,
    IonToolbar,
    IonHeader,
    IonTitle,
    IonBackButton,
    IonInput,
    FormsModule,
    IonIcon,
  ],
})
export class CreateOrderWithProductsPage implements OnInit {
  public readonly products = signal<Product[]>([]);
  public searchQuery = '';

  private readonly productsService = inject(ProductService);
  private readonly cartService = inject(CartService);
  private readonly router = inject(Router);

  public readonly cartItemCount = this.cartService.itemCount;

  constructor() {
    addIcons({ cartOutline });
  }

  public ngOnInit(): void {
    this.loadProducts();
  }

  private loadProducts(): void {
    this.productsService.getProducts().subscribe((products) => {
      this.products.set(products);
    });
  }

  public onSearchChange(): void {
    this.productsService.searchProducts(this.searchQuery).subscribe((products) => {
      this.products.set(products);
    });
  }

  public viewProductDetail(product: Product): void {
    this.router.navigate(['/orders/product-detail'], {
      state: { product },
    });
  }

  public goToCart(): void {
    this.router.navigate(['/cart']);
  }
}
