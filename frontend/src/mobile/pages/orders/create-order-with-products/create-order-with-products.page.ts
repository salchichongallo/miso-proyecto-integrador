import { Component, inject, OnInit, signal } from '@angular/core';
import { Router } from '@angular/router';

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
} from '@ionic/angular/standalone';

import { ProductService } from '@web/services/product/product.service';

import { Product } from '@mobile/models/product.model';

@Component({
  selector: 'app-create-order-with-products',
  templateUrl: './create-order-with-products.page.html',
  styleUrls: ['./create-order-with-products.page.scss'],
  imports: [
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
  ],
})
export class CreateOrderWithProductsPage implements OnInit {
  public readonly products = signal<Product[]>([]);
  private readonly productsService = inject(ProductService);
  private readonly router = inject(Router);

  public ngOnInit(): void {
    this.loadProducts();
  }

  private loadProducts(): void {
    this.productsService.getProducts().subscribe((products) => {
      console.log(products);
      this.products.set(products);
    });
  }

  public viewProductDetail(product: Product): void {
    this.router.navigate(['/orders/product-detail'], {
      state: { product }
    });
  }
}
