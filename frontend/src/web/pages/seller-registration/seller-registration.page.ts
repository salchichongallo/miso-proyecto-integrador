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

import { addIcons } from 'ionicons';
import { add, trashOutline } from 'ionicons/icons';

import { AddInstitutionModalComponent } from './components/add-institution-modal/add-institution-modal.component';
import { Institution } from './interfaces/institution.interface';

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
    private readonly modalController: ModalController
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
    if (this.sellerForm.valid) {
      // TODO: Implement seller registration logic
      this.sellerForm.reset();
      this.institutions = [];
    }
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
}
