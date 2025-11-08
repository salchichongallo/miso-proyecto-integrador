import { Component, inject, OnInit, signal } from '@angular/core';

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
import { Vendor } from '../../services/seller/interfaces/vendor.interface';
import { SellerService } from '../../services/seller/seller.service';
import { firstValueFrom } from 'rxjs';

export type SellerItem = Pick<Vendor, 'name' | 'vendor_id'>;

@Component({
  selector: 'app-seller-report',
  templateUrl: 'seller-report.page.html',
  styleUrls: ['./seller-report.page.scss'],
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
  readonly sellers = signal<SellerItem[]>([]);

  private sellerService = inject(SellerService);

  async ngOnInit() {
    await this.loadSellers();
  }

  private async loadSellers() {
    const sellers = await firstValueFrom(this.sellerService.getVendors());
    this.sellers.set(sellers);
  }
}
