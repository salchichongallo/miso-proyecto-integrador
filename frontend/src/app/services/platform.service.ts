import { Injectable, inject } from '@angular/core';
import { Platform } from '@ionic/angular/standalone';
import { environment } from '../../environments/environment';

export interface PlatformFeatures {
  pushNotifications: boolean;
  biometricAuth: boolean;
  camera: boolean;
  geolocation: boolean;
  fileSystem: boolean;
  nativeStorage: boolean;
}

@Injectable({
  providedIn: 'root',
})
export class PlatformService {
  private platform = inject(Platform);

  get isWeb(): boolean {
    return environment.platform === 'web' || this.platform.is('desktop');
  }

  get isMobile(): boolean {
    return environment.platform === 'mobile' || this.platform.is('mobile');
  }

  get isCapacitor(): boolean {
    return this.platform.is('capacitor');
  }

  get isIOS(): boolean {
    return this.platform.is('ios');
  }

  get isAndroid(): boolean {
    return this.platform.is('android');
  }

  get features(): PlatformFeatures {
    return environment.features;
  }

  get platformName(): string {
    return environment.platform;
  }

  get apiUrl(): string {
    return environment.apiUrl;
  }

  isFeatureAvailable(feature: keyof PlatformFeatures): boolean {
    return environment.features[feature];
  }

  log(message: string, data?: any): void {
    console.log(`[${environment.platform.toUpperCase()}] ${message}`, data || '');
  }
}
