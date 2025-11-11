import { Component, Input } from '@angular/core';
import {
  FormBuilder,
  FormGroup,
  Validators,
  ReactiveFormsModule,
  AbstractControl,
  ValidationErrors,
} from '@angular/forms';

import {
  IonHeader,
  IonToolbar,
  IonTitle,
  IonButtons,
  IonButton,
  IonContent,
  IonItem,
  IonLabel,
  IonSelect,
  IonSelectOption,
  IonInput,
  ModalController,
} from '@ionic/angular/standalone';

import { Product } from '@mobile/models/product.model';
import { ProductFormItem } from '../../interfaces/product-form-item.interface';

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

function positiveNumberValidator(control: AbstractControl): ValidationErrors | null {
  if (!control.value && control.value !== 0) {
    return null;
  }
  const value = Number(control.value);
  if (!isNaN(value) && value >= 0) {
    return null;
  }
  return { positiveNumber: true };
}

@Component({
  selector: 'app-add-product-modal',
  templateUrl: 'add-product-modal.component.html',
  styleUrls: ['add-product-modal.component.scss'],
  imports: [
    ReactiveFormsModule,
    IonHeader,
    IonToolbar,
    IonTitle,
    IonButtons,
    IonButton,
    IonContent,
    IonItem,
    IonLabel,
    IonSelect,
    IonSelectOption,
    IonInput,
  ],
})
export class AddProductModalComponent {
  @Input() products: Product[] = [];

  productForm: FormGroup;

  constructor(
    private readonly fb: FormBuilder,
    private readonly modalController: ModalController,
  ) {
    this.productForm = this.fb.group({
      product_id: ['', [Validators.required]],
      target_units: ['', [Validators.required, positiveIntegerValidator]],
      target_value: ['', [Validators.required, positiveNumberValidator]],
    });
  }

  public get productIdControl() {
    return this.productForm.get('product_id');
  }

  public get targetUnitsControl() {
    return this.productForm.get('target_units');
  }

  public get targetValueControl() {
    return this.productForm.get('target_value');
  }

  public cancel(): void {
    this.modalController.dismiss(null, 'cancel');
  }

  public confirm(): void {
    if (!this.productForm.valid) {
      this.productForm.markAllAsTouched();
      return;
    }

    const { product_id, target_units, target_value } = this.productForm.value;
    const selectedProduct = this.products.find((p) => p.id === product_id);

    if (!selectedProduct) {
      return;
    }

    const productData: ProductFormItem = {
      id: '',
      product_id: selectedProduct.id,
      name: selectedProduct.name,
      target_units: Number(target_units),
      target_value: Number(target_value),
    };

    this.modalController.dismiss(productData, 'confirm');
  }
}
