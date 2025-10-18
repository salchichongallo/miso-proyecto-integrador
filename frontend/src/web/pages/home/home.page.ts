import { Component } from '@angular/core';
import { Router } from '@angular/router';

import { IonContent, IonGrid, IonRow, IonCol, IonList, IonItem, IonLabel, IonIcon } from '@ionic/angular/standalone';

import { addIcons } from 'ionicons';
import { chevronForwardOutline, personAdd, business, medkitOutline } from 'ionicons/icons';

@Component({
  selector: 'app-home',
  templateUrl: './home.page.html',
  styleUrls: ['./home.page.scss'],
  imports: [IonContent, IonGrid, IonRow, IonCol, IonList, IonItem, IonLabel, IonIcon],
})
export class HomePage {
  constructor(private readonly router: Router) {
    addIcons({ chevronForwardOutline, personAdd, business, medkitOutline });
  }

  public navigateTo(route: string): void {
    this.router.navigate([route]);
  }
}
