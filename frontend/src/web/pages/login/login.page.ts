import { Component } from '@angular/core';
import { IonContent } from '@ionic/angular/standalone';

import { LoginTemplate } from '@shared/auth';

@Component({
  selector: 'app-web-login',
  templateUrl: 'login.page.html',
  imports: [IonContent, LoginTemplate],
  styleUrl: 'login.page.scss',
})
export class LoginPage {}
