import { addIcons } from 'ionicons';
import { firstValueFrom, skip } from 'rxjs';
import { CurrencyPipe, DecimalPipe } from '@angular/common';
import { informationCircle } from 'ionicons/icons';
import { Component, computed, inject, OnInit, signal } from '@angular/core';
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
  LoadingController,
  ToastController,
  IonIcon,
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
    IonIcon,
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
    CurrencyPipe,
    DecimalPipe,
  ],
})
export class VendorReportPage implements OnInit {
  private readonly sellerService = inject(SellerService);

  private readonly toast = inject(ToastController);

  private readonly loader = inject(LoadingController);

  private readonly fb = inject(FormBuilder);

  readonly sellerForm: FormGroup = this.fb.group({
    seller: ['', Validators.required],
  });

  readonly sellers = signal<SellerItem[]>([]);

  readonly sellerReport = signal<SellerReport | null>(null);

  readonly hasProducts = computed(() => this.sellerReport()?.soldProducts.length! > 0);

  constructor() {
    addIcons({ informationCircle });
  }

  async ngOnInit() {
    await this.loadSellers();
    this.loadReportWhenSelectChanges();
  }

  private loadReportWhenSelectChanges() {
    this.sellerForm.valueChanges.pipe(skip(1)).subscribe(() => {
      this.sellerReport.set(null);
      this.loadReport();
    });
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

  private async loadReport() {
    const loading = await this.showLoader();
    try {
      const data = await this.loadReportData();
      this.sellerReport.set(data);
    } catch (error: any) {
      console.error(error);
      await this.showToastError(error);
    } finally {
      await loading.dismiss();
    }
  }

  private async showLoader() {
    const loading = await this.loader.create({
      message: 'Cargando...',
      keyboardClose: false,
      backdropDismiss: false,
    });
    await loading.present();
    return loading;
  }

  private loadReportData() {
    return this.sellerService.getReport(this.sellerId);
  }

  private async showToastError(error: any) {
    await this.loader.dismiss();
    return this.toast
      .create({ message: `Error al generar reporte. ${error?.message}`, duration: 7000, color: 'danger' })
      .then((toast) => toast.present());
  }

  get sellerId() {
    return this.sellerForm.value.seller;
  }
}
