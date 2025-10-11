import { Component, inject } from '@angular/core';
import { AsyncPipe, JsonPipe } from '@angular/common';
import { FormBuilder, ReactiveFormsModule } from '@angular/forms';
import { IonButton, IonInput } from '@ionic/angular/standalone';

import { AuthService } from '../../auth.service';

@Component({
  selector: 'app-authenticator',
  templateUrl: './app-authenticator.component.html',
  imports: [ReactiveFormsModule, JsonPipe, AsyncPipe, IonButton, IonInput],
})
export class AppAuthenticatorComponent {
  service = inject(AuthService);

  fb = inject(FormBuilder);

  form = this.fb.group({
    email: this.fb.control('', { nonNullable: true }),
    password: this.fb.control('', { nonNullable: true }),
  });

  async login() {
    if (this.form.valid) {
      const email = this.form.controls.email.value;
      const password = this.form.controls.password.value;
      await this.service.login(email, password);
      this.form.reset();
    }
  }

  logout() {
    this.service.logout();
  }
}
