import { Component, inject, signal } from '@angular/core';
import { Router, RouterLink } from '@angular/router';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';

import {
  IonHeader,
  IonToolbar,
  IonTitle,
  IonContent,
  IonButtons,
  IonBackButton,
  IonList,
  IonItem,
  IonLabel,
  IonNote,
  IonButton,
  IonIcon,
  IonFooter,
  IonInput,
  IonSelect,
  IonSelectOption,
  IonText,
  IonCard,
  IonCardHeader,
  IonCardTitle,
  IonCardContent,
  ToastController,
  LoadingController,
  AlertController,
} from '@ionic/angular/standalone';
import { TranslateModule, TranslateService } from '@ngx-translate/core';

import { addIcons } from 'ionicons';
import { trashOutline, removeCircleOutline, addCircleOutline, locationOutline } from 'ionicons/icons';

import { CartService } from '@mobile/services/cart/cart.service';
import { OrderService } from '@mobile/services/order/order.service';
import { OrderRequest } from '@mobile/models/order.model';

@Component({
  selector: 'app-cart',
  templateUrl: './cart.page.html',
  styleUrls: ['./cart.page.scss'],
  standalone: true,
  imports: [
    IonCardContent,
    IonCardTitle,
    IonCardHeader,
    IonCard,
    IonText,
    IonSelectOption,
    IonSelect,
    IonInput,
    IonFooter,
    IonIcon,
    IonButton,
    IonLabel,
    IonItem,
    IonList,
    IonBackButton,
    IonButtons,
    IonContent,
    IonTitle,
    IonToolbar,
    IonHeader,
    ReactiveFormsModule,
    RouterLink,
    TranslateModule,
  ],
})
export class CartPage {
  public readonly cartItems = inject(CartService).items;
  public readonly cartTotal = inject(CartService).total;
  public readonly cartItemCount = inject(CartService).itemCount;

  private readonly cartService = inject(CartService);
  private readonly orderService = inject(OrderService);
  private readonly router = inject(Router);
  private readonly fb = inject(FormBuilder);
  private readonly toastController = inject(ToastController);
  private readonly loadingController = inject(LoadingController);
  private readonly alertController = inject(AlertController);
  private readonly translate = inject(TranslateService);

  public readonly checkoutForm: FormGroup;
  public readonly isSubmitting = signal(false);

  constructor() {
    addIcons({ trashOutline, removeCircleOutline, addCircleOutline, locationOutline });

    this.checkoutForm = this.fb.group({
      country: ['Colombia', [Validators.required]],
      city: ['', [Validators.required]],
      address: ['', [Validators.required, Validators.minLength(10)]],
      priority: ['MEDIUM', [Validators.required]],
      date_estimated: ['', [Validators.required]],
      id_client: ['', [Validators.required]],
      id_vendor: ['', [Validators.required]],
    });
  }

  public removeItem(sku: string, warehouse: string): void {
    this.cartService.removeFromCart(sku, warehouse);
    this.showToast(this.translate.instant('orders.cart.toast.productRemoved'), 'success');
  }

  public updateQuantity(sku: string, warehouse: string, change: number): void {
    const item = this.cartService.getCartItem(sku, warehouse);
    if (!item) return;

    const newQuantity = item.quantity + change;
    const result = this.cartService.updateQuantity(sku, warehouse, newQuantity);

    if (!result.success) {
      this.showToast(result.message, 'danger');
    }
  }

  public async clearCart(): Promise<void> {
    const alert = await this.alertController.create({
      header: this.translate.instant('orders.cart.alert.title'),
      message: this.translate.instant('orders.cart.alert.message'),
      buttons: [
        {
          text: this.translate.instant('orders.cart.alert.cancel'),
          role: 'cancel',
        },
        {
          text: this.translate.instant('orders.cart.alert.confirm'),
          role: 'destructive',
          handler: () => {
            this.cartService.clearCart();
            this.showToast(this.translate.instant('orders.cart.toast.cartCleared'), 'success');
          },
        },
      ],
    });

    await alert.present();
  }

  public async submitOrder(): Promise<void> {
    if (this.checkoutForm.invalid) {
      this.showToast(this.translate.instant('orders.cart.toast.validationError'), 'warning');
      this.checkoutForm.markAllAsTouched();
      return;
    }

    if (this.cartItems().length === 0) {
      this.showToast(this.translate.instant('orders.cart.empty.title'), 'warning');
      return;
    }

    const loading = await this.loadingController.create({
      message: this.translate.instant('orders.cart.buttons.processing'),
    });

    await loading.present();
    this.isSubmitting.set(true);

    try {
      const orderRequest: OrderRequest = {
        ...this.checkoutForm.value,
        order_status: 'PENDING',
        products: this.cartItems().map((item) => ({
          id: item.product.sku,
          name: item.product.name,
          amount: item.quantity,
          id_warehouse: item.product.warehouse,
          unit_price: item.product.unit_value,
        })),
      };

      this.orderService.createOrder(orderRequest).subscribe({
        next: async (response) => {
          await loading.dismiss();
          this.isSubmitting.set(false);
          this.cartService.clearCart();

          await this.showToast(this.translate.instant('orders.cart.toast.success'), 'success');

          // Navigate to confirmation page
          this.router.navigate(['/order-confirmation'], {
            state: { order: response.order },
          });
        },
        error: async (error) => {
          await loading.dismiss();
          this.isSubmitting.set(false);
          console.error('Error creating order:', error);
          await this.showToast(this.translate.instant('orders.cart.toast.error'), 'danger');
        },
      });
    } catch (error) {
      await loading.dismiss();
      this.isSubmitting.set(false);
      console.error('Unexpected error:', error);
      await this.showToast(this.translate.instant('orders.cart.toast.error'), 'danger');
    }
  }

  private async showToast(message: string, color: 'success' | 'danger' | 'warning'): Promise<void> {
    const toast = await this.toastController.create({
      message,
      duration: 2500,
      position: 'bottom',
      color,
    });

    await toast.present();
  }
}
