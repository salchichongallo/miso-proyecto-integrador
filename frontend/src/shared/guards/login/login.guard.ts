import { inject } from '@angular/core';
import { Router } from '@angular/router';
import { map } from 'rxjs/operators';

import { AuthService } from '@shared/auth/auth.service';

/**
 * Login Guard - Redirige usuarios ya autenticados lejos de la página de login
 * Permite acceso a /login solo si el usuario no está autenticado
 */
export const loginGuard = () => {
  const authService = inject(AuthService);
  const router = inject(Router);

  return authService.isAuthenticated().pipe(
    map((isAuthenticated) => {
      if (isAuthenticated) {
        return router.createUrlTree(['/']);
      }
      return true;
    })
  );
};
