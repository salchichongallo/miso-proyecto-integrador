import { Component } from '@angular/core';
import { Router } from '@angular/router';

import { IonContent, IonGrid, IonRow, IonCol, IonList, IonItem, IonLabel, IonIcon } from '@ionic/angular/standalone';

import { addIcons } from 'ionicons';
import { chevronForwardOutline, personAdd, business } from 'ionicons/icons';

@Component({
  selector: 'app-home',
  templateUrl: './home.page.html',
  styleUrls: ['./home.page.scss'],
  imports: [IonContent, IonGrid, IonRow, IonCol, IonList, IonItem, IonLabel, IonIcon],
})
export class HomePage {
  constructor(private readonly router: Router) {
    addIcons({ chevronForwardOutline, personAdd, business });
  }

  public navigateToSellerRegistration(): void {
    this.router.navigate(['/seller-registration']);
  }

  public navigateToSupplierBulkUpload(): void {
    this.router.navigate(['/supplier-bulk-upload']);
  }
}
