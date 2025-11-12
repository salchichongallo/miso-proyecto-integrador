import { Component, inject } from '@angular/core';
import { toSignal } from '@angular/core/rxjs-interop';
import { IonHeader, IonTitle, IonContent, IonToolbar, IonButtons, IonBackButton } from '@ionic/angular/standalone';

import { SellerService } from '@mobile/services/seller/seller.service';
import { VendorClientCardComponent } from '@mobile/components/vendor-client-card/vendor-client-card.component';

@Component({
  selector: 'app-vendor-clients-page',
  templateUrl: 'vendor-clients.page.html',
  styleUrls: ['vendor-clients.page.scss'],
  imports: [IonBackButton, IonButtons, IonHeader, IonToolbar, IonTitle, IonContent, VendorClientCardComponent],
})
export class VendorClientsPage {
  private readonly sellerService = inject(SellerService);

  readonly clients = toSignal(this.sellerService.getMyClients(), { initialValue: [] });
}
