import { Component } from '@angular/core';
import { RouterLink } from '@angular/router';

import { addIcons } from 'ionicons';
import { arrowForwardOutline, storefront, search, time } from 'ionicons/icons';

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
import { TranslateModule } from '@ngx-translate/core';
import { HasRoleDirective } from '@shared/auth';

@Component({
  selector: 'app-orders',
  templateUrl: './orders.page.html',
  imports: [
    RouterLink,
    IonLabel,
    IonIcon,
    IonItem,
    IonList,
    IonContent,
    IonToolbar,
    IonTitle,
    IonHeader,
    TranslateModule,
    HasRoleDirective,
  ],
})
export class OrdersPage {
  constructor() {
    addIcons({ arrowForwardOutline, storefront, search, time });
  }
}
