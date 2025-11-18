import { inject, provideAppInitializer } from '@angular/core';
import { provideHttpClient, withInterceptors } from '@angular/common/http';
import { bootstrapApplication } from '@angular/platform-browser';
import { IonicRouteStrategy, provideIonicAngular } from '@ionic/angular/standalone';
import { PreloadAllModules, provideRouter, RouteReuseStrategy, withPreloading } from '@angular/router';
import esLocale from '@angular/common/locales/es';
import { registerLocaleData } from '@angular/common';

import { routes } from '@web/app.routes';
import { AppComponent } from '@web/app.component';
import { AuthService } from '@shared/auth/auth.service';
import { TranslationService } from '@shared/services/translation';
import { tokenInterceptor } from '@shared/interceptors';
import { provideI18nConfig } from '@shared/config';

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
    provideI18nConfig(),
    provideAppInitializer(() => inject(TranslationService).init()),
    provideAppInitializer(() => inject(AuthService).init()),
    provideAppInitializer(() => registerLocaleData(esLocale)),
  ],
}).catch((err) => console.error('Error starting web app:', err));
