import { Component, inject, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { FormsModule } from '@angular/forms';

import {
  IonBackButton,
  IonHeader,
  IonToolbar,
  IonButtons,
  IonContent,
  IonLabel,
  IonIcon,
  IonText,
  IonBadge,
  IonSelect,
  IonSelectOption,
  IonButton,
  IonFooter,
  IonTitle,
  ToastController,
} from '@ionic/angular/standalone';

import { Product } from '@mobile/models/product.model';
import { CartService } from '@mobile/services/cart/cart.service';

import { addIcons } from 'ionicons';
import { location, cartOutline } from 'ionicons/icons';

@Component({
  selector: 'app-product-detail',
  templateUrl: './product-detail.page.html',
  styleUrls: ['./product-detail.page.scss'],
  standalone: true,
  imports: [
    IonTitle,
    FormsModule,
    IonContent,
    IonButtons,
    IonToolbar,
    IonHeader,
    IonBackButton,
    IonIcon,
    IonText,
    IonBadge,
    IonSelect,
    IonSelectOption,
    IonButton,
    IonFooter,
  ],
})
export class ProductDetailPage implements OnInit {
  public product: Product | null = null;
  public quantity = '1';

  private readonly cartService = inject(CartService);
  private readonly toastController = inject(ToastController);
  private readonly router = inject(Router);

  constructor(private route: ActivatedRoute) {
    addIcons({ location, cartOutline });
  }

  public ngOnInit(): void {
    const navigation = history.state;
    if (navigation && navigation.product) {
      this.product = navigation.product;
    }
  }

  public async addToCart(): Promise<void> {
    if (!this.product) {
      await this.showToast('Error: Producto no encontrado', 'danger');
      return;
    }

    const quantityNumber = parseInt(this.quantity, 10);

    if (isNaN(quantityNumber) || quantityNumber <= 0) {
      await this.showToast('Por favor ingrese una cantidad válida', 'warning');
      return;
    }

    const result = this.cartService.addToCart(this.product, quantityNumber);

    if (result.success) {
      await this.showToast(result.message, 'success');
      this.router.navigate(['/cart']);
    } else {
      await this.showToast(result.message, 'danger');
    }
  }

  private async showToast(
    message: string,
    color: 'success' | 'danger' | 'warning'
  ): Promise<void> {
    const toast = await this.toastController.create({
      message,
      duration: 2500,
      position: 'bottom',
      color,
    });

    await toast.present();
  }
}
