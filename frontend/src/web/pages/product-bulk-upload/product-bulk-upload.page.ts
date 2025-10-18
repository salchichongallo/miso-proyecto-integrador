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

import { ProductService } from '@web/services/product/product.service';

@Component({
  selector: 'app-product-bulk-upload',
  templateUrl: './product-bulk-upload.page.html',
  styleUrls: ['./product-bulk-upload.page.scss'],
  imports: [IonContent, IonCard, IonCardHeader, IonCardTitle, IonCardContent, IonButton, IonIcon],
})
export class ProductBulkUploadPage {
  private readonly productService = inject(ProductService);
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
      message: 'Procesando archivo de productos...',
    });

    await loading.present();

    this.productService
      .createBulkProduct(this.selectedFile)
      .pipe(finalize(() => this.loadingController.dismiss()))
      .subscribe({
        next: () => {
          this.selectedFile = null;
          this.fileName = '';
          this.showSuccessMessage('Productos cargados exitosamente.');
        },
        error: (httpError: HttpErrorResponse) => {
          const message =
            httpError.error?.error ?? httpError.error?.message ?? httpError.message ?? 'Error al cargar los productos.';
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
