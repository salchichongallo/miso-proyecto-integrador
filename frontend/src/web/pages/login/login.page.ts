import { Component } from '@angular/core';
import { IonText, IonContent } from '@ionic/angular/standalone';
import { ExploreContainerComponent } from '../../../shared/components/explore-container/explore-container.component';

@Component({
  selector: 'web-app-login',
  templateUrl: 'login.page.html',
  imports: [IonContent, IonText, ExploreContainerComponent],
})
export class LoginPage {}
