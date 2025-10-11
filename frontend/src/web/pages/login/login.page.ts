import { Component } from '@angular/core';
import { IonText, IonContent, IonButton } from '@ionic/angular/standalone';
import { RouterLink } from '@angular/router';
import { ExploreContainerComponent } from '@shared/components/explore-container/explore-container.component';

@Component({
  selector: 'app-login',
  templateUrl: 'login.page.html',
  imports: [IonContent, IonText, IonButton, RouterLink, ExploreContainerComponent],
})
export class LoginPage {}
