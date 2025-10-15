import { inject, provideAppInitializer } from '@angular/core';
import { provideHttpClient, withInterceptors } from '@angular/common/http';
import { bootstrapApplication } from '@angular/platform-browser';
import { IonicRouteStrategy, provideIonicAngular } from '@ionic/angular/standalone';
import { PreloadAllModules, provideRouter, RouteReuseStrategy, withPreloading } from '@angular/router';

import { routes } from '@web/app.routes';
import { AppComponent } from '@web/app.component';
import { AuthService } from '@shared/auth/auth.service';
import { tokenInterceptor } from '@shared/interceptors';

console.log('🌐 Starting Web Application');

bootstrapApplication(AppComponent, {
  providers: [
    { provide: RouteReuseStrategy, useClass: IonicRouteStrategy },
    provideIonicAngular({
      mode: 'md', // Material Design for web
      rippleEffect: true,
    }),
    provideRouter(routes, withPreloading(PreloadAllModules)),
    provideHttpClient(withInterceptors([tokenInterceptor])),
    provideAppInitializer(() => inject(AuthService).init()),
  ],
}).catch((err) => console.error('Error starting web app:', err));
