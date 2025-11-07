import { Component, inject, OnInit, signal } from '@angular/core';
import {
  IonToolbar,
  IonHeader,
  IonTitle,
  IonButtons,
  IonBackButton,
  IonContent,
  IonCard,
  IonCardTitle,
  IonCardContent,
  IonIcon,
  IonSpinner,
  IonCardSubtitle,
  IonCardHeader,
  IonChip,
} from '@ionic/angular/standalone';
import { TranslateModule, TranslateService } from '@ngx-translate/core';

import { Order } from '@mobile/models/order.model';
import { OrderService } from '@mobile/services/order/order.service';

import { addIcons } from 'ionicons';
import { informationCircle } from 'ionicons/icons';

@Component({
  selector: 'app-search-orders',
  templateUrl: './search-orders.page.html',
  styleUrls: ['./search-orders.page.scss'],
  imports: [
    IonChip,
    IonCardHeader,
    IonCardSubtitle,
    IonSpinner,
    IonIcon,
    IonCardContent,
    IonCardTitle,
    IonCard,
    IonContent,
    IonBackButton,
    IonButtons,
    IonToolbar,
    IonHeader,
    IonTitle,
    TranslateModule,
  ],
})
export class SearchOrdersPage implements OnInit {
  public orders: Order[] = [];
  public readonly isLoading = signal(true);

  private readonly ordersService = inject(OrderService);
  private readonly translate = inject(TranslateService);

  constructor() {
    addIcons({ informationCircle });
  }

  public ngOnInit(): void {
    this.fetchOrders();
  }

  private fetchOrders(): void {
    this.isLoading.set(true);
    this.ordersService.getOrders().subscribe({
      next: (orders) => {
        this.orders = orders;
        this.isLoading.set(false);
      },
      error: () => {
        this.isLoading.set(false);
      },
    });
  }

  public getStatusColor(status: string): string {
    const statusColors: Record<string, string> = {
      PENDING: 'warning',
      CONFIRMED: 'secondary',
      PROCESSING: 'primary',
      SHIPPED: 'tertiary',
      DELIVERED: 'success',
      CANCELLED: 'danger',
      RETURNED: 'medium',
    };
    return statusColors[status] || 'medium';
  }

  public getStatusLabel(status: string): string {
    const statusKey = status.toLowerCase();
    return this.translate.instant(`orders.searchPage.status.${statusKey}`);
  }
}
