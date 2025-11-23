import { addIcons } from 'ionicons';
import { TranslateModule } from '@ngx-translate/core';
import { Component, computed, input } from '@angular/core';
import { location, cardOutline, person, timeOutline } from 'ionicons/icons';
import { IonCard, IonCardContent, IonCardHeader, IonCardTitle, IonIcon } from '@ionic/angular/standalone';

import { LocalDatePipe } from '@shared/pipes/local-date.pipe';
import { getCountryNameByCode } from '@shared/constants/countries.constant';

import { VisitItem } from '../../services/visits';

@Component({
  selector: 'app-visit-card-item',
  templateUrl: './visit-card-item.component.html',
  styleUrls: ['./visit-card-item.component.scss'],
  standalone: true,
  imports: [IonIcon, IonCardTitle, IonCard, IonCardHeader, IonCardContent, LocalDatePipe, TranslateModule],
})
export class VisitCardItemComponent {
  readonly visit = input.required<VisitItem>();

  readonly countryLabel = computed(() => getCountryNameByCode(this.visit().institution.country) || '');

  readonly position = input.required<number>();

  constructor() {
    addIcons({ cardOutline, location, person, timeOutline });
  }
}
