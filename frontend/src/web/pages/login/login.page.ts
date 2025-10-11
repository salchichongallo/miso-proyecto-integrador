import { Component } from '@angular/core';
import { IonText, IonContent } from '@ionic/angular/standalone';
import { ExploreContainerComponent } from '../../../shared/components/explore-container/explore-container.component';
import { AppAuthenticatorComponent } from '../../../shared/auth/organisms/app-authenticator/app-authenticator.component';

@Component({
  selector: 'web-app-login',
  templateUrl: 'login.page.html',
  imports: [IonContent, IonText, ExploreContainerComponent, AppAuthenticatorComponent],
})
export class LoginPage {}
