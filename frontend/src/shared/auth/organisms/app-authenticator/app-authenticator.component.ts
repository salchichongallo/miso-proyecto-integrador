import { Component, inject, output } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import {
  IonButton,
  IonInput,
  IonList,
  IonItem,
  IonCard,
  IonCardContent,
  IonInputPasswordToggle,
} from '@ionic/angular/standalone';

import { AuthService } from '@shared/auth/auth.service';

@Component({
  selector: 'app-authenticator',
  templateUrl: './app-authenticator.component.html',
  styleUrl: './app-authenticator.component.scss',
  imports: [
    IonCard,
    IonItem,
    IonList,
    ReactiveFormsModule,
    IonButton,
    IonInput,
    IonCardContent,
    IonInputPasswordToggle,
  ],
})
export class AppAuthenticatorComponent {
  private readonly service = inject(AuthService);

  readonly loginSuccessfully = output<void>();

  private fb = inject(FormBuilder);

  protected readonly form = this.fb.group({
    email: this.fb.control('', { nonNullable: true, validators: [Validators.required, Validators.email] }),
    password: this.fb.control('', { nonNullable: true, validators: [Validators.required, Validators.minLength(6)] }),
  });

  async login() {
    if (this.form.valid) {
      const email = this.form.controls.email.value;
      const password = this.form.controls.password.value;

      try {
        await this.service.login(email, password);
        this.form.reset();
        this.loginSuccessfully.emit();
      } catch (error) {
        console.error('Login failed', error);
        this.form.controls.password.reset();
      }
    }
  }
}
