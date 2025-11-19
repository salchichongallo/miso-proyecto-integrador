import { addIcons } from 'ionicons';
import { RouterLink } from '@angular/router';
import { CurrencyPipe } from '@angular/common';
import { cashOutline, star } from 'ionicons/icons';
import { IonIcon } from '@ionic/angular/standalone';
import { catchError, firstValueFrom, map, of } from 'rxjs';
import { Component, inject, Input, OnInit, signal } from '@angular/core';

import { Product } from '@mobile/models/product.model';

import { ProductService } from '../../services/product/product.service';

@Component({
  selector: 'app-recommendations',
  templateUrl: './recommendations.component.html',
  styleUrls: ['./recommendations.component.scss'],
  imports: [CurrencyPipe, IonIcon, RouterLink],
})
export class RecommendationsComponent implements OnInit {
  @Input()
  currentProduct!: Product;

  private readonly productsService = inject(ProductService);

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
    alert('checking product');
    // return this.router.navigate(['/orders/product-detail', product.id], { replaceUrl: true });
  }
}
