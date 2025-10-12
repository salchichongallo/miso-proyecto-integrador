import { inject, provideAppInitializer } from '@angular/core';
import { bootstrapApplication } from '@angular/platform-browser';
import { IonicRouteStrategy, provideIonicAngular } from '@ionic/angular/standalone';
import { PreloadAllModules, provideRouter, RouteReuseStrategy, withPreloading } from '@angular/router';

import { routes } from '@web/app.routes';
import { AppComponent } from '@web/app.component';
import { AuthService } from '@shared/auth/auth.service';

console.log('🌐 Starting Web Application');

bootstrapApplication(AppComponent, {
  providers: [
    { provide: RouteReuseStrategy, useClass: IonicRouteStrategy },
    provideIonicAngular({
      mode: 'md', // Material Design for web
      rippleEffect: true,
    }),
    provideRouter(routes, withPreloading(PreloadAllModules)),
    provideAppInitializer(() => inject(AuthService).init()),
  ],
}).catch((err) => console.error('Error starting web app:', err));
