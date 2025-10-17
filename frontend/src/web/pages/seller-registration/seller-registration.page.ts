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
  IonIcon,
  ModalController,
} from '@ionic/angular/standalone';
import { LoadingController } from '@ionic/angular';

import { finalize } from 'rxjs';

import { addIcons } from 'ionicons';
import { add, trashOutline } from 'ionicons/icons';

import { AddInstitutionModalComponent } from './components/add-institution-modal/add-institution-modal.component';
import { Institution } from './interfaces/institution.interface';
import { SellerService } from './services/seller/seller.service';
import { RegisterSellerRequest } from './interfaces/register-seller-request.interface';

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
  ) {
    addIcons({ add, trashOutline });
    this.sellerForm = this.fb.group({
      name: ['Leiner', [Validators.required, Validators.minLength(3)]],
      email: ['leiner@gmail.com', [Validators.required, Validators.email]],
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

    const formValue = this.sellerForm.value;
    const name = formValue.name;
    const email = formValue.email;

    const sellerData: RegisterSellerRequest = {
      name,
      email,
      institutions: this.institutions.map((institution) => institution.id),
    };

    this.sellerService
      .registerSeller(sellerData)
      .pipe(finalize(() => this.loadingController.dismiss()))
      .subscribe({
        next: (response) => {
          alert(response.mssg);
          this.sellerForm.reset();
          this.institutions = [];
        },
      });
  }
}
