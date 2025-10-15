import { TestBed } from '@angular/core/testing';
import { Router, UrlTree } from '@angular/router';
import { of } from 'rxjs';
import { firstValueFrom } from 'rxjs';

import { AuthService } from '@shared/auth/auth.service';
import { loginGuard } from './login.guard';

describe('loginGuard', () => {
  let mockAuthService: jest.Mocked<Pick<AuthService, 'isAuthenticated'>>;
  let mockRouter: jest.Mocked<Pick<Router, 'createUrlTree'>>;

  beforeEach(() => {
    // Create mocks
    mockAuthService = {
      isAuthenticated: jest.fn(),
    };

    mockRouter = {
      createUrlTree: jest.fn(),
    };

    // Configure TestBed
    TestBed.configureTestingModule({
      providers: [
        { provide: AuthService, useValue: mockAuthService },
        { provide: Router, useValue: mockRouter },
      ],
    });
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should allow access when user is not authenticated', async () => {
    // Arrange: Mock unauthenticated user
    mockAuthService.isAuthenticated.mockReturnValue(of(false));

    // Act: Execute guard
    const result = await TestBed.runInInjectionContext(() => {
      const guardResult = loginGuard();
      return firstValueFrom(guardResult);
    });

    // Assert: Should return true (allow access to login page)
    expect(result).toBe(true);
    expect(mockAuthService.isAuthenticated).toHaveBeenCalledTimes(1);
    expect(mockRouter.createUrlTree).not.toHaveBeenCalled();
  });

  it('should redirect to / when user is already authenticated', async () => {
    // Arrange: Mock authenticated user
    mockAuthService.isAuthenticated.mockReturnValue(of(true));
    const mockUrlTree = { toString: () => '/' } as UrlTree;
    mockRouter.createUrlTree.mockReturnValue(mockUrlTree);

    // Act: Execute guard
    const result = await TestBed.runInInjectionContext(() => {
      const guardResult = loginGuard();
      return firstValueFrom(guardResult);
    });

    // Assert: Should return UrlTree for / (home/dashboard)
    expect(result).toBe(mockUrlTree);
    expect(mockAuthService.isAuthenticated).toHaveBeenCalledTimes(1);
    expect(mockRouter.createUrlTree).toHaveBeenCalledWith(['/']);
  });

  it('should handle authentication state changes', async () => {
    // Arrange: Start with authenticated, then log out
    let isAuthenticated = true;
    mockAuthService.isAuthenticated.mockImplementation(() => of(isAuthenticated));
    const mockUrlTree = { toString: () => '/' } as UrlTree;
    mockRouter.createUrlTree.mockReturnValue(mockUrlTree);

    // Act & Assert: First call - authenticated (should redirect)
    let result = await TestBed.runInInjectionContext(() => {
      const guardResult = loginGuard();
      return firstValueFrom(guardResult);
    });
    expect(result).toBe(mockUrlTree);

    // Act & Assert: Second call - not authenticated (should allow)
    isAuthenticated = false;
    result = await TestBed.runInInjectionContext(() => {
      const guardResult = loginGuard();
      return firstValueFrom(guardResult);
    });
    expect(result).toBe(true);
  });

  it('should create correct redirect URL tree structure', async () => {
    // Arrange
    mockAuthService.isAuthenticated.mockReturnValue(of(true));
    const mockUrlTree = new UrlTree();
    mockRouter.createUrlTree.mockReturnValue(mockUrlTree);

    // Act
    await TestBed.runInInjectionContext(() => {
      const guardResult = loginGuard();
      return firstValueFrom(guardResult);
    });

    // Assert: Verify URL tree was created with correct parameters
    expect(mockRouter.createUrlTree).toHaveBeenCalledWith(['/']);
    expect(mockRouter.createUrlTree).toHaveBeenCalledTimes(1);
  });

  it('should prevent authenticated users from accessing login page', async () => {
    // Arrange: User is authenticated
    mockAuthService.isAuthenticated.mockReturnValue(of(true));
    const mockUrlTree = { toString: () => '/' } as UrlTree;
    mockRouter.createUrlTree.mockReturnValue(mockUrlTree);

    // Act
    const result = await TestBed.runInInjectionContext(() => {
      const guardResult = loginGuard();
      return firstValueFrom(guardResult);
    });

    // Assert: Should redirect away from login
    expect(result).not.toBe(true);
    expect(result).toBe(mockUrlTree);
    expect(mockAuthService.isAuthenticated).toHaveBeenCalled();
  });

  it('should be a functional guard', () => {
    // Verify that loginGuard is a function (functional guard)
    expect(typeof loginGuard).toBe('function');
  });
});
