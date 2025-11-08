import { Component, OnInit } from '@angular/core';
import { IonHeader, IonTitle, IonToolbar, IonContent, IonButtons, IonBackButton } from '@ionic/angular/standalone';
import { ScheduledDeliveryCardComponent } from '@mobile/components/schedule-delivery-card/scheduled-delivery-card';

@Component({
  selector: 'app-scheduled-deliveries',
  templateUrl: './scheduled-deliveries.page.html',
  styleUrls: ['./scheduled-deliveries.page.scss'],
  imports: [IonBackButton, IonButtons, IonContent, IonToolbar, IonHeader, IonTitle, ScheduledDeliveryCardComponent],
})
export class ScheduledDeliveriesPage implements OnInit {
  ngOnInit() {
    //...
  }
}
