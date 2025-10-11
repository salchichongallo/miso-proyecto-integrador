import { Component } from '@angular/core';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import {
  IonContent,
  IonCard,
  IonCardHeader,
  IonCardTitle,
  IonCardContent,
  IonItem,
  IonLabel,
  IonInput,
  IonButton,
  IonGrid,
  IonRow,
  IonCol,
} from '@ionic/angular/standalone';

@Component({
  selector: 'app-seller-registration',
  templateUrl: 'seller-registration.page.html',
  styleUrls: ['seller-registration.page.scss'],
  imports: [
    ReactiveFormsModule,
    IonContent,
    IonCard,
    IonCardHeader,
    IonCardTitle,
    IonCardContent,
    IonItem,
    IonLabel,
    IonInput,
    IonButton,
    IonGrid,
    IonRow,
    IonCol,
  ],
})
export class SellerRegistrationPage {
  sellerForm: FormGroup;

  constructor(private readonly fb: FormBuilder) {
    this.sellerForm = this.fb.group({
      name: ['', [Validators.required, Validators.minLength(3)]],
      email: ['', [Validators.required, Validators.email]],
    });
  }

  public get nameControl() {
    return this.sellerForm.get('name');
  }

  public get emailControl() {
    return this.sellerForm.get('email');
  }

  public onCancel(): void {
    this.sellerForm.reset();
  }

  public onSubmit(): void {
    if (this.sellerForm.valid) {
      // TODO: Implement seller registration logic
      this.sellerForm.reset();
    }
  }
}
