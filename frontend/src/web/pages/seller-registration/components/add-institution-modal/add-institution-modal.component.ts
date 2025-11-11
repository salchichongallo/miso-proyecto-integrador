import { Component } from '@angular/core';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import {
  IonHeader,
  IonToolbar,
  IonTitle,
  IonButton,
  IonContent,
  IonItem,
  IonLabel,
  IonInput,
  IonGrid,
  IonRow,
  IonCol,
  ModalController,
} from '@ionic/angular/standalone';

@Component({
  selector: 'app-add-institution-modal',
  templateUrl: './add-institution-modal.component.html',
  styleUrls: ['./add-institution-modal.component.scss'],
  imports: [
    ReactiveFormsModule,
    IonHeader,
    IonToolbar,
    IonTitle,
    IonButton,
    IonContent,
    IonItem,
    IonLabel,
    IonInput,
    IonGrid,
    IonRow,
    IonCol,
  ],
})
export class AddInstitutionModalComponent {
  institutionForm: FormGroup;

  constructor(
    private readonly fb: FormBuilder,
    private readonly modalController: ModalController,
  ) {
    this.institutionForm = this.fb.group({
      name: ['', [Validators.required, Validators.minLength(3)]],
    });
  }

  public get nameControl() {
    return this.institutionForm.get('name');
  }

  public onCancel(): void {
    this.modalController.dismiss(null, 'cancel');
  }

  public onAdd(): void {
    if (this.institutionForm.valid) {
      const institutionName = this.institutionForm.value.name;
      this.modalController.dismiss(institutionName, 'confirm');
    }
  }
}
