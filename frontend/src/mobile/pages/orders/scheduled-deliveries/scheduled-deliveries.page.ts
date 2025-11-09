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
  ],
})
export class ScheduledDeliveriesPage implements OnInit {
  protected readonly orders = signal<number[]>([]);

  private readonly loader = inject(LoadingController);

  private readonly toast = inject(ToastController);

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
      .create({ message: `Error al obtener entregas programadas. ${error?.message}`, duration: 7000, color: 'danger' })
      .then((toast) => toast.present());
  }
}
