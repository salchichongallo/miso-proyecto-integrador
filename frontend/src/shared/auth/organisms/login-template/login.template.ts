import { Router } from '@angular/router';
import { Component, inject } from '@angular/core';
import { Keyboard, KeyboardInfo } from '@capacitor/keyboard';
import { IonImg, IonThumbnail, Platform } from '@ionic/angular/standalone';

import { AppAuthenticatorComponent } from '../app-authenticator/app-authenticator.component';

@Component({
  selector: 'app-login-template',
  templateUrl: 'login.template.html',
  styleUrls: ['login.template.scss'],
  imports: [IonImg, AppAuthenticatorComponent, IonThumbnail],
})
export class LoginTemplate {
  private readonly router = inject(Router);

  private readonly platform = inject(Platform);
  protected keyboardVisible = false;
  protected keyboardHeight = 0;

  async ngOnInit() {
    await this.listenMobileKeyboardEvents();
  }

  private async listenMobileKeyboardEvents() {
    if (this.platform.is('capacitor')) {
      await Keyboard.addListener('keyboardWillShow', (info: KeyboardInfo) => {
        this.keyboardVisible = true;
        this.keyboardHeight = info.keyboardHeight;
      });

      await Keyboard.addListener('keyboardWillHide', () => {
        this.keyboardVisible = false;
        this.keyboardHeight = 0;
      });
    }
  }

  async redirectToDashboard() {
    await this.router.navigate(['/']);
  }

  async ngOnDestroy() {
    if (this.platform.is('capacitor')) {
      await Keyboard.removeAllListeners();
    }
  }
}
