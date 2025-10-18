import { Component } from '@angular/core';
import {
  IonContent,
  IonCard,
  IonCardHeader,
  IonCardTitle,
  IonCardContent,
  IonButton,
  IonIcon,
} from '@ionic/angular/standalone';

import { addIcons } from 'ionicons';
import { cloudUploadOutline } from 'ionicons/icons';

@Component({
  selector: 'app-supplier-bulk-upload',
  templateUrl: './supplier-bulk-upload.page.html',
  styleUrls: ['./supplier-bulk-upload.page.scss'],
  imports: [IonContent, IonCard, IonCardHeader, IonCardTitle, IonCardContent, IonButton, IonIcon],
})
export class SupplierBulkUploadPage {
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

  public onProcessFile(): void {
    if (this.selectedFile) {
      console.log('Processing file:', this.selectedFile.name);
      // TODO: Implement file processing logic
    }
  }
}
