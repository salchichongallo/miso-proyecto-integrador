import { Component } from '@angular/core';
import { Router } from '@angular/router';

import { IonGrid, IonRow, IonCol, IonList, IonItem, IonLabel, IonIcon } from '@ionic/angular/standalone';
import { TranslateModule } from '@ngx-translate/core';

import { addIcons } from 'ionicons';
import {
  chevronForwardOutline,
  personAdd,
  business,
  medkitOutline,
  storefrontOutline,
  statsChartOutline,
  trendingUp,
} from 'ionicons/icons';
import { HasRoleDirective } from '@shared/auth';

@Component({
  selector: 'app-home',
  templateUrl: './home.page.html',
  styleUrls: ['./home.page.scss'],
  imports: [IonGrid, IonRow, IonCol, IonList, IonItem, IonLabel, IonIcon, TranslateModule, HasRoleDirective],
})
export class HomePage {
  constructor(private readonly router: Router) {
    addIcons({
      chevronForwardOutline,
      personAdd,
      business,
      medkitOutline,
      storefrontOutline,
      statsChartOutline,
      trendingUp,
    });
  }

  public navigateTo(route: string): void {
    this.router.navigate([route]);
  }
}
