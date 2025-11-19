import { addIcons } from 'ionicons';
import { Component, signal } from '@angular/core';
import { informationCircle, calendarNumber } from 'ionicons/icons';
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
import { DateButtonComponent } from '@mobile/components/date-button/date-button.component';

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
    DateButtonComponent,
  ],
})
export class ConsultVisitsPage {
  protected selectedDate = signal<string | undefined>(new Date().toISOString());

  constructor() {
    addIcons({ informationCircle, calendarNumber });
  }

  onChangeDate(date: string) {
    this.selectedDate.set(date);
  }
}
