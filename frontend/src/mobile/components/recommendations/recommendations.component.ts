import { addIcons } from 'ionicons';
import { RouterLink } from '@angular/router';
import { CurrencyPipe } from '@angular/common';
import { cashOutline, star } from 'ionicons/icons';
import { IonIcon, ModalController, ToastController } from '@ionic/angular/standalone';
import { catchError, firstValueFrom, map, of } from 'rxjs';
import { Component, inject, Input, OnInit, signal } from '@angular/core';

import { Product } from '@mobile/models/product.model';

import { CartService } from '../../services/cart/cart.service';
import { ProductService } from '../../services/product/product.service';
import { AddToCartModalComponent } from './add-to-cart-modal/add-to-cart-modal.component';

@Component({
  selector: 'app-recommendations',
  templateUrl: './recommendations.component.html',
  styleUrls: ['./recommendations.component.scss'],
  imports: [CurrencyPipe, IonIcon, RouterLink],
})
export class RecommendationsComponent implements OnInit {
  @Input()
  currentProduct!: Product;

  private readonly cart = inject(CartService);

  private readonly productsService = inject(ProductService);

  private readonly modalController = inject(ModalController);

  private readonly toastController = inject(ToastController);

  readonly recommendedProducts = signal<Product[]>([]);

  constructor() {
    addIcons({ cashOutline, star });
  }

  async ngOnInit() {
    await this.loadRecommendations();
  }

  private async loadRecommendations() {
    const allProducts = this.productsService.getProducts();
    const recommendations = allProducts.pipe(
      map((products) => {
        return products.filter((it) => {
          const isSameType = it.product_type === this.currentProduct.product_type;
          const isNotCurrent = it.id !== this.currentProduct.id;
          return isSameType && isNotCurrent;
        });
      }),
      map((products) => products.slice(0, 4)),
      catchError((error) => {
        console.error('Error fetching product recommendations:', error);
        return of<Product[]>([]);
      }),
    );
    this.recommendedProducts.set(await firstValueFrom(recommendations));
  }

  onProductClick(event: Event, product: Product) {
    event.preventDefault();
    this.openAddToCartModal(product);
  }

  private async openAddToCartModal(product: Product): Promise<void> {
    const modal = await this.modalController.create({
      component: AddToCartModalComponent,
      componentProps: {
        product,
      },
    });

    await modal.present();

    const { data, role } = await modal.onWillDismiss<{ quantity: number }>();

    if (role === 'confirm' && data) {
      this.addToCart(product, data.quantity);
    }
  }

  private async addToCart(product: Product, quantity: number): Promise<void> {
    const result = this.cart.addToCart(product, quantity);

    const toast = await this.toastController.create({
      message: result.message,
      duration: 2500,
      position: 'bottom',
      color: result.success ? 'success' : 'danger',
    });

    await toast.present();
  }
}
