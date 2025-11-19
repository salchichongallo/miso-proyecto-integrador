import { addIcons } from 'ionicons';
import { Component } from '@angular/core';
import { informationCircle } from 'ionicons/icons';
import { TranslateModule } from '@ngx-translate/core';
import {
  IonHeader,
  IonTitle,
  IonContent,
  IonToolbar,
  IonButtons,
  IonBackButton,
  IonCard,
  IonIcon,
  IonCardTitle,
  IonCardContent,
} from '@ionic/angular/standalone';

@Component({
  selector: 'app-consult-visits-page',
  templateUrl: 'consult-visits.page.html',
  styleUrls: ['consult-visits.page.scss'],
  imports: [
    IonCardContent,
    IonCardTitle,
    IonIcon,
    IonCard,
    IonBackButton,
    IonButtons,
    IonHeader,
    IonToolbar,
    IonTitle,
    IonContent,
    TranslateModule,
  ],
})
export class ConsultVisitsPage {
  constructor() {
    addIcons({ informationCircle });
  }
}
