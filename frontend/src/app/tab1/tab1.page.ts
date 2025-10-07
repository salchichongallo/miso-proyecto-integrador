import { Component, OnInit, inject } from '@angular/core';
import {
  IonHeader,
  IonToolbar,
  IonTitle,
  IonContent,
  IonCard,
  IonCardHeader,
  IonCardTitle,
  IonCardContent,
} from '@ionic/angular/standalone';
import { ExploreContainerComponent } from '../explore-container/explore-container.component';
import { PlatformService, PlatformFeatures } from '../services/platform.service';

@Component({
  selector: 'app-tab1',
  templateUrl: 'tab1.page.html',
  styleUrls: ['tab1.page.scss'],
  imports: [
    IonHeader,
    IonToolbar,
    IonTitle,
    IonContent,
    IonCard,
    IonCardHeader,
    IonCardTitle,
    IonCardContent,
    ExploreContainerComponent,
  ],
})
export class Tab1Page implements OnInit {
  private platformService = inject(PlatformService);

  platformInfo: {
    name: string;
    isWeb: boolean;
    isMobile: boolean;
    features: PlatformFeatures;
  } = {
    name: '',
    isWeb: false,
    isMobile: false,
    features: {
      pushNotifications: false,
      biometricAuth: false,
      camera: false,
      geolocation: false,
      fileSystem: false,
      nativeStorage: false,
    },
  };

  ngOnInit() {
    this.platformInfo = {
      name: this.platformService.platformName,
      isWeb: this.platformService.isWeb,
      isMobile: this.platformService.isMobile,
      features: this.platformService.features,
    };

    this.platformService.log('Tab1Page initialized');
  }
}
