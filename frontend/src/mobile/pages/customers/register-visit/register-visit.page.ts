import { Component, inject, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';

import { addIcons } from 'ionicons';
import {
  arrowBack,
  calendarOutline,
  timeOutline,
  cloudUploadOutline,
  closeCircle,
  videocam,
  image,
} from 'ionicons/icons';

import {
  IonHeader,
  IonToolbar,
  IonTitle,
  IonContent,
  IonButtons,
  IonBackButton,
  IonButton,
  IonItem,
  IonLabel,
  IonInput,
  IonSelect,
  IonSelectOption,
  IonIcon,
  IonSpinner,
  ToastController,
} from '@ionic/angular/standalone';
import { TranslateModule, TranslateService } from '@ngx-translate/core';
import { CustomersService } from '@mobile/services/customers/customers.service';
import { InstitutionalClientData } from '@mobile/models';
import { MediaPickerService, MediaFile } from '@mobile/services/media-picker/media-picker.service';

interface ClientVisit {
  institutionalClient: string;
  contactPerson: string;
  visitDate: string;
  visitTime: string;
  observations: string;
  mediaFiles?: MediaFile[];
}

@Component({
  selector: 'app-register-visit-page',
  templateUrl: 'register-visit.page.html',
  styleUrls: ['register-visit.page.scss'],
  imports: [
    ReactiveFormsModule,
    IonHeader,
    IonToolbar,
    IonTitle,
    IonContent,
    IonButtons,
    IonBackButton,
    IonButton,
    IonItem,
    IonLabel,
    IonInput,
    IonSelect,
    IonSelectOption,
    IonSpinner,
    TranslateModule,
    IonIcon,
  ],
})
export class RegisterVisitPage implements OnInit {
  visitForm!: FormGroup;
  isLoading = false;
  hasError = false;
  errorMessage = '';

  institutionalClients: Array<InstitutionalClientData> = [];
  contactPersons: Array<{ id: string; name: string }> = [];
  selectedMediaFiles: MediaFile[] = [];

  constructor(
    private readonly fb: FormBuilder,
    private readonly router: Router,
    private readonly customersService: CustomersService,
    private readonly mediaPickerService: MediaPickerService,
    private readonly toastController: ToastController,
    private readonly translate: TranslateService,
  ) {
    addIcons({ arrowBack, calendarOutline, timeOutline, cloudUploadOutline, closeCircle, videocam, image });
  }

  ngOnInit(): void {
    this.initForm();
    this.loadData();
  }

  private initForm(): void {
    this.visitForm = this.fb.group({
      institutionalClient: ['', [Validators.required]],
      contactPerson: ['', [Validators.required]],
      visitDate: ['', [Validators.required]],
      visitTime: ['', [Validators.required]],
      observations: [''],
    });
  }

  private loadData(): void {
    this.contactPersons = [
      { id: '1', name: 'Dr. Juan Pérez' },
      { id: '2', name: 'Dra. María García' },
      { id: '3', name: 'Dr. Carlos Rodríguez' },
    ];

    this.customersService.getInstitutionalClients().subscribe({
      next: (data) => {
        this.institutionalClients = data;
      },
    });
  }

  async onSubmit(): Promise<void> {
    if (this.visitForm.invalid) {
      this.visitForm.markAllAsTouched();
      return;
    }

    this.isLoading = true;
    this.hasError = false;
    this.errorMessage = '';

    try {
      const visitData: ClientVisit = {
        ...this.visitForm.value,
        mediaFiles: this.selectedMediaFiles,
      };
      await this.registerVisit(visitData);

      // Get client and contact names for summary
      const selectedClient = this.institutionalClients.find((c) => c.client_id === visitData.institutionalClient);
      const clientName = selectedClient?.name || visitData.institutionalClient;
      const contactName = visitData.contactPerson;

      // Format date and time for display
      const dateTime = `${visitData.visitDate} ${visitData.visitTime}`;

      // Navigate to confirmation page with summary data
      await this.router.navigate(['/customers/visit-confirmation'], {
        state: {
          visitSummary: {
            client: clientName,
            contact: contactName,
            dateTime: dateTime,
            mediaCount: this.selectedMediaFiles.length,
          },
        },
      });
    } catch (error) {
      this.hasError = true;
      this.errorMessage = error instanceof Error ? error.message : 'customers.visit.error.generic';
    } finally {
      this.isLoading = false;
    }
  }

  protected async registerVisit(visitData: ClientVisit): Promise<void> {
    // Simulate HTTP call that can fail
    return new Promise((resolve, reject) => {
      setTimeout(() => {
        // Simulate random error for demonstration
        const shouldFail = true;
        if (shouldFail) {
          reject(new Error('customers.visit.error.generic'));
        } else {
          resolve();
        }
      }, 1500);
    });
  }

  async onLoadMedia(): Promise<void> {
    try {
      const files = await this.mediaPickerService.pickMedia(true);

      if (files.length > 0) {
        this.selectedMediaFiles = [...this.selectedMediaFiles, ...files];
        await this.showToast(
          this.translate.instant('customers.visit.mediaUpload.success', {
            count: files.length,
          }),
          'success',
        );
      }
    } catch (error) {
      console.error('Error picking media:', error);
      await this.showToast(this.translate.instant('customers.visit.mediaUpload.error'), 'danger');
    }
  }

  removeMediaFile(index: number): void {
    this.selectedMediaFiles.splice(index, 1);
  }

  getFileIcon(file: MediaFile): string {
    return this.mediaPickerService.isVideo(file) ? 'videocam' : 'image';
  }

  formatFileSize(file: MediaFile): string {
    return this.mediaPickerService.formatFileSize(file.size);
  }

  getFilePreview(file: MediaFile): string {
    return this.mediaPickerService.getFilePreview(file);
  }

  isImageFile(file: MediaFile): boolean {
    return this.mediaPickerService.isImage(file);
  }

  isVideoFile(file: MediaFile): boolean {
    return this.mediaPickerService.isVideo(file);
  }

  onRetry(): void {
    this.hasError = false;
    this.errorMessage = '';
    this.selectedMediaFiles = [];
    this.visitForm.reset();
  }

  private async showToast(message: string, color: 'success' | 'danger' | 'warning' = 'success'): Promise<void> {
    const toast = await this.toastController.create({
      message,
      duration: 3000,
      position: 'bottom',
      color,
    });
    await toast.present();
  }
}
