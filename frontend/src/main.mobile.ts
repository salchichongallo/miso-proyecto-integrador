import { provideAppInitializer, inject } from '@angular/core';
import { bootstrapApplication } from '@angular/platform-browser';
import { IonicRouteStrategy, provideIonicAngular } from '@ionic/angular/standalone';
import { RouteReuseStrategy, provideRouter, withPreloading, PreloadAllModules } from '@angular/router';

import { routes } from './mobile/app.routes';
import { AppComponent } from './mobile/app.component';
import { environment } from './environments/environment.mobile';
import { AuthService } from './shared/auth/auth.service';

console.log('📱 Starting Mobile Application');

bootstrapApplication(AppComponent, {
  providers: [
    { provide: RouteReuseStrategy, useClass: IonicRouteStrategy },
    provideIonicAngular({
      mode: 'md', // Material Design for mobile
      rippleEffect: true,
    }),
    provideRouter(routes, withPreloading(PreloadAllModules)),
    provideAppInitializer(() => inject(AuthService).init()),
  ],
}).catch((err) => console.error('Error starting mobile app:', err));

// Mobile-specific initialization
if (environment.platform === 'mobile' && environment.capacitorPlugins.statusBar) {
  // Mobile-specific configurations will go here
  console.log('Mobile platform detected');
}
