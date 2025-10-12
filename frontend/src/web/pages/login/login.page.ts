import { IonContent, IonImg } from '@ionic/angular/standalone';

import { Component } from '@angular/core';

import { AppAuthenticatorComponent } from '@shared/auth/organisms/app-authenticator/app-authenticator.component';

@Component({
  selector: 'app-login',
  templateUrl: 'login.page.html',
  styleUrls: ['login.page.scss'],
  imports: [IonImg, IonContent, AppAuthenticatorComponent],
})
export class LoginPage {}
