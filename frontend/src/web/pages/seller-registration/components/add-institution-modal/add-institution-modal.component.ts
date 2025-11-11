import { Component, inject, signal } from '@angular/core';
import { toSignal } from '@angular/core/rxjs-interop';
import {
  IonHeader,
  IonToolbar,
  IonTitle,
  IonButton,
  IonContent,
  IonItem,
  IonGrid,
  IonRow,
  IonCol,
  ModalController,
  IonList,
  IonRadio,
  IonRadioGroup,
} from '@ionic/angular/standalone';
import { CustomersService } from '@web/services/customers/customers.service';
import { InstitutionalClient } from '@web/services/customers/institutional-client.interface';

@Component({
  selector: 'app-add-institution-modal',
  templateUrl: './add-institution-modal.component.html',
  styleUrls: ['./add-institution-modal.component.scss'],
  imports: [
    IonList,
    IonHeader,
    IonToolbar,
    IonTitle,
    IonButton,
    IonContent,
    IonItem,
    IonGrid,
    IonRow,
    IonCol,
    IonRadio,
    IonRadioGroup,
  ],
  providers: [CustomersService],
})
export class AddInstitutionModalComponent {
  readonly selectedInstitution = signal<InstitutionalClient | null>(null);

  private readonly customersService = inject(CustomersService);

  readonly availableInstitutions = toSignal(this.customersService.getAll());

  private readonly modalController = inject(ModalController);

  public onCancel() {
    this.modalController.dismiss(null, 'cancel');
  }

  onSubmit(event: Event) {
    event.preventDefault();
    const institution = this.selectedInstitution();
    if (institution) {
      this.modalController.dismiss(institution, 'confirm');
    }
  }

  compareWith(item1: InstitutionalClient, item2: InstitutionalClient) {
    return item1 && item2 ? item1.client_id === item2.client_id : item1 === item2;
  }

  onClientChange(event: Event) {
    const target = event.target as HTMLIonRadioGroupElement;
    this.selectedInstitution.set(target.value);
  }
}
