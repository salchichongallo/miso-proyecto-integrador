import { addIcons } from 'ionicons';
import { Component } from '@angular/core';
import { NgClass } from '@angular/common';
import { IonIcon } from '@ionic/angular/standalone';
import { TranslateModule } from '@ngx-translate/core';
import { calendarClearOutline, timeOutline, bus, person, cartOutline } from 'ionicons/icons';

@Component({
  selector: 'app-schedule-delivery-card',
  templateUrl: './scheduled-delivery-card.html',
  styleUrls: ['./scheduled-delivery-card.scss'],
  imports: [IonIcon, NgClass, TranslateModule],
})
export class ScheduledDeliveryCardComponent {
  constructor() {
    addIcons({ calendarClearOutline, timeOutline, bus, person, cartOutline });
  }
}
