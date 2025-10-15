import { HttpInterceptorFn } from '@angular/common/http';
import { inject } from '@angular/core';
import { AuthService } from '@shared/auth/auth.service';

/**
 * HTTP Interceptor that adds the authentication token to all outgoing requests.
 *
 * This interceptor automatically retrieves the access token from the AuthService
 * and adds it as a Bearer token in the Authorization header for all HTTP requests.
 *
 * @example
 * // In app.config.ts
 * provideHttpClient(
 *   withInterceptors([tokenInterceptor])
 * )
 */
export const tokenInterceptor: HttpInterceptorFn = (req, next) => {
  const authService = inject(AuthService);
  const token = authService.accessToken();

  // If there's no token, proceed with the original request
  if (!token) {
    return next(req);
  }

  // Clone the request and add the Authorization header with the Bearer token
  const authReq = req.clone({
    setHeaders: {
      Authorization: `Bearer ${token}`,
    },
  });

  return next(authReq);
};
