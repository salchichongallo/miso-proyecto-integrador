import { Component } from '@angular/core';
import { JsonPipe } from '@angular/common';
import { fetchUserAttributes } from 'aws-amplify/auth';
import { AmplifyAuthenticatorModule } from '@aws-amplify/ui-angular';

@Component({
  selector: 'app-authenticator',
  templateUrl: './app-authenticator.component.html',
  imports: [AmplifyAuthenticatorModule, JsonPipe],
})
export class AppAuthenticatorComponent {
  userAttributes: any;

  async fetchProfile() {
    const attributes = await fetchUserAttributes();
    this.userAttributes = attributes;
  }
}
