import { Component, inject } from '@angular/core';
import { AbstractControl, FormControl, FormGroup, ReactiveFormsModule, ValidationErrors, Validators } from '@angular/forms';
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
} from '@ionic/angular/standalone';

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

  public readonly productTypes = [
    { value: 'medication', label: 'Medicamento' },
    { value: 'equipment', label: 'Equipo médico' },
    { value: 'supply', label: 'Insumo' },
    { value: 'device', label: 'Dispositivo' },
  ];

  public readonly productStates = [
    { value: 'available', label: 'Disponible' },
    { value: 'reserved', label: 'Reservado' },
    { value: 'out_of_stock', label: 'Agotado' },
    { value: 'discontinued', label: 'Descontinuado' },
  ];

  public readonly productForm = new FormGroup({
    name: new FormControl('', {
      nonNullable: true,
      validators: [Validators.required, Validators.minLength(3)],
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
    if (this.productForm.valid) {
      console.log('Product registration data:', this.productForm.value);
      // TODO: Implement product registration logic
      this.productForm.reset();
      this.router.navigate(['/home']);
    }
  }

  public onCancel(): void {
    this.router.navigate(['/home']);
  }
}
