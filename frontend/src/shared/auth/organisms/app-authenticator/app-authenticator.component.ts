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
  LoadingController,
  ToastController,
} from '@ionic/angular/standalone';
import { TranslateModule, TranslateService } from '@ngx-translate/core';

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
    TranslateModule,
  ],
})
export class AppAuthenticatorComponent {
  private readonly service = inject(AuthService);
  private readonly translate = inject(TranslateService);

  readonly loginSuccessfully = output<void>();

  private fb = inject(FormBuilder);

  protected readonly form = this.fb.group({
    email: this.fb.control('', { nonNullable: true, validators: [Validators.required, Validators.email] }),
    password: this.fb.control('', { nonNullable: true, validators: [Validators.required, Validators.minLength(6)] }),
  });

  private readonly loader = inject(LoadingController);

  private toast = inject(ToastController);

  async login() {
    if (this.form.valid) {
      const email = this.form.controls.email.value;
      const password = this.form.controls.password.value;

      const loading = await this.showLoader();
      try {
        await this.service.login(email, password);
        this.form.reset();
        await loading.dismiss();
        this.loginSuccessfully.emit();
      } catch (error) {
        this.form.controls.password.reset();
        await loading.dismiss();
        await this.toast
          .create({ message: this.translate.instant('auth.login.error'), duration: 7000, color: 'danger' })
          .then((toast) => toast.present());
      }
    }
  }

  private async showLoader() {
    const loading = await this.loader.create({
      message: this.translate.instant('auth.login.loading'),
      keyboardClose: false,
      backdropDismiss: false,
    });
    await loading.present();
    return loading;
  }
}
