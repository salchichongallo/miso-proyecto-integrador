import { addIcons } from 'ionicons';
import { calendarNumber } from 'ionicons/icons';
import { TranslateModule } from '@ngx-translate/core';
import { Component, inject, input, output } from '@angular/core';
import { IonDatetime, IonModal, IonIcon, IonDatetimeButton } from '@ionic/angular/standalone';

import { TranslationService } from '@shared/services/translation';

@Component({
  selector: 'app-date-button',
  templateUrl: './date-button.component.html',
  styleUrl: './date-button.component.scss',
  imports: [IonDatetime, IonModal, IonIcon, IonDatetimeButton, TranslateModule],
})
export class DateButtonComponent {
  readonly label = input.required<string>();

  readonly onChanged = output<string>();

  protected readonly translation = inject(TranslationService);

  constructor() {
    addIcons({ calendarNumber });
  }

  onChange(event: any) {
    const isoDate = new Date(event.detail.value).toISOString();
    this.onChanged.emit(isoDate);
  }
}
