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
  IonSpinner,
  IonButton,
} from '@ionic/angular/standalone';
import { TranslateModule, TranslateService } from '@ngx-translate/core';

import { ProductService } from '@mobile/services/product/product.service';
import { CartService } from '@mobile/services/cart/cart.service';

import { Product } from '@mobile/models/product.model';

import { addIcons } from 'ionicons';
import { cartOutline, alertCircleOutline, searchOutline } from 'ionicons/icons';

@Component({
  selector: 'app-create-order-with-products',
  templateUrl: './create-order-with-products.page.html',
  styleUrls: ['./create-order-with-products.page.scss'],
  imports: [
    IonButton,
    IonSpinner,
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
    TranslateModule,
  ],
})
export class CreateOrderWithProductsPage implements OnInit {
  public readonly products = signal<Product[]>([]);
  public readonly isLoading = signal(false);
  public readonly errorMessage = signal<string | null>(null);
  public searchQuery = '';

  private readonly productsService = inject(ProductService);
  private readonly cartService = inject(CartService);
  private readonly router = inject(Router);
  private readonly translate = inject(TranslateService);

  public readonly cartItemCount = this.cartService.itemCount;

  constructor() {
    addIcons({ cartOutline, alertCircleOutline, searchOutline });
  }

  public ngOnInit(): void {
    this.loadProducts();
  }

  private loadProducts(): void {
    this.isLoading.set(true);
    this.errorMessage.set(null);

    this.productsService.getProducts().subscribe({
      next: (products) => {
        this.products.set(products);
        this.isLoading.set(false);
      },
      error: (error) => {
        console.error('Error loading products:', error);
        this.errorMessage.set(this.translate.instant('orders.createPage.error.toast'));
        this.isLoading.set(false);
      },
    });
  }

  public delayedSearchChange = this.debounce(() => this.onSearchChange(), 350);

  private debounce(func: () => void, wait: number): () => void {
    let timeout: any;
    return () => {
      clearTimeout(timeout);
      timeout = setTimeout(() => {
        func();
      }, wait);
    };
  }

  public onSearchChange(): void {
    if (!this.searchQuery.trim()) {
      this.loadProducts();
      return;
    }

    this.isLoading.set(true);
    this.errorMessage.set(null);

    this.productsService.searchProducts(this.searchQuery).subscribe({
      next: (products) => {
        this.products.set(products);
        this.isLoading.set(false);
      },
      error: (error) => {
        console.error('Error searching products:', error);
        this.errorMessage.set(this.translate.instant('orders.createPage.error.searchToast'));
        this.isLoading.set(false);
      },
    });
  }

  public retryLoad(): void {
    this.loadProducts();
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
