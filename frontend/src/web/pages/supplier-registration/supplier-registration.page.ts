import { Component, inject } from '@angular/core';
import { FormControl, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { HttpErrorResponse } from '@angular/common/http';
import { Router } from '@angular/router';

import {
  IonContent,
  IonGrid,
  IonRow,
  IonCol,
  IonCard,
  IonCardHeader,
  IonCardTitle,
  IonCardContent,
  IonItem,
  IonLabel,
  IonInput,
  IonButton,
  IonSelect,
  IonSelectOption,
  LoadingController,
  ToastController,
} from '@ionic/angular/standalone';

import { finalize } from 'rxjs';

import { SupplierService } from '@web/services/supplier/supplier.service';
import { RegisterSupplierRequest } from './interfaces/register-supplier-request.interface';
import { SupplierFormValue } from './interfaces/supplier-form-value.interface';
import { LATIN_AMERICA_COUNTRIES } from '@shared/constants/countries.constant';

@Component({
  selector: 'app-supplier-registration',
  templateUrl: './supplier-registration.page.html',
  styleUrls: ['./supplier-registration.page.scss'],
  imports: [
    ReactiveFormsModule,
    IonContent,
    IonGrid,
    IonRow,
    IonCol,
    IonCard,
    IonCardHeader,
    IonCardTitle,
    IonCardContent,
    IonItem,
    IonLabel,
    IonInput,
    IonButton,
    IonSelect,
    IonSelectOption,
  ],
})
export class SupplierRegistrationPage {
  private readonly router = inject(Router);
  private readonly supplierService = inject(SupplierService);
  private readonly loadingController = inject(LoadingController);
  private readonly toastController = inject(ToastController);

  public readonly countries = LATIN_AMERICA_COUNTRIES;

  public readonly supplierForm = new FormGroup({
    name: new FormControl('', {
      nonNullable: true,
      validators: [Validators.required, Validators.minLength(3)],
    }),
    email: new FormControl('', {
      nonNullable: true,
      validators: [Validators.required, Validators.email],
    }),
    phone: new FormControl('', {
      nonNullable: true,
      validators: [Validators.required, Validators.pattern(/^[0-9+\-\s()]+$/)],
    }),
    country: new FormControl('', {
      nonNullable: true,
      validators: [Validators.required],
    }),
    nit: new FormControl('', {
      nonNullable: true,
      validators: [Validators.required, Validators.pattern(/^[0-9\-]+$/)],
    }),
    address: new FormControl('', {
      nonNullable: true,
      validators: [Validators.required, Validators.minLength(5)],
    }),
  });

  get nameControl(): FormControl<string> | null {
    return this.supplierForm.get('name') as FormControl<string> | null;
  }

  get emailControl(): FormControl<string> | null {
    return this.supplierForm.get('email') as FormControl<string> | null;
  }

  get phoneControl(): FormControl<string> | null {
    return this.supplierForm.get('phone') as FormControl<string> | null;
  }

  get countryControl(): FormControl<string> | null {
    return this.supplierForm.get('country') as FormControl<string> | null;
  }

  get nitControl(): FormControl<string> | null {
    return this.supplierForm.get('nit') as FormControl<string> | null;
  }

  get addressControl(): FormControl<string> | null {
    return this.supplierForm.get('address') as FormControl<string> | null;
  }

  public onSubmit(): void {
    if (!this.supplierForm.valid) {
      this.supplierForm.markAllAsTouched();
      return;
    }

    this.registerSupplier();
  }

  public onCancel(): void {
    this.supplierForm.reset();
    this.router.navigate(['/home']);
  }

  private async registerSupplier(): Promise<void> {
    const loading = await this.loadingController.create({
      message: 'Registrando proveedor...',
    });

    await loading.present();

    const { name, email, phone, country, nit, address } = this.supplierForm.value as SupplierFormValue;

    const supplierData: RegisterSupplierRequest = {
      name,
      email,
      phone,
      country,
      nit,
      address,
    };

    this.supplierService
      .createSupplier(supplierData)
      .pipe(finalize(() => this.loadingController.dismiss()))
      .subscribe({
        next: () => {
          this.supplierForm.reset();
          this.showSuccessMessage('Proveedor registrado exitosamente.');
        },
        error: (httpError: HttpErrorResponse) => {
          const message =
            httpError.error?.error ?? httpError.error?.message ?? httpError.message ?? 'Error al registrar el proveedor.';
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
