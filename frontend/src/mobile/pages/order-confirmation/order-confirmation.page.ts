import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';

import {
  IonHeader,
  IonToolbar,
  IonTitle,
  IonContent,
  IonCard,
  IonCardHeader,
  IonCardTitle,
  IonCardContent,
  IonButton,
  IonIcon,
  IonBadge,
  IonList,
  IonItem,
  IonLabel,
  IonText,
} from '@ionic/angular/standalone';

import { addIcons } from 'ionicons';
import { checkmarkCircleOutline, homeOutline, receiptOutline } from 'ionicons/icons';

import { Order } from '@mobile/models/order.model';

@Component({
  selector: 'app-order-confirmation',
  templateUrl: './order-confirmation.page.html',
  styleUrls: ['./order-confirmation.page.scss'],
  standalone: true,
  imports: [
    IonText,
    IonLabel,
    IonItem,
    IonList,
    IonBadge,
    IonIcon,
    IonButton,
    IonCardContent,
    IonCardTitle,
    IonCardHeader,
    IonCard,
    IonContent,
    IonTitle,
    IonToolbar,
    IonHeader,
  ],
})
export class OrderConfirmationPage implements OnInit {
  public order: Order | null = null;

  constructor(private router: Router) {
    addIcons({ checkmarkCircleOutline, homeOutline, receiptOutline });
  }

  public ngOnInit(): void {
    const navigation = history.state;
    if (navigation && navigation.order) {
      this.order = navigation.order;
    } else {
      // Si no hay orden, redirigir al home
      this.router.navigate(['/tabs/orders']);
    }
  }

  public goToOrders(): void {
    this.router.navigate(['/tabs/orders']);
  }

  public createNewOrder(): void {
    this.router.navigate(['/orders/create-order-with-products']);
  }

  public getStatusColor(status: string): string {
    const statusColors: Record<string, string> = {
      PENDING: 'warning',
      CONFIRMED: 'primary',
      SHIPPED: 'secondary',
      DELIVERED: 'success',
      CANCELLED: 'danger',
    };
    return statusColors[status] || 'medium';
  }

  public getPriorityColor(priority: string): string {
    const priorityColors: Record<string, string> = {
      HIGH: 'danger',
      MEDIUM: 'warning',
      LOW: 'success',
    };
    return priorityColors[priority] || 'medium';
  }

  public getPriorityLabel(priority: string): string {
    const priorityLabels: Record<string, string> = {
      HIGH: 'Alta',
      MEDIUM: 'Media',
      LOW: 'Baja',
    };
    return priorityLabels[priority] || priority;
  }

  public getStatusLabel(status: string): string {
    const statusLabels: Record<string, string> = {
      PENDING: 'Pendiente',
      CONFIRMED: 'Confirmado',
      SHIPPED: 'Enviado',
      DELIVERED: 'Entregado',
      CANCELLED: 'Cancelado',
    };
    return statusLabels[status] || status;
  }

  public getTotalAmount(): number {
    if (!this.order) return 0;
    return this.order.products.reduce((total, product) => total + product.amount, 0);
  }
}
