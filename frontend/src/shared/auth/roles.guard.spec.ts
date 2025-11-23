import { of } from 'rxjs';
import { TestBed } from '@angular/core/testing';

import { roleGuard } from './role.guard';
import { AuthService } from './auth.service';
import { Role, User } from './user.interface';

jest.mock('./auth.service');

const mockRoute: any = {};
const mockState: any = {};

describe('Roles Guard', () => {
  let authService: jest.Mocked<AuthService>;

  function mockUser(user: Partial<User> | null = { id: '1', email: 'admin@example.com', role: Role.admin }) {
    authService.user.mockReturnValueOnce(of(user as User));
  }

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [AuthService],
    });
    authService = TestBed.inject(AuthService) as jest.Mocked<AuthService>;
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('createRoleGuard', () => {
    it('allows access if user has the required role (admin)', async () => {
      mockUser({ role: Role.admin });
      const canActivate = roleGuard.admin;
      const result = await TestBed.runInInjectionContext(() => canActivate(mockRoute, mockState));
      expect(result).toBe(true);
    });

    it('denies access if user does not have the required role (admin)', async () => {
      mockUser({ role: Role.client });
      const canActivate = roleGuard.admin;
      const result = await TestBed.runInInjectionContext(() => canActivate(mockRoute, mockState));
      expect(result).toBe(false);
    });

    it('denies access if user is null (unauthenticated)', async () => {
      mockUser(null);
      const canActivate = roleGuard.admin;
      const result = await TestBed.runInInjectionContext(() => canActivate(mockRoute, mockState));
      expect(result).toBe(false);
    });

    it.each([[Role.admin], [Role.client], [Role.vendor], [Role.provider]])(
      'allows access for %s role guard',
      async (role) => {
        mockUser({ role });
        const canActivate = roleGuard[role];
        const result = await TestBed.runInInjectionContext(() => canActivate(mockRoute, mockState));
        expect(result).toBe(true);
      },
    );
  });

  describe('oneOf', () => {
    it('allows access if user has one of the required roles', async () => {
      mockUser({ role: Role.vendor });
      const canActivate = roleGuard.oneOf([Role.vendor, Role.client]);
      const result = await TestBed.runInInjectionContext(() => canActivate(mockRoute, mockState));
      expect(result).toBe(true);
    });

    it('denies access if user does not have any of the required roles', async () => {
      mockUser({ role: Role.provider });
      const canActivate = roleGuard.oneOf([Role.admin, Role.client]);
      const result = await TestBed.runInInjectionContext(() => canActivate(mockRoute, mockState));
      expect(result).toBe(false);
    });

    it('denies access if user is null (unauthenticated)', async () => {
      mockUser(null);
      const canActivate = roleGuard.oneOf([Role.admin, Role.client]);
      const result = await TestBed.runInInjectionContext(() => canActivate(mockRoute, mockState));
      expect(result).toBe(false);
    });
  });
});
