import { inject } from '@angular/core';
import { Router } from '@angular/router';
import { map } from 'rxjs/operators';

import { AuthService } from '@shared/auth/auth.service';

/**
 * Auth Guard - Protege rutas que requieren autenticación
 * Redirige a /login si el usuario no está autenticado
 */
export const authGuard = () => {
  const authService = inject(AuthService);
  const router = inject(Router);

  return authService.isAuthenticated().pipe(
    map((isAuthenticated) => {
      if (!isAuthenticated) {
        return router.createUrlTree(['/login']);
      }
      return true;
    }),
  );
};
