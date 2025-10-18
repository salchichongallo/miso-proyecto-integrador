import { Component, inject } from '@angular/core';
import { FormControl, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
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
} from '@ionic/angular/standalone';

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
  ],
})
export class SupplierRegistrationPage {
  private readonly router = inject(Router);

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
      validators: [Validators.required, Validators.minLength(2)],
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
    if (this.supplierForm.valid) {
      console.log('Supplier registration data:', this.supplierForm.value);
      // TODO: Implement supplier registration logic
      this.supplierForm.reset();
      this.router.navigate(['/home']);
    }
  }

  public onCancel(): void {
    this.router.navigate(['/home']);
  }
}
