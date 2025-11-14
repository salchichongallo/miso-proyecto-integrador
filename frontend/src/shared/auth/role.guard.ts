import { firstValueFrom } from 'rxjs';
import { inject } from '@angular/core';
import { CanActivateFn } from '@angular/router';

import { Role } from './user.interface';
import { AuthService } from './auth.service';

const createRoleGuard =
  (roleName: Role): CanActivateFn =>
  async () => {
    const auth = inject(AuthService);
    const user = await firstValueFrom(auth.user());
    return user?.role === roleName;
  };

const oneOf =
  (roles: Role[]): CanActivateFn =>
  async () => {
    const auth = inject(AuthService);
    const user = await firstValueFrom(auth.user());
    return roles.includes(user?.role!);
  };

export const roleGuard = {
  oneOf,
  admin: createRoleGuard(Role.admin),
  client: createRoleGuard(Role.client),
  vendor: createRoleGuard(Role.vendor),
  provider: createRoleGuard(Role.provider),
};
