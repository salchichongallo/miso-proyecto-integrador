import { Component, OnInit } from '@angular/core';

import {
  IonContent,
  IonCard,
  IonCardHeader,
  IonCardTitle,
  IonCardContent,
  IonItem,
  IonSelect,
  IonSelectOption,
  IonButton,
  IonText,
  IonList,
  IonLabel,
} from '@ionic/angular/standalone';

@Component({
  selector: 'app-vendor-report',
  templateUrl: 'vendor-report.page.html',
  styleUrls: ['./vendor-report.page.scss'],
  standalone: true,
  imports: [
    IonContent,
    IonCard,
    IonCardHeader,
    IonCardTitle,
    IonCardContent,
    IonItem,
    IonSelect,
    IonSelectOption,
    IonButton,
    IonText,
    IonList,
    IonLabel,
  ],
})
export class VendorReportPage implements OnInit {
  ngOnInit() {
    // ...
  }
}
