import { Component } from '@angular/core';
import { IonHeader, IonTitle, IonContent, IonToolbar, IonButtons, IonBackButton } from '@ionic/angular/standalone';

@Component({
  selector: 'app-vendor-clients-page',
  templateUrl: 'vendor-clients.page.html',
  styleUrls: ['vendor-clients.page.scss'],
  imports: [IonBackButton, IonButtons, IonHeader, IonToolbar, IonTitle, IonContent],
})
export class VendorClientsPage {}
