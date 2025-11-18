import { Component, inject, OnInit, signal } from '@angular/core';
import {
  IonHeader,
  IonTitle,
  IonToolbar,
  IonContent,
  IonButtons,
  IonBackButton,
  IonCardTitle,
  IonCardContent,
  IonCard,
  LoadingController,
  ToastController,
} from '@ionic/angular/standalone';
import { firstValueFrom } from 'rxjs';
import { TranslateModule, TranslateService } from '@ngx-translate/core';
import { addIcons } from 'ionicons';
import { informationCircle } from 'ionicons/icons';
import { IonIcon } from '@ionic/angular/standalone';
import { ScheduledDeliveryCardComponent } from '@mobile/components/schedule-delivery-card/scheduled-delivery-card';
import { OrderService } from '@mobile/services/order/order.service';
import { ScheduledOrder } from '@mobile/models/order.model';

@Component({
  selector: 'app-scheduled-deliveries',
  templateUrl: './scheduled-deliveries.page.html',
  styleUrls: ['./scheduled-deliveries.page.scss'],
  imports: [
    IonCard,
    IonCardContent,
    IonCardTitle,
    IonIcon,
    IonBackButton,
    IonButtons,
    IonContent,
    IonToolbar,
    IonHeader,
    IonTitle,
    ScheduledDeliveryCardComponent,
    TranslateModule,
  ],
})
export class ScheduledDeliveriesPage implements OnInit {
  protected readonly orders = signal<ScheduledOrder[]>([]);

  private readonly loader = inject(LoadingController);
  private readonly toast = inject(ToastController);
  private readonly translate = inject(TranslateService);

  private readonly ordersService = inject(OrderService);

  constructor() {
    addIcons({ informationCircle });
  }

  async ngOnInit() {
    await this.loadOrders();
  }

  private async loadOrders() {
    const loading = await this.showLoader();
    try {
      const orders = await firstValueFrom(this.ordersService.getMyScheduledOrders());
      this.orders.set(orders);
    } catch (error: any) {
      console.error(error);
      await this.showToastError(error);
    } finally {
      await loading.dismiss();
    }
  }

  private async showLoader() {
    const loading = await this.loader.create({
      message: this.translate.instant('orders.scheduledDeliveries.loading'),
      keyboardClose: false,
      backdropDismiss: false,
    });
    await loading.present();
    return loading;
  }

  private async showToastError(error: unknown) {
    await this.loader.dismiss();
    const errorMessage = this.translate.instant('orders.scheduledDeliveries.error');
    const fullMessage =
      error && typeof error === 'object' && 'message' in error
        ? `${errorMessage}. ${(error as { message: string }).message}`
        : errorMessage;

    return this.toast
      .create({ message: fullMessage, duration: 7000, color: 'danger' })
      .then((toast) => toast.present());
  }
}
