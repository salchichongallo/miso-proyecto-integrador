import { Component, inject, output } from '@angular/core';
import { AsyncPipe, JsonPipe } from '@angular/common';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { IonButton, IonInput } from '@ionic/angular/standalone';

import { AuthService } from '@shared/auth/auth.service';

@Component({
  selector: 'app-authenticator',
  templateUrl: './app-authenticator.component.html',
  imports: [ReactiveFormsModule, JsonPipe, AsyncPipe, IonButton, IonInput],
})
export class AppAuthenticatorComponent {
  service = inject(AuthService);
  loginSuccessfully = output<void>();

  fb = inject(FormBuilder);

  form = this.fb.group({
    email: this.fb.control('', { nonNullable: true, validators: [Validators.required, Validators.email] }),
    password: this.fb.control('', { nonNullable: true, validators: [Validators.required] }),
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

  logout() {
    this.service.logout();
  }
}
