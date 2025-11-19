import { Component, Input, inject } from '@angular/core';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { CurrencyPipe } from '@angular/common';
import {
  IonHeader,
  IonToolbar,
  IonTitle,
  IonButtons,
  IonButton,
  IonContent,
  IonItem,
  IonLabel,
  IonInput,
  IonText,
  ModalController,
} from '@ionic/angular/standalone';

import { Product } from '@mobile/models/product.model';

@Component({
  selector: 'app-add-to-cart-modal',
  templateUrl: './add-to-cart-modal.component.html',
  styleUrls: ['./add-to-cart-modal.component.scss'],
  imports: [
    ReactiveFormsModule,
    CurrencyPipe,
    IonHeader,
    IonToolbar,
    IonTitle,
    IonButtons,
    IonButton,
    IonContent,
    IonItem,
    IonLabel,
    IonInput,
    IonText,
  ],
})
export class AddToCartModalComponent {
  @Input() product!: Product;

  private readonly fb = inject(FormBuilder);
  private readonly modalController = inject(ModalController);

  readonly quantityForm: FormGroup;

  constructor() {
    this.quantityForm = this.fb.group({
      quantity: [1, [Validators.required, Validators.min(1)]],
    });
  }

  get quantityControl() {
    return this.quantityForm.get('quantity');
  }

  get maxQuantity(): number {
    return this.product?.stock || 0;
  }

  cancel(): void {
    this.modalController.dismiss(null, 'cancel');
  }

  confirm(): void {
    if (this.quantityForm.valid) {
      const quantity = Number(this.quantityControl?.value);

      if (quantity > this.maxQuantity) {
        this.quantityControl?.setErrors({ max: true });
        return;
      }

      this.modalController.dismiss({ quantity }, 'confirm');
    }
  }
}
