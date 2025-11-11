import { Component, effect, EventEmitter, inject, Input, OnInit, Output, signal } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';

import {
  IonCard,
  IonCardHeader,
  IonCardTitle,
  IonCardContent,
  IonIcon,
  IonList,
  IonItem,
  IonSelect,
  IonSelectOption,
  IonButton,
  IonLabel,
} from '@ionic/angular/standalone';

import { addIcons } from 'ionicons';
import { filterOutline } from 'ionicons/icons';

import { ClientService } from '@web/services/client/client.service';
import { Client } from '@web/services/client/interfaces/client.interface';
import { RouteGenerationParams } from '@web/pages/delivery-routes/interfaces/route-generation-params.interface';

@Component({
  selector: 'app-route-configuration',
  templateUrl: './route-configuration.component.html',
  styleUrl: './route-configuration.component.scss',
  imports: [
    ReactiveFormsModule,
    IonCard,
    IonCardHeader,
    IonCardTitle,
    IonCardContent,
    IonIcon,
    IonList,
    IonItem,
    IonSelect,
    IonSelectOption,
    IonButton,
    IonLabel,
  ],
})
export class RouteConfigurationComponent implements OnInit {
  @Input() isLoading = false;
  @Output() readonly onGenerateRoutes = new EventEmitter<RouteGenerationParams>();

  protected readonly fb = inject(FormBuilder);
  protected readonly clientService = inject(ClientService);

  protected readonly clients = signal<Client[]>([]);
  protected readonly isLoadingClients = signal(true);

  protected readonly form = this.fb.group({
    clientId: this.fb.control<string>('', {
      nonNullable: true,
      validators: [Validators.required],
    }),
  });

  constructor() {
    addIcons({ filterOutline });

    effect(() => {
      const shouldDisable = this.isLoadingClients() || this.isLoading;
      const control = this.form.controls.clientId;

      if (shouldDisable && control.enabled) {
        control.disable();
      } else if (!shouldDisable && control.disabled) {
        control.enable();
      }
    });
  }

  public async ngOnInit(): Promise<void> {
    await this.loadClients();
  }

  protected submit(): void {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }

    this.onGenerateRoutes.emit(this.form.getRawValue());
  }

  private async loadClients(): Promise<void> {
    this.isLoadingClients.set(true);

    this.clientService.getClients().subscribe({
      next: (clients) => {
        this.clients.set(clients);
        this.isLoadingClients.set(false);
      },
      error: (error) => {
        console.error('Error loading clients:', error);
        this.isLoadingClients.set(false);
      },
    });
  }

  protected get clientIdControl() {
    return this.form.controls.clientId;
  }
}
