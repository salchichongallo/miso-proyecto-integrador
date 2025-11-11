import { Component, inject } from '@angular/core';
import { HttpErrorResponse } from '@angular/common/http';

import {
  IonContent,
  IonCard,
  IonCardHeader,
  IonCardTitle,
  IonCardContent,
  IonButton,
  IonIcon,
  LoadingController,
  ToastController,
} from '@ionic/angular/standalone';

import { finalize } from 'rxjs';

import { addIcons } from 'ionicons';
import { cloudUploadOutline } from 'ionicons/icons';

import { SupplierService } from '@web/services/supplier/supplier.service';

@Component({
  selector: 'app-supplier-bulk-upload',
  templateUrl: './supplier-bulk-upload.page.html',
  styleUrls: ['./supplier-bulk-upload.page.scss'],
  imports: [IonContent, IonCard, IonCardHeader, IonCardTitle, IonCardContent, IonButton, IonIcon],
})
export class SupplierBulkUploadPage {
  private readonly supplierService = inject(SupplierService);
  private readonly loadingController = inject(LoadingController);
  private readonly toastController = inject(ToastController);

  selectedFile: File | null = null;
  fileName = '';

  constructor() {
    addIcons({ cloudUploadOutline });
  }

  public onFileSelected(event: Event): void {
    const input = event.target as HTMLInputElement;
    if (input.files && input.files.length > 0) {
      this.selectedFile = input.files[0];
      this.fileName = this.selectedFile.name;
    }
  }

  public onUploadClick(): void {
    const fileInput = document.getElementById('fileInput') as HTMLInputElement;
    fileInput?.click();
  }

  public async onProcessFile(): Promise<void> {
    if (!this.selectedFile) {
      return;
    }

    const loading = await this.loadingController.create({
      message: 'Procesando archivo de proveedores...',
    });

    await loading.present();

    this.supplierService
      .createBulkSupplier(this.selectedFile)
      .pipe(finalize(() => this.loadingController.dismiss()))
      .subscribe({
        next: () => {
          this.selectedFile = null;
          this.fileName = '';
          this.showSuccessMessage('Proveedores cargados exitosamente.');
        },
        error: (httpError: HttpErrorResponse) => {
          const message =
            httpError.error?.error ??
            httpError.error?.message ??
            httpError.message ??
            'Error al cargar los proveedores.';
          this.showErrorMessage(message);
        },
      });
  }

  private async showSuccessMessage(message: string): Promise<void> {
    const toast = await this.toastController.create({
      message: message,
      duration: 3000,
      position: 'top',
    });

    await toast.present();
  }

  private async showErrorMessage(message: string): Promise<void> {
    const toast = await this.toastController.create({
      message: message,
      duration: 3000,
      position: 'top',
      color: 'danger',
    });

    await toast.present();
  }
}
