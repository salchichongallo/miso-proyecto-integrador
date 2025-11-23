import { addIcons } from 'ionicons';
import { informationCircle } from 'ionicons/icons';
import { toSignal } from '@angular/core/rxjs-interop';
import { Component, computed, inject, signal } from '@angular/core';
import {
  IonHeader,
  IonTitle,
  IonContent,
  IonToolbar,
  IonButtons,
  IonBackButton,
  IonSearchbar,
  IonCard,
  IonIcon,
  IonCardTitle,
  IonCardContent,
} from '@ionic/angular/standalone';

import { SellerService } from '@mobile/services/seller/seller.service';
import { VendorClientCardComponent } from '@mobile/components/vendor-client-card/vendor-client-card.component';

@Component({
  selector: 'app-vendor-clients-page',
  templateUrl: 'vendor-clients.page.html',
  styleUrls: ['vendor-clients.page.scss'],
  imports: [
    IonCardContent,
    IonCardTitle,
    IonIcon,
    IonCard,
    IonBackButton,
    IonButtons,
    IonHeader,
    IonToolbar,
    IonTitle,
    IonContent,
    VendorClientCardComponent,
    IonSearchbar,
  ],
})
export class VendorClientsPage {
  private readonly sellerService = inject(SellerService);

  private readonly allClients = toSignal(this.sellerService.getMyClients(), { initialValue: [] });

  private searchTerm = signal('');

  constructor() {
    addIcons({ informationCircle });
  }

  readonly clients = computed(() => {
    const term = this.searchTerm();
    return this.allClients().filter((client) => {
      const content = JSON.stringify(client).toLowerCase();
      return content.includes(term);
    });
  });

  handleInput(event: Event) {
    const target = event.target as HTMLIonSearchbarElement;
    const query = target.value?.toLowerCase() || '';
    this.searchTerm.set(query.toLowerCase());
  }
}
