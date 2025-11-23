import { addIcons } from 'ionicons';
import { Component, computed, input } from '@angular/core';
import { location, cardOutline } from 'ionicons/icons';
import {
  IonCard,
  IonCardContent,
  IonCardHeader,
  IonCardTitle,
  IonCardSubtitle,
  IonIcon,
} from '@ionic/angular/standalone';
import { VendorClientItem } from './vendor-client-item.interface';
import { getCountryNameByCode } from '@shared/constants/countries.constant';

@Component({
  selector: 'app-vendor-client-card',
  templateUrl: './vendor-client-card.component.html',
  styleUrls: ['./vendor-client-card.component.scss'],
  standalone: true,
  imports: [IonIcon, IonCardSubtitle, IonCardTitle, IonCard, IonCardHeader, IonCardContent],
})
export class VendorClientCardComponent {
  readonly client = input.required<VendorClientItem>();

  readonly countryLabel = computed(() => getCountryNameByCode(this.client().country) || '');

  constructor() {
    addIcons({ cardOutline, location });
  }
}
