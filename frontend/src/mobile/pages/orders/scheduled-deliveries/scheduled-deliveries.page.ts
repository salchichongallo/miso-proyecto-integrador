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
import { TranslateModule, TranslateService } from '@ngx-translate/core';
import { addIcons } from 'ionicons';
import { informationCircle } from 'ionicons/icons';
import { IonIcon } from '@ionic/angular/standalone';
import { ScheduledDeliveryCardComponent } from '@mobile/components/schedule-delivery-card/scheduled-delivery-card';

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
  protected readonly orders = signal<number[]>([]);

  private readonly loader = inject(LoadingController);
  private readonly toast = inject(ToastController);
  private readonly translate = inject(TranslateService);

  constructor() {
    addIcons({ informationCircle });
  }

  async ngOnInit() {
    await this.loadOrders();
  }

  private async loadOrders() {
    const loading = await this.showLoader();
    try {
      await new Promise((resolve) => setTimeout(resolve, 1500));
      if (Math.random() < 0.3) {
        this.orders.set([1, 2, 3]);
      }
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
    const fullMessage = error && typeof error === 'object' && 'message' in error
      ? `${errorMessage}. ${(error as { message: string }).message}`
      : errorMessage;

    return this.toast
      .create({ message: fullMessage, duration: 7000, color: 'danger' })
      .then((toast) => toast.present());
  }
}
