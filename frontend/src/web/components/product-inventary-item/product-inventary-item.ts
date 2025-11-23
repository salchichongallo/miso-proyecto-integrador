import { NgClass } from '@angular/common';
import { Component, computed, input } from '@angular/core';
import { IonText, IonIcon } from '@ionic/angular/standalone';
import { TranslateModule } from '@ngx-translate/core';

import { addIcons } from 'ionicons';
import { location as locationIcon, calendarNumber, alertCircle } from 'ionicons/icons';

import { Product } from '@mobile/models/product.model';

@Component({
  selector: 'app-product-inventary-item',
  templateUrl: './product-inventary-item.html',
  styleUrl: './product-inventary-item.scss',
  imports: [IonIcon, IonText, NgClass, TranslateModule],
})
export class ProductInventaryItem {
  readonly product = input.required<Product>();

  constructor() {
    addIcons({ location: locationIcon, calendarNumber, alertCircle });
  }

  readonly expirationDate = computed(() => new Date(this.product().expiration_date));

  readonly remainingDays = computed(() => {
    const today = new Date();
    const expiration = this.expirationDate();
    const diff = expiration.getTime() - today.getTime();
    return Math.ceil(diff / (1000 * 3600 * 24));
  });

  readonly expiringSoon = computed(() => this.remainingDays() < 30);
}
