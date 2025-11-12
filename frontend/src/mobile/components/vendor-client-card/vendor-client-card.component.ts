import { addIcons } from 'ionicons';
import { Component, input, signal } from '@angular/core';
import { location, person } from 'ionicons/icons';
import {
  IonCard,
  IonCardContent,
  IonCardHeader,
  IonCardTitle,
  IonCardSubtitle,
  IonIcon,
} from '@ionic/angular/standalone';
import { VendorClientItem } from './vendor-client-item.interface';

@Component({
  selector: 'app-vendor-client-card',
  templateUrl: './vendor-client-card.component.html',
  styleUrls: ['./vendor-client-card.component.scss'],
  standalone: true,
  imports: [IonIcon, IonCardSubtitle, IonCardTitle, IonCard, IonCardHeader, IonCardContent],
})
export class VendorClientCardComponent {
  readonly client = input.required<VendorClientItem>();

  constructor() {
    addIcons({ person, location });
  }
}
