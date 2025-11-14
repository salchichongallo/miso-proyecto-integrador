import { Component, inject, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';

import { addIcons } from 'ionicons';
import { arrowBack, calendarOutline, timeOutline, cloudUploadOutline } from 'ionicons/icons';

import {
  IonHeader,
  IonToolbar,
  IonTitle,
  IonContent,
  IonButtons,
  IonBackButton,
  IonButton,
  IonItem,
  IonLabel,
  IonInput,
  IonSelect,
  IonSelectOption,
  IonIcon,
  IonSpinner,
} from '@ionic/angular/standalone';
import { TranslateModule } from '@ngx-translate/core';
import { CustomersService } from '@mobile/services/customers/customers.service';
import { InstitutionalClientData } from '@mobile/models';

interface ClientVisit {
  institutionalClient: string;
  contactPerson: string;
  visitDate: string;
  visitTime: string;
  observations: string;
  mediaFiles?: File[];
}

@Component({
  selector: 'app-register-visit-page',
  templateUrl: 'register-visit.page.html',
  styleUrls: ['register-visit.page.scss'],
  imports: [
    ReactiveFormsModule,
    IonHeader,
    IonToolbar,
    IonTitle,
    IonContent,
    IonButtons,
    IonBackButton,
    IonButton,
    IonItem,
    IonLabel,
    IonInput,
    IonSelect,
    IonSelectOption,
    IonSpinner,
    TranslateModule,
  ],
})
export class RegisterVisitPage implements OnInit {
  visitForm!: FormGroup;
  isLoading = false;
  hasError = false;
  errorMessage = '';

  institutionalClients: Array<InstitutionalClientData> = [];
  contactPersons: Array<{ id: string; name: string }> = [];

  private readonly customersService = inject(CustomersService);

  constructor(
    private readonly fb: FormBuilder,
    private readonly router: Router,
  ) {
    addIcons({ arrowBack, calendarOutline, timeOutline, cloudUploadOutline });
  }

  ngOnInit(): void {
    this.initForm();
    this.loadData();
  }

  private initForm(): void {
    this.visitForm = this.fb.group({
      institutionalClient: ['', [Validators.required]],
      contactPerson: ['', [Validators.required]],
      visitDate: ['', [Validators.required]],
      visitTime: ['', [Validators.required]],
      observations: [''],
    });
  }

  private loadData(): void {
    this.contactPersons = [
      { id: '1', name: 'Dr. Juan Pérez' },
      { id: '2', name: 'Dra. María García' },
      { id: '3', name: 'Dr. Carlos Rodríguez' },
    ];

    this.customersService.getInstitutionalClients().subscribe({
      next: (data) => {
        this.institutionalClients = data;
      },
    });
  }

  async onSubmit(): Promise<void> {
    if (this.visitForm.invalid) {
      this.visitForm.markAllAsTouched();
      return;
    }

    this.isLoading = true;
    this.hasError = false;
    this.errorMessage = '';

    try {
      const visitData: ClientVisit = this.visitForm.value;
      await this.registerVisit(visitData);

      this.visitForm.reset();

      // Navigate back on success
      await this.router.navigate(['/tabs/customers']);
    } catch (error) {
      this.hasError = true;
      this.errorMessage = error instanceof Error ? error.message : 'customers.visit.error.generic';
    } finally {
      this.isLoading = false;
    }
  }

  private async registerVisit(visitData: ClientVisit): Promise<void> {
    // Simulate HTTP call that can fail
    return new Promise((resolve, reject) => {
      setTimeout(() => {
        // Simulate random error for demonstration
        const shouldFail = Math.random() > 0.7;
        if (shouldFail) {
          reject(new Error('customers.visit.error.generic'));
        } else {
          resolve();
        }
      }, 1500);
    });
  }

  onLoadMedia(): void {
    // TODO: Implement media upload functionality
    console.log('Load media clicked');
  }
}
