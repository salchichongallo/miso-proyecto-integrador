import { Component } from '@angular/core';
import { RouterLink } from '@angular/router';

import { addIcons } from 'ionicons';
import { arrowForwardOutline, add, people } from 'ionicons/icons';

import {
  IonHeader,
  IonToolbar,
  IonTitle,
  IonContent,
  IonItem,
  IonList,
  IonLabel,
  IonIcon,
} from '@ionic/angular/standalone';
import { TranslateModule } from '@ngx-translate/core';
import { HasRoleDirective } from '@shared/auth';

@Component({
  selector: 'app-customers-page',
  templateUrl: 'customers.page.html',
  styleUrls: ['customers.page.scss'],
  imports: [
    RouterLink,
    IonIcon,
    IonLabel,
    IonList,
    IonItem,
    IonHeader,
    IonToolbar,
    IonTitle,
    IonContent,
    TranslateModule,
    HasRoleDirective,
  ],
})
export class CustomersPage {
  constructor() {
    addIcons({ arrowForwardOutline, add, people });
  }
}
