import { Component } from '@angular/core';
import { RouterLink } from '@angular/router';

import { addIcons } from 'ionicons';
import { arrowForwardOutline, storefront } from 'ionicons/icons';

import {
  IonTitle,
  IonHeader,
  IonToolbar,
  IonContent,
  IonList,
  IonItem,
  IonIcon,
  IonLabel,
} from '@ionic/angular/standalone';

@Component({
  selector: 'app-orders',
  templateUrl: './orders.page.html',
  imports: [RouterLink, IonLabel, IonIcon, IonItem, IonList, IonContent, IonToolbar, IonTitle, IonHeader],
})
export class OrdersPage {
  constructor() {
    addIcons({ arrowForwardOutline, storefront });
  }
}
