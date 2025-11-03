import { Component, computed, inject, OnInit, signal } from '@angular/core';
import {
  IonCard,
  IonCardHeader,
  IonCardTitle,
  LoadingController,
  IonCardContent,
  IonCardSubtitle,
  IonText,
  ToastController,
  IonIcon,
} from '@ionic/angular/standalone';

import { addIcons } from 'ionicons';
import { informationCircle } from 'ionicons/icons';

import { Product } from '@mobile/models/product.model';
import { ProductService } from '@web/services/product/product.service';
import { ProductInventaryItem } from '@web/components/product-inventary-item/product-inventary-item';
import { InventoryFilterComponent } from '@web/components/inventory-filter/inventory-filter';

import { SearchInventoryParams } from './interfaces/search-inventory-params.interface';

@Component({
  selector: 'app-product-inventory',
  templateUrl: 'product-inventory.page.html',
  imports: [
    IonIcon,
    IonText,
    IonCardSubtitle,
    IonCardContent,
    IonCardTitle,
    IonCardHeader,
    IonCard,
    ProductInventaryItem,
    InventoryFilterComponent,
  ],
  styleUrl: './product-inventory.page.scss',
})
export class ProductInventoryPage implements OnInit {
  private readonly productsService = inject(ProductService);

  protected readonly products = signal<Product[]>([]);

  protected readonly hasProducts = computed(() => this.products().length > 0);

  private readonly loader = inject(LoadingController);

  private readonly toast = inject(ToastController);

  protected readonly currentFilters = signal<SearchInventoryParams>({
    productName: '',
    batch: '',
    status: '',
    warehouseName: '',
  });

  constructor() {
    addIcons({ informationCircle });
  }

  async ngOnInit() {
    await this.loadInitialProducts();
  }

  private async loadInitialProducts() {
    const loading = await this.showLoader();
    try {
      await this.loadProducts();
    } catch (error: any) {
      console.error(error);
      await this.showToastError(error);
    } finally {
      await loading.dismiss();
    }
  }

  private async loadProducts() {
    const products = await this.productsService.search(this.currentFilters());
    this.products.set(products);
  }

  private async showLoader() {
    const loading = await this.loader.create({
      message: 'Cargando...',
      keyboardClose: false,
      backdropDismiss: false,
    });
    await loading.present();
    return loading;
  }

  private async showToastError(error: any) {
    await this.loader.dismiss();
    return this.toast
      .create({ message: `Error al consultar productos. ${error?.message}`, duration: 7000, color: 'danger' })
      .then((toast) => toast.present());
  }

  async searchInventory(nextFilters: SearchInventoryParams) {
    this.currentFilters.set(nextFilters);
    await this.loadInitialProducts();
  }
}
