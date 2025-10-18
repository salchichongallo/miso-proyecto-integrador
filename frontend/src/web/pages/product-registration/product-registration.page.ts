import { Component, inject } from '@angular/core';
import { AbstractControl, FormControl, FormGroup, ReactiveFormsModule, ValidationErrors, Validators } from '@angular/forms';
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
  IonTextarea,
  LoadingController,
  ToastController,
} from '@ionic/angular/standalone';

import { finalize } from 'rxjs';

import { ProductService } from '@web/services/product/product.service';
import { RegisterProductRequest } from './interfaces/register-product-request.interface';
import { ProductFormValue } from './interfaces/product-form-value.interface';

// Custom validator for future dates
function futureDateValidator(control: AbstractControl): ValidationErrors | null {
  if (!control.value) {
    return null;
  }

  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const selectedDate = new Date(control.value);
  selectedDate.setHours(0, 0, 0, 0);

  return selectedDate > today ? null : { futureDate: true };
}

// Custom validator for positive integers
function positiveIntegerValidator(control: AbstractControl): ValidationErrors | null {
  if (!control.value && control.value !== 0) {
    return null;
  }

  const value = Number(control.value);
  if (Number.isInteger(value) && value > 0) {
    return null;
  }

  return { positiveInteger: true };
}

@Component({
  selector: 'app-product-registration',
  templateUrl: './product-registration.page.html',
  styleUrls: ['./product-registration.page.scss'],
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
    IonTextarea,
  ],
})
export class ProductRegistrationPage {
  private readonly router = inject(Router);
  private readonly productService = inject(ProductService);
  private readonly loadingController = inject(LoadingController);
  private readonly toastController = inject(ToastController);

  public readonly productTypes = [
    { value: 'medication', label: 'Medicamento' },
    { value: 'equipment', label: 'Equipo' },
    { value: 'supply', label: 'Insumo' },
    { value: 'device', label: 'Dispositivo' },
  ];

  public readonly productStates = [
    { value: 'Disponible', label: 'Disponible' },
    { value: 'Agotado', label: 'Agotado' },
    { value: 'Vencido', label: 'Vencido' },
    { value: 'Pendiente', label: 'Pendiente' },
  ];

  public readonly productForm = new FormGroup({
    name: new FormControl('', {
      nonNullable: true,
      validators: [Validators.required, Validators.minLength(3)],
    }),
    providerNit: new FormControl('', {
      nonNullable: true,
      validators: [Validators.required, Validators.pattern(/^[0-9\-]+$/)],
    }),
    productType: new FormControl('', {
      nonNullable: true,
      validators: [Validators.required],
    }),
    stock: new FormControl<number | null>(null, {
      validators: [Validators.required, positiveIntegerValidator],
    }),
    lot: new FormControl('', {
      nonNullable: true,
      validators: [Validators.required, Validators.minLength(3)],
    }),
    state: new FormControl('', {
      nonNullable: true,
      validators: [Validators.required],
    }),
    expirationDate: new FormControl('', {
      nonNullable: true,
      validators: [Validators.required, futureDateValidator],
    }),
    requiredTemperature: new FormControl<number | null>(null, {
      validators: [Validators.required],
    }),
    unitValue: new FormControl<number | null>(null, {
      validators: [Validators.required, Validators.min(0)],
    }),
    storageConditions: new FormControl('', {
      nonNullable: true,
      validators: [Validators.required, Validators.minLength(10)],
    }),
  });

  get nameControl(): FormControl<string> | null {
    return this.productForm.get('name') as FormControl<string> | null;
  }

  get providerNitControl(): FormControl<string> | null {
    return this.productForm.get('providerNit') as FormControl<string> | null;
  }

  get productTypeControl(): FormControl<string> | null {
    return this.productForm.get('productType') as FormControl<string> | null;
  }

  get stockControl(): FormControl<number | null> | null {
    return this.productForm.get('stock') as FormControl<number | null> | null;
  }

  get lotControl(): FormControl<string> | null {
    return this.productForm.get('lot') as FormControl<string> | null;
  }

  get stateControl(): FormControl<string> | null {
    return this.productForm.get('state') as FormControl<string> | null;
  }

  get expirationDateControl(): FormControl<string> | null {
    return this.productForm.get('expirationDate') as FormControl<string> | null;
  }

  get requiredTemperatureControl(): FormControl<number | null> | null {
    return this.productForm.get('requiredTemperature') as FormControl<number | null> | null;
  }

  get unitValueControl(): FormControl<number | null> | null {
    return this.productForm.get('unitValue') as FormControl<number | null> | null;
  }

  get storageConditionsControl(): FormControl<string> | null {
    return this.productForm.get('storageConditions') as FormControl<string> | null;
  }

  public onSubmit(): void {
    if (!this.productForm.valid) {
      this.productForm.markAllAsTouched();
      return;
    }

    this.registerProduct();
  }

  public onCancel(): void {
    this.productForm.reset();
    this.router.navigate(['/home']);
  }

  private async registerProduct(): Promise<void> {
    const loading = await this.loadingController.create({
      message: 'Registrando producto...',
    });

    await loading.present();

    const formValue = this.productForm.value as ProductFormValue;

    const productData: RegisterProductRequest = {
      name: formValue.name,
      provider_nit: formValue.providerNit,
      product_type: formValue.productType,
      stock: formValue.stock!,
      expiration_date: formValue.expirationDate,
      temperature_required: formValue.requiredTemperature!,
      batch: formValue.lot,
      status: formValue.state,
      unit_value: formValue.unitValue!,
      storage_conditions: formValue.storageConditions,
    };

    this.productService
      .createProduct(productData)
      .pipe(finalize(() => this.loadingController.dismiss()))
      .subscribe({
        next: () => {
          this.productForm.reset();
          this.showSuccessMessage('Producto registrado exitosamente');
        },
        error: (httpError: HttpErrorResponse) => {
          const message =
            httpError.error?.error ?? httpError.error?.message ?? httpError.message ?? 'Error al registrar el producto.';
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
