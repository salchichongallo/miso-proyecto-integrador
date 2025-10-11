import './shared/auth/configure-auth';
import { bootstrapApplication } from '@angular/platform-browser';
import { RouteReuseStrategy, provideRouter, withPreloading, PreloadAllModules } from '@angular/router';
import { IonicRouteStrategy, provideIonicAngular } from '@ionic/angular/standalone';

import { routes } from '@web/app.routes';
import { AppComponent } from '@web/app.component';
import { environment } from '@env/environment.web';

console.log('🌐 Starting Web Application');

bootstrapApplication(AppComponent, {
  providers: [
    { provide: RouteReuseStrategy, useClass: IonicRouteStrategy },
    provideIonicAngular({
      mode: 'md', // Material Design for web
      rippleEffect: true,
    }),
    provideRouter(routes, withPreloading(PreloadAllModules)),
  ],
}).catch((err) => console.error('Error starting web app:', err));

// Web-specific initialization
if (environment.platform === 'web') {
  // Web-specific configurations
  console.log('Web platform detected');
}
