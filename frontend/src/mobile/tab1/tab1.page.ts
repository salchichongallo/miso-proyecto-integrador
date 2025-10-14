import { Component } from '@angular/core';
import { IonHeader, IonToolbar, IonTitle, IonContent } from '@ionic/angular/standalone';
import { AppAuthenticatorComponent } from '@shared/auth/organisms/app-authenticator/app-authenticator.component';

@Component({
  selector: 'app-tab1',
  templateUrl: 'tab1.page.html',
  styleUrls: ['tab1.page.scss'],
  imports: [IonHeader, IonToolbar, IonTitle, IonContent, AppAuthenticatorComponent],
})
export class Tab1Page {}
