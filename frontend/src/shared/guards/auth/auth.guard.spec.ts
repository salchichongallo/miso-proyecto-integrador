import { TestBed } from '@angular/core/testing';
import { Router, UrlTree } from '@angular/router';
import { of, firstValueFrom } from 'rxjs';

import { AuthService } from '@shared/auth/auth.service';
import { authGuard } from './auth.guard';

describe('authGuard', () => {
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

  it('should allow access when user is authenticated', async () => {
    // Arrange: Mock authenticated user
    mockAuthService.isAuthenticated.mockReturnValue(of(true));

    // Act: Execute guard
    const result = await TestBed.runInInjectionContext(() => {
      const guardResult = authGuard();
      return firstValueFrom(guardResult);
    });

    // Assert: Should return true
    expect(result).toBe(true);
    expect(mockAuthService.isAuthenticated).toHaveBeenCalledTimes(1);
    expect(mockRouter.createUrlTree).not.toHaveBeenCalled();
  });

  it('should redirect to /login when user is not authenticated', async () => {
    // Arrange: Mock unauthenticated user
    mockAuthService.isAuthenticated.mockReturnValue(of(false));
    const mockUrlTree = { toString: () => '/login' } as UrlTree;
    mockRouter.createUrlTree.mockReturnValue(mockUrlTree);

    // Act: Execute guard
    const result = await TestBed.runInInjectionContext(() => {
      const guardResult = authGuard();
      return firstValueFrom(guardResult);
    });

    // Assert: Should return UrlTree for /login
    expect(result).toBe(mockUrlTree);
    expect(mockAuthService.isAuthenticated).toHaveBeenCalledTimes(1);
    expect(mockRouter.createUrlTree).toHaveBeenCalledWith(['/login']);
  });

  it('should handle authentication state changes', async () => {
    // Arrange: Start with unauthenticated, then authenticate
    let isAuthenticated = false;
    mockAuthService.isAuthenticated.mockImplementation(() => of(isAuthenticated));
    const mockUrlTree = { toString: () => '/login' } as UrlTree;
    mockRouter.createUrlTree.mockReturnValue(mockUrlTree);

    // Act & Assert: First call - not authenticated
    let result = await TestBed.runInInjectionContext(() => {
      const guardResult = authGuard();
      return firstValueFrom(guardResult);
    });
    expect(result).toBe(mockUrlTree);

    // Act & Assert: Second call - authenticated
    isAuthenticated = true;
    result = await TestBed.runInInjectionContext(() => {
      const guardResult = authGuard();
      return firstValueFrom(guardResult);
    });
    expect(result).toBe(true);
  });

  it('should create correct redirect URL tree structure', async () => {
    // Arrange
    mockAuthService.isAuthenticated.mockReturnValue(of(false));
    const mockUrlTree = new UrlTree();
    mockRouter.createUrlTree.mockReturnValue(mockUrlTree);

    // Act
    await TestBed.runInInjectionContext(() => {
      const guardResult = authGuard();
      return firstValueFrom(guardResult);
    });

    // Assert: Verify URL tree was created with correct parameters
    expect(mockRouter.createUrlTree).toHaveBeenCalledWith(['/login']);
    expect(mockRouter.createUrlTree).toHaveBeenCalledTimes(1);
  });

  it('should be a functional guard', () => {
    // Verify that authGuard is a function (functional guard)
    expect(typeof authGuard).toBe('function');
  });
});
