import { firstValueFrom } from 'rxjs';
import { Component, inject, OnInit, signal } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';

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

import { SellerReport } from './interfaces/seller-report.interface';

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
    ReactiveFormsModule,
  ],
})
export class VendorReportPage implements OnInit {
  readonly sellers = signal<SellerItem[]>([]);

  private readonly sellerService = inject(SellerService);
  private readonly fb = inject(FormBuilder);

  readonly sellerForm: FormGroup = this.fb.group({
    seller: ['', Validators.required],
  });

  readonly report = signal<SellerReport | null>(null);

  async ngOnInit() {
    await this.loadSellers();
  }

  private async loadSellers() {
    const sellers = await firstValueFrom(this.sellerService.getVendors());
    this.sellers.set(sellers);
  }

  async submit() {
    if (this.sellerForm.valid) {
      await this.loadReport();
    }
  }

  async loadReport() {
    // ...
  }

  get sellerId() {
    return this.sellerForm.value.seller;
  }
}
