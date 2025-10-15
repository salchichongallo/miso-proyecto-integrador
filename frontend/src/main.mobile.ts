import { provideAppInitializer, inject } from '@angular/core';
import { provideHttpClient, withInterceptors } from '@angular/common/http';
import { bootstrapApplication } from '@angular/platform-browser';
import { IonicRouteStrategy, provideIonicAngular } from '@ionic/angular/standalone';
import { RouteReuseStrategy, provideRouter, withPreloading, PreloadAllModules } from '@angular/router';

import { routes } from '@mobile/app.routes';
import { AppComponent } from '@mobile/app.component';
import { AuthService } from '@shared/auth/auth.service';
import { tokenInterceptor } from '@shared/interceptors';

console.log('📱 Starting Mobile Application');

bootstrapApplication(AppComponent, {
  providers: [
    { provide: RouteReuseStrategy, useClass: IonicRouteStrategy },
    provideIonicAngular({
      mode: 'md', // Material Design for mobile
      rippleEffect: true,
    }),
    provideRouter(routes, withPreloading(PreloadAllModules)),
    provideHttpClient(withInterceptors([tokenInterceptor])),
    provideAppInitializer(() => inject(AuthService).init()),
  ],
}).catch((err) => console.error('Error starting mobile app:', err));
