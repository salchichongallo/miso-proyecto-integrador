import { addIcons } from 'ionicons';
import { Component, computed, input } from '@angular/core';
import { CurrencyPipe, DatePipe, NgClass } from '@angular/common';
import { IonIcon } from '@ionic/angular/standalone';
import { TranslateModule } from '@ngx-translate/core';
import { calendarClearOutline, timeOutline, bus, person, cartOutline } from 'ionicons/icons';
import { ScheduledOrder } from '@mobile/models/order.model';

@Component({
  selector: 'app-schedule-delivery-card',
  templateUrl: './scheduled-delivery-card.html',
  styleUrls: ['./scheduled-delivery-card.scss'],
  imports: [IonIcon, NgClass, TranslateModule, CurrencyPipe, DatePipe],
})
export class ScheduledDeliveryCardComponent {
  readonly order = input.required<ScheduledOrder>();

  readonly totalSum = computed(() => {
    return this.order().products.reduce((sum, product) => {
      return sum + product.unit_price * product.amount;
    }, 0);
  });

  constructor() {
    addIcons({ calendarClearOutline, timeOutline, bus, person, cartOutline });
  }
}
