import { Component, inject, signal } from '@angular/core';
import { finalize, tap, catchError, EMPTY } from 'rxjs';

import {
  IonCard,
  IonCardContent,
  IonCardHeader,
  IonCardSubtitle,
  IonCardTitle,
  IonText,
  ToastController,
} from '@ionic/angular/standalone';

import { RouteConfigurationComponent } from '@web/components/route-configuration/route-configuration.component';
import { RouteMapComponent } from '@web/components/route-map/route-map.component';
import { OrdersService } from '@web/services/orders/orders.service';
import { Order } from '@web/services/orders/interfaces/order.interface';

import { RouteGenerationParams } from './interfaces/route-generation-params.interface';

@Component({
  selector: 'app-delivery-routes',
  templateUrl: './delivery-routes.page.html',
  styleUrl: './delivery-routes.page.scss',
  imports: [
    IonCard,
    IonCardContent,
    IonCardHeader,
    IonCardSubtitle,
    IonCardTitle,
    IonText,
    RouteConfigurationComponent,
    RouteMapComponent,
  ],
})
export class DeliveryRoutesPage {
  protected readonly isGeneratingRoutes = signal(false);
  protected readonly orders = signal<Order[]>([]);

  private readonly ordersService = inject(OrdersService);
  private readonly toastController = inject(ToastController);

  protected onGenerateRoutes(params: RouteGenerationParams): void {
    this.isGeneratingRoutes.set(true);

    this.ordersService
      .getOrdersByCustomerId(params.clientId)
      .pipe(
        tap((orders) => {
          this.orders.set(orders);
          this.showSuccessToast(orders.length);
        }),
        catchError(() => {
          this.showErrorToast();
          return EMPTY;
        }),
        finalize(() => {
          this.isGeneratingRoutes.set(false);
        }),
      )
      .subscribe();
  }

  private showSuccessToast(ordersCount: number): void {
    this.toastController
      .create({
        message: `Se encontraron ${ordersCount} órdenes para el cliente`,
        duration: 3000,
        color: 'success',
        position: 'top',
      })
      .then((toast) => toast.present());
  }

  private showErrorToast(): void {
    this.toastController
      .create({
        message: 'Error al obtener las órdenes del cliente',
        duration: 3000,
        color: 'danger',
        position: 'top',
      })
      .then((toast) => toast.present());
  }
}
