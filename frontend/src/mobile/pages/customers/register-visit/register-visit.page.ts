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
import { MediaService } from '@shared/services/media/media.service';
import { VisitsService } from '@mobile/services/visits/visits.service';
import { CreateVisitRequest } from '@mobile/services/visits/visit.interface';

interface ClientVisit {
  institutionalClient: string;
  contactPerson: string;
  contactPhone: string;
  visitDate: string;
  visitTime: string;
  observations: string;
}

interface MediaFileWithPath extends MediaFile {
  s3Path?: string;
  uploading?: boolean;
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
  selectedMediaFiles: MediaFileWithPath[] = [];

  constructor(
    private readonly fb: FormBuilder,
    private readonly router: Router,
    private readonly customersService: CustomersService,
    private readonly mediaPickerService: MediaPickerService,
    private readonly toastController: ToastController,
    private readonly translate: TranslateService,
    private readonly mediaService: MediaService,
    private readonly visitsService: VisitsService,
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
      contactPhone: [''],
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

    // Check if any files are still uploading
    const stillUploading = this.selectedMediaFiles.some((f) => f.uploading);
    if (stillUploading) {
      await this.showToast(this.translate.instant('customers.visit.error.filesUploading'), 'warning');
      return;
    }

    // Check if any files failed to upload
    const failedUploads = this.selectedMediaFiles.filter((f) => !f.uploading && !f.s3Path);
    if (failedUploads.length > 0) {
      await this.showToast(this.translate.instant('customers.visit.error.uploadFailed'), 'danger');
      return;
    }

    this.isLoading = true;
    this.hasError = false;
    this.errorMessage = '';

    try {
      const visitData: ClientVisit = {
        ...this.visitForm.value,
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
    try {
      // Collect S3 paths from already uploaded files
      const bucketData: string[] = this.selectedMediaFiles
        .filter((f) => f.s3Path)
        .map((f) => f.s3Path as string);

      // Combine date and time into ISO datetime
      const visitDateTime = this.combineDateTime(visitData.visitDate, visitData.visitTime);

      // Create visit request
      const request: CreateVisitRequest = {
        client_id: visitData.institutionalClient,
        contact_name: visitData.contactPerson,
        contact_phone: visitData.contactPhone ?? '',
        visit_datetime: visitDateTime,
        observations: visitData.observations ?? '',
        bucket_data: bucketData,
      };

      // Send request to backend
      await this.visitsService.create(request);
    } catch (error) {
      console.error('Error registering visit:', error);
      throw new Error('customers.visit.error.generic');
    }
  }

  private async convertMediaFileToFile(mediaFile: MediaFile): Promise<File> {
    try {
      const response = await fetch(mediaFile.webPath);
      const blob = await response.blob();
      return new File([blob], mediaFile.name, { type: mediaFile.mimeType });
    } catch (error) {
      console.error('Error converting MediaFile to File:', error);
      throw new Error('Failed to convert media file');
    }
  }

  private combineDateTime(date: string, time: string): string {
    // Combine date and time in ISO format
    return `${date}T${time}:00`;
  }

  async onLoadMedia(): Promise<void> {
    try {
      const files = await this.mediaPickerService.pickMedia(true);

      if (files.length > 0) {
        // Add files to the list with uploading state
        const filesWithPath: MediaFileWithPath[] = files.map((file) => ({
          ...file,
          uploading: true,
        }));
        this.selectedMediaFiles = [...this.selectedMediaFiles, ...filesWithPath];

        // Upload each file to S3
        for (let i = 0; i < filesWithPath.length; i++) {
          try {
            const mediaFile = filesWithPath[i];
            const file = await this.convertMediaFileToFile(mediaFile);
            const uploadResult = await this.mediaService.upload(file);

            // Update the file in the array with the S3 path
            const index = this.selectedMediaFiles.findIndex((f) => f === mediaFile);
            if (index !== -1) {
              this.selectedMediaFiles[index].s3Path = uploadResult.path;
              this.selectedMediaFiles[index].uploading = false;
            }
          } catch (uploadError) {
            console.error('Error uploading file:', uploadError);
            // Mark as failed by removing uploading flag but no s3Path
            const mediaFile = filesWithPath[i];
            const index = this.selectedMediaFiles.findIndex((f) => f === mediaFile);
            if (index !== -1) {
              this.selectedMediaFiles[index].uploading = false;
            }
            await this.showToast(this.translate.instant('customers.visit.mediaUpload.uploadError'), 'danger');
          }
        }

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
