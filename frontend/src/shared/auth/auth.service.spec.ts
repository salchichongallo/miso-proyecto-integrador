import { TestBed } from '@angular/core/testing';
import { firstValueFrom } from 'rxjs';
import { AuthService, User } from './auth.service';

// Mock AWS Amplify modules
jest.mock('aws-amplify/auth', () => ({
  signIn: jest.fn(),
  signOut: jest.fn(),
  fetchAuthSession: jest.fn(),
  confirmSignIn: jest.fn(),
}));

jest.mock('aws-amplify/utils', () => ({
  Hub: {
    listen: jest.fn(),
  },
}));

jest.mock('./configure-amplify-auth', () => ({
  configureAmplifyAuth: jest.fn(),
}));

import { signIn, signOut, fetchAuthSession, confirmSignIn } from 'aws-amplify/auth';
import { Hub } from 'aws-amplify/utils';
import { configureAmplifyAuth } from './configure-amplify-auth';

const mockSignIn = signIn as jest.MockedFunction<typeof signIn>;
const mockSignOut = signOut as jest.MockedFunction<typeof signOut>;
const mockFetchAuthSession = fetchAuthSession as jest.MockedFunction<typeof fetchAuthSession>;
const mockHubListen = Hub.listen as jest.MockedFunction<typeof Hub.listen>;
const mockConfigureAmplifyAuth = configureAmplifyAuth as jest.MockedFunction<typeof configureAmplifyAuth>;
const mockConfirmSignIn = confirmSignIn as jest.MockedFunction<typeof confirmSignIn>;

describe('AuthService', () => {
  let service: AuthService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(AuthService);

    // Clear all mocks before each test
    jest.clearAllMocks();
  });

  afterEach(() => {
    // Clean up any active subscriptions
    jest.clearAllMocks();
  });

  describe('Initialization', () => {
    it('should be created', () => {
      expect(service).toBeTruthy();
    });

    it('should configure Amplify auth and check auth state on init', async () => {
      // Mock successful auth session
      const mockSession = {
        tokens: {
          accessToken: { toString: () => 'mock-access-token' },
          idToken: {
            toString: () =>
              `header.${btoa(
                JSON.stringify({
                  sub: 'user123',
                  email: 'test@example.com',
                  'custom:role': 'admin',
                }),
              )}.signature`,
          },
        },
      };

      mockFetchAuthSession.mockResolvedValue(mockSession as any);
      mockHubListen.mockReturnValue(() => {});

      const hubListenerCallback = await service.init();

      expect(mockConfigureAmplifyAuth).toHaveBeenCalledTimes(1);
      expect(mockFetchAuthSession).toHaveBeenCalledTimes(1);
      expect(mockHubListen).toHaveBeenCalledWith('auth', expect.any(Function));
      expect(hubListenerCallback).toBeDefined();
    });

    it('should handle auth state check failure during init', async () => {
      mockFetchAuthSession.mockRejectedValue(new Error('Auth session failed'));
      mockHubListen.mockReturnValue(() => {});

      await service.init();

      expect(mockConfigureAmplifyAuth).toHaveBeenCalledTimes(1);
      expect(mockFetchAuthSession).toHaveBeenCalledTimes(1);

      // Should clear auth state when session fails
      const isAuthenticated = await firstValueFrom(service.isAuthenticated());
      expect(isAuthenticated).toBe(false);
    });
  });

  describe('login()', () => {
    it('should login successfully with valid credentials', async () => {
      const mockSignInResult = {
        nextStep: { signInStep: 'DONE' },
      };

      const mockSession = {
        tokens: {
          accessToken: { toString: () => 'mock-access-token' },
          idToken: {
            toString: () =>
              `header.${btoa(
                JSON.stringify({
                  sub: 'user123',
                  email: 'test@example.com',
                  'custom:role': 'user',
                }),
              )}.signature`,
          },
        },
      };

      mockSignIn.mockResolvedValue(mockSignInResult as any);
      mockFetchAuthSession.mockResolvedValue(mockSession as any);

      await service.login('test@example.com', 'password123');

      expect(mockSignIn).toHaveBeenCalledWith({
        username: 'test@example.com',
        password: 'password123',
      });
      expect(mockFetchAuthSession).toHaveBeenCalled();
    });

    it('should throw error when sign-in step is not DONE', async () => {
      const mockSignInResult = {
        nextStep: { signInStep: 'UNKNOWN_STEP' },
      };

      mockSignIn.mockResolvedValue(mockSignInResult as any);

      await expect(service.login('test@example.com', 'password123')).rejects.toThrow('Sign-in not completed.');

      expect(mockSignIn).toHaveBeenCalledWith({
        username: 'test@example.com',
        password: 'password123',
      });
    });

    it('should handle and re-throw login errors', async () => {
      const loginError = new Error('Invalid credentials');
      mockSignIn.mockRejectedValue(loginError);

      await expect(service.login('wrong@email.com', 'wrongpassword')).rejects.toThrow('Invalid credentials');
    });

    it('should update user state after successful login', async () => {
      const mockSignInResult = {
        nextStep: { signInStep: 'DONE' },
      };

      const mockUser = {
        sub: 'user123',
        email: 'test@example.com',
        'custom:role': 'admin',
      };

      const mockSession = {
        tokens: {
          accessToken: { toString: () => 'mock-access-token' },
          idToken: {
            toString: () => `header.${btoa(JSON.stringify(mockUser))}.signature`,
          },
        },
      };

      mockSignIn.mockResolvedValue(mockSignInResult as any);
      mockFetchAuthSession.mockResolvedValue(mockSession as any);

      await service.login('test@example.com', 'password123');

      // Verify user state is updated
      const user = await firstValueFrom(service.user());
      const isAuthenticated = await firstValueFrom(service.isAuthenticated());

      expect(user).toEqual({
        id: 'user123',
        email: 'test@example.com',
        role: 'admin',
      });
      expect(isAuthenticated).toBe(true);
      expect(service.accessToken()).toBe('mock-access-token');
    });

    it('should confirm sign-in when new password is required', async () => {
      const mockSignInResult = {
        nextStep: { signInStep: 'CONFIRM_SIGN_IN_WITH_NEW_PASSWORD_REQUIRED' },
      };
      mockSignIn.mockResolvedValue(mockSignInResult as any);

      await service.login('test@example.com', 'password123');

      expect(mockConfirmSignIn).toHaveBeenCalledWith({ challengeResponse: 'password123' });
    });
  });

  describe('logout()', () => {
    it('should logout successfully', async () => {
      mockSignOut.mockResolvedValue(undefined);

      await service.logout();

      expect(mockSignOut).toHaveBeenCalledTimes(1);
    });

    it('should clear user state after logout', async () => {
      // First, set up a logged-in state
      const mockSession = {
        tokens: {
          accessToken: { toString: () => 'mock-access-token' },
          idToken: {
            toString: () =>
              `header.${btoa(
                JSON.stringify({
                  sub: 'user123',
                  email: 'test@example.com',
                  'custom:role': 'user',
                }),
              )}.signature`,
          },
        },
      };

      mockFetchAuthSession.mockResolvedValue(mockSession as any);
      await service.init();

      // Verify user is logged in
      const userBeforeLogout = await firstValueFrom(service.user());
      const isAuthenticatedBefore = await firstValueFrom(service.isAuthenticated());
      expect(userBeforeLogout).toBeTruthy();
      expect(isAuthenticatedBefore).toBe(true);

      // Now logout
      mockSignOut.mockResolvedValue(undefined);
      await service.logout();

      // Verify user state is cleared
      const userAfterLogout = await firstValueFrom(service.user());
      const isAuthenticatedAfter = await firstValueFrom(service.isAuthenticated());
      expect(userAfterLogout).toBeNull();
      expect(isAuthenticatedAfter).toBe(false);
      expect(service.accessToken()).toBeNull();
    });

    it('should handle and re-throw logout errors', async () => {
      const logoutError = new Error('Logout failed');
      mockSignOut.mockRejectedValue(logoutError);

      // Spy on console.error to verify it's called
      const consoleErrorSpy = jest.spyOn(console, 'error').mockImplementation();

      await expect(service.logout()).rejects.toThrow('Logout failed');

      expect(consoleErrorSpy).toHaveBeenCalledWith('Error during logout:', logoutError);

      consoleErrorSpy.mockRestore();
    });
  });

  describe('isAuthenticated()', () => {
    it('should return false when no user is set', async () => {
      const isAuthenticated = await firstValueFrom(service.isAuthenticated());
      expect(isAuthenticated).toBe(false);
    });

    it('should return true when user is set', async () => {
      // Simulate successful auth
      const mockSession = {
        tokens: {
          accessToken: { toString: () => 'mock-access-token' },
          idToken: {
            toString: () =>
              `header.${btoa(
                JSON.stringify({
                  sub: 'user123',
                  email: 'test@example.com',
                  'custom:role': 'user',
                }),
              )}.signature`,
          },
        },
      };

      mockFetchAuthSession.mockResolvedValue(mockSession as any);
      await service.init();

      const isAuthenticated = await firstValueFrom(service.isAuthenticated());
      expect(isAuthenticated).toBe(true);
    });

    it('should emit changes when authentication state changes', async () => {
      const authStates: boolean[] = [];

      // Subscribe to authentication changes
      service.isAuthenticated().subscribe((state) => authStates.push(state));

      // Initial state should be false
      await new Promise((resolve) => setTimeout(resolve, 0)); // Allow async operations
      expect(authStates[0]).toBe(false);

      // Simulate login
      const mockSession = {
        tokens: {
          accessToken: { toString: () => 'mock-access-token' },
          idToken: {
            toString: () =>
              `header.${btoa(
                JSON.stringify({
                  sub: 'user123',
                  email: 'test@example.com',
                  'custom:role': 'user',
                }),
              )}.signature`,
          },
        },
      };

      mockFetchAuthSession.mockResolvedValue(mockSession as any);
      mockSignIn.mockResolvedValue({ nextStep: { signInStep: 'DONE' } } as any);

      await service.login('test@example.com', 'password');

      // Should now be authenticated
      expect(authStates.some((state) => state === true)).toBe(true);
    });
  });

  describe('user()', () => {
    it('should return null when no user is authenticated', async () => {
      const user = await firstValueFrom(service.user());
      expect(user).toBeNull();
    });

    it('should return user data when authenticated', async () => {
      const mockUserPayload = {
        sub: 'user123',
        email: 'test@example.com',
        'custom:role': 'admin',
      };

      const mockSession = {
        tokens: {
          accessToken: { toString: () => 'mock-access-token' },
          idToken: {
            toString: () => `header.${btoa(JSON.stringify(mockUserPayload))}.signature`,
          },
        },
      };

      mockFetchAuthSession.mockResolvedValue(mockSession as any);
      await service.init();

      const user = await firstValueFrom(service.user());
      expect(user).toEqual({
        id: 'user123',
        email: 'test@example.com',
        role: 'admin',
      });
    });

    it('should emit user changes when authentication state changes', async () => {
      const users: (User | null)[] = [];

      // Subscribe to user changes
      service.user().subscribe((user) => users.push(user));

      // Initial state should be null
      await new Promise((resolve) => setTimeout(resolve, 0)); // Allow async operations
      expect(users[0]).toBeNull();

      // Simulate login
      const mockSession = {
        tokens: {
          accessToken: { toString: () => 'mock-access-token' },
          idToken: {
            toString: () =>
              `header.${btoa(
                JSON.stringify({
                  sub: 'user456',
                  email: 'newuser@example.com',
                  'custom:role': 'user',
                }),
              )}.signature`,
          },
        },
      };

      mockFetchAuthSession.mockResolvedValue(mockSession as any);
      mockSignIn.mockResolvedValue({ nextStep: { signInStep: 'DONE' } } as any);

      await service.login('newuser@example.com', 'password');

      // Should have user data
      const lastUser = users[users.length - 1];
      expect(lastUser).toEqual({
        id: 'user456',
        email: 'newuser@example.com',
        role: 'user',
      });
    });
  });

  describe('accessToken()', () => {
    it('should return null when no token is available', () => {
      expect(service.accessToken()).toBeNull();
    });

    it('should return access token when available', async () => {
      const mockSession = {
        tokens: {
          accessToken: { toString: () => 'test-access-token-123' },
          idToken: {
            toString: () =>
              `header.${btoa(
                JSON.stringify({
                  sub: 'user123',
                  email: 'test@example.com',
                  'custom:role': 'user',
                }),
              )}.signature`,
          },
        },
      };

      mockFetchAuthSession.mockResolvedValue(mockSession as any);
      await service.init();

      expect(service.accessToken()).toBe('test-access-token-123');
    });

    it('should return null after logout', async () => {
      // First login
      const mockSession = {
        tokens: {
          accessToken: { toString: () => 'test-access-token-123' },
          idToken: {
            toString: () =>
              `header.${btoa(
                JSON.stringify({
                  sub: 'user123',
                  email: 'test@example.com',
                  'custom:role': 'user',
                }),
              )}.signature`,
          },
        },
      };

      mockFetchAuthSession.mockResolvedValue(mockSession as any);
      await service.init();
      expect(service.accessToken()).toBe('test-access-token-123');

      // Then logout
      mockSignOut.mockResolvedValue(undefined);
      await service.logout();
      expect(service.accessToken()).toBeNull();
    });
  });

  describe('Hub Auth Event Handling', () => {
    it('should handle signedIn event from Hub', async () => {
      let hubCallback: ((data: any) => void) | undefined;

      // Capture the callback passed to Hub.listen
      mockHubListen.mockImplementation((channel, callback) => {
        if (channel === 'auth') {
          hubCallback = callback;
        }
        return () => {};
      });

      mockFetchAuthSession.mockResolvedValue({
        tokens: {
          accessToken: { toString: () => 'hub-access-token' },
          idToken: {
            toString: () =>
              `header.${btoa(
                JSON.stringify({
                  sub: 'hubuser123',
                  email: 'hubuser@example.com',
                  'custom:role': 'user',
                }),
              )}.signature`,
          },
        },
      } as any);

      await service.init();
      expect(hubCallback).toBeDefined();

      // Simulate signedIn event
      if (hubCallback) {
        hubCallback({ payload: { event: 'signedIn' } });

        // Allow async operations to complete
        await new Promise((resolve) => setTimeout(resolve, 0));

        // Verify auth state was checked
        expect(mockFetchAuthSession).toHaveBeenCalledTimes(2); // Once for init, once for signedIn event
      }
    });

    it('should handle signedOut event from Hub', async () => {
      let hubCallback: ((data: any) => void) | undefined;

      // Set up authenticated state first
      mockFetchAuthSession.mockResolvedValue({
        tokens: {
          accessToken: { toString: () => 'hub-access-token' },
          idToken: {
            toString: () =>
              `header.${btoa(
                JSON.stringify({
                  sub: 'hubuser123',
                  email: 'hubuser@example.com',
                  'custom:role': 'user',
                }),
              )}.signature`,
          },
        },
      } as any);

      mockHubListen.mockImplementation((channel, callback) => {
        if (channel === 'auth') {
          hubCallback = callback;
        }
        return () => {};
      });

      await service.init();

      // Verify user is authenticated
      let isAuthenticated = await firstValueFrom(service.isAuthenticated());
      expect(isAuthenticated).toBe(true);

      // Simulate signedOut event
      if (hubCallback) {
        hubCallback({ payload: { event: 'signedOut' } });

        // Verify auth state was cleared
        isAuthenticated = await firstValueFrom(service.isAuthenticated());
        expect(isAuthenticated).toBe(false);
        expect(service.accessToken()).toBeNull();
      }
    });

    it('should ignore unhandled Hub events', async () => {
      let hubCallback: ((data: any) => void) | undefined;

      mockHubListen.mockImplementation((channel, callback) => {
        if (channel === 'auth') {
          hubCallback = callback;
        }
        return () => {};
      });

      mockFetchAuthSession.mockResolvedValue({
        tokens: {
          accessToken: { toString: () => 'hub-access-token' },
          idToken: {
            toString: () =>
              `header.${btoa(
                JSON.stringify({
                  sub: 'hubuser123',
                  email: 'hubuser@example.com',
                  'custom:role': 'user',
                }),
              )}.signature`,
          },
        },
      } as any);

      await service.init();

      const initialCallCount = mockFetchAuthSession.mock.calls.length;

      // Simulate unknown event
      if (hubCallback) {
        hubCallback({ payload: { event: 'unknownEvent' } });

        // Verify no additional auth state checks
        expect(mockFetchAuthSession.mock.calls.length).toBe(initialCallCount);
      }
    });
  });
});
