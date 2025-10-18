import { Component } from '@angular/core';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import {
  IonHeader,
  IonToolbar,
  IonTitle,
  IonContent,
  IonButtons,
  IonBackButton,
  IonCard,
  IonCardContent,
  IonInput,
  IonButton,
  IonSelect,
  IonSelectOption,
  IonTextarea,
  LoadingController,
  ToastController,
} from '@ionic/angular/standalone';

import { finalize } from 'rxjs';

import { CreateInstitutionalClientRequest } from '@mobile/models/institutional-client.model';
import { LATIN_AMERICA_COUNTRIES, Country } from '@mobile/constants/countries.constant';
import { CARE_LEVELS, CareLevel } from '@mobile/constants/care-levels.constant';
import { MEDICAL_SPECIALTIES } from '@mobile/constants/specialties.constant';
import { CustomersService } from '@mobile/services/customers/customers.service';

@Component({
  selector: 'app-register-institutional',
  templateUrl: 'register-institutional.page.html',
  styleUrls: ['register-institutional.page.scss'],
  imports: [
    ReactiveFormsModule,
    IonHeader,
    IonToolbar,
    IonTitle,
    IonContent,
    IonButtons,
    IonBackButton,
    IonCard,
    IonCardContent,
    IonInput,
    IonButton,
    IonSelect,
    IonSelectOption,
    IonTextarea,
  ],
})
export class RegisterInstitutionalPage {
  institutionalClientForm: FormGroup;

  readonly countries: Country[] = LATIN_AMERICA_COUNTRIES;
  readonly careLevels: CareLevel[] = CARE_LEVELS;
  readonly specialties: string[] = MEDICAL_SPECIALTIES;

  constructor(
    private readonly fb: FormBuilder,
    private readonly router: Router,
    private readonly customerService: CustomersService,
    private readonly loadingController: LoadingController,
    private readonly toastController: ToastController,
  ) {
    this.institutionalClientForm = this.fb.group({
      taxId: ['', [Validators.required, Validators.maxLength(20)]],
      companyName: ['', [Validators.required, Validators.maxLength(100)]],
      country: ['', [Validators.required]],
      careLevel: ['', [Validators.required]],
      specialty: ['', [Validators.required]],
      location: ['', [Validators.required, Validators.maxLength(200)]],
    });
  }

  public cancelRegister(): void {
    this.router.navigate(['/tabs/customers']);
  }

  public async submit(): Promise<void> {
    if (!this.institutionalClientForm.valid) {
      this.institutionalClientForm.markAllAsTouched();
      return;
    }

    const formData = this.institutionalClientForm.value;
    const careLevel = this.careLevels.find((level) => level.value === formData.careLevel);
    const dataToSend: CreateInstitutionalClientRequest = {
      name: formData.companyName,
      tax_id: formData.taxId,
      country: formData.country,
      level: careLevel?.roman ?? '',
      specialty: formData.specialty,
      location: formData.location,
    };

    const loading = await this.loadingController.create({
      message: 'Registrando cliente institucional...',
    });

    loading.present();

    this.customerService
      .createInstitutionalClient(dataToSend)
      .pipe(finalize(() => loading.dismiss()))
      .subscribe({
        next: () => {
          this.institutionalClientForm.reset();
          this.router.navigate(['/tabs/customers']);
          this.showSuccessMessage('Cliente institucional registrado exitosamente.');
        },
        error: (error) => {
          this.showErrorMessage(
            error.error?.error ??
              error.error?.message ??
              error.message ??
              'Error al registrar el cliente institucional.',
          );
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
      position: 'bottom',
      color: 'danger',
    });

    await toast.present();
  }
}
