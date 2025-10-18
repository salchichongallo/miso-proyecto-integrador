import { Component } from '@angular/core';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { HttpErrorResponse } from '@angular/common/http';

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
  IonIcon,
  ModalController,
  LoadingController,
  ToastController,
} from '@ionic/angular/standalone';

import { finalize } from 'rxjs';

import { addIcons } from 'ionicons';
import { add, trashOutline } from 'ionicons/icons';

import { AddInstitutionModalComponent } from './components/add-institution-modal/add-institution-modal.component';
import { Institution } from './interfaces/institution.interface';
import { SellerService } from './services/seller/seller.service';
import { RegisterSellerRequest } from './interfaces/register-seller-request.interface';
import { SellerFormValue } from './interfaces/seller-form-value.interface';

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
    IonIcon,
  ],
})
export class SellerRegistrationPage {
  sellerForm: FormGroup;
  institutions: Institution[] = [];

  constructor(
    private readonly fb: FormBuilder,
    private readonly modalController: ModalController,
    private readonly sellerService: SellerService,
    private readonly loadingController: LoadingController,
    private readonly toastController: ToastController,
  ) {
    addIcons({ add, trashOutline });
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
    this.institutions = [];
  }

  public onSubmit(): void {
    if (!this.sellerForm.valid) {
      this.sellerForm.markAllAsTouched();
      return;
    }

    this.registerSeller();
  }

  public async openAddInstitutionModal(): Promise<void> {
    const modal = await this.modalController.create({
      component: AddInstitutionModalComponent,
    });

    await modal.present();

    const { data, role } = await modal.onWillDismiss<string>();

    if (role === 'confirm' && data) {
      this.addInstitution(data);
    }
  }

  public addInstitution(name: string): void {
    const newInstitution: Institution = {
      id: this.generateId(),
      name: name,
    };
    this.institutions.push(newInstitution);
  }

  public removeInstitution(id: string): void {
    this.institutions = this.institutions.filter((institution) => institution.id !== id);
  }

  private generateId(): string {
    return `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
  }

  private async registerSeller(): Promise<void> {
    const loading = await this.loadingController.create({
      message: 'Registrando vendedor...',
    });

    loading.present();

    const { name, email } = this.sellerForm.value as SellerFormValue;

    const sellerData: RegisterSellerRequest = {
      name,
      email,
      institutions: this.institutions.map((institution) => institution.id),
    };

    this.sellerService
      .registerSeller(sellerData)
      .pipe(finalize(() => this.loadingController.dismiss()))
      .subscribe({
        next: () => {
          this.sellerForm.reset();
          this.institutions = [];
          this.showSuccessMessage('Vendedor registrado exitosamente.');
        },
        error: (httpError: HttpErrorResponse) => {
          const message =
            httpError.error?.error ??
            httpError.error?.message ??
            httpError.message ??
            'Error al registrar el vendedor.';
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
