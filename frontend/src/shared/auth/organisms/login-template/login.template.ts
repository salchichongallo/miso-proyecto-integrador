import { Router } from '@angular/router';
import { Component, inject } from '@angular/core';
import { IonImg, IonThumbnail } from '@ionic/angular/standalone';

import { AppAuthenticatorComponent } from '../app-authenticator/app-authenticator.component';

@Component({
  selector: 'app-login-template',
  templateUrl: 'login.template.html',
  styleUrls: ['login.template.scss'],
  imports: [IonImg, AppAuthenticatorComponent, IonThumbnail],
})
export class LoginTemplate {
  private readonly router = inject(Router);

  async redirectToDashboard() {
    await this.router.navigate(['/']);
  }
}
