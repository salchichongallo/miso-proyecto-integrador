import { of } from 'rxjs';
import { TestBed, ComponentFixture } from '@angular/core/testing';
import { LoadingController, ToastController } from '@ionic/angular/standalone';
import { TranslateModule, TranslateService } from '@ngx-translate/core';

import { AuthService } from '@shared/auth/auth.service';
import { AppAuthenticatorComponent } from './app-authenticator.component';
import { Role } from '../../user.interface';

// Mock AWS Amplify
jest.mock('aws-amplify/auth');
jest.mock('aws-amplify/utils');

describe('AppAuthenticatorComponent', () => {
  let component: AppAuthenticatorComponent;
  let fixture: ComponentFixture<AppAuthenticatorComponent>;
  let authService: jest.Mocked<AuthService>;
  let loaderController: jest.Mocked<LoadingController>;
  let toastController: jest.Mocked<ToastController>;
  let mockLoading: any;
  let mockToast: any;

  beforeEach(async () => {
    // Mock loading instance
    mockLoading = {
      present: jest.fn().mockResolvedValue(undefined),
      dismiss: jest.fn().mockResolvedValue(undefined),
    };

    // Mock toast instance
    mockToast = {
      present: jest.fn().mockResolvedValue(undefined),
    };

    // Mock services
    const mockAuthService = {
      login: jest.fn().mockResolvedValue(undefined),
      isAuthenticated: jest.fn().mockReturnValue(of(false)),
      user: jest.fn().mockReturnValue(of(null)),
      accessToken: jest.fn().mockReturnValue('mock-token'),
      init: jest.fn(),
    };

    const mockLoadingController = {
      create: jest.fn().mockResolvedValue(mockLoading),
    };

    const mockToastController = {
      create: jest.fn().mockResolvedValue(mockToast),
    };

    await TestBed.configureTestingModule({
      imports: [AppAuthenticatorComponent, TranslateModule.forRoot()],
      providers: [
        { provide: AuthService, useValue: mockAuthService },
        { provide: LoadingController, useValue: mockLoadingController },
        { provide: ToastController, useValue: mockToastController },
      ],
    }).compileComponents();

    // Mock the TranslateService after module setup but before component creation
    const translateService = TestBed.inject(TranslateService);
    jest.spyOn(translateService, 'instant').mockImplementation((key: string | string[]) => {
      const translations: Record<string, string> = {
        'auth.login.error': 'Error al iniciar sesión',
        'auth.login.loading': 'Cargando...',
      };
      if (typeof key === 'string') {
        return translations[key] || key;
      }
      return key;
    });

    fixture = TestBed.createComponent(AppAuthenticatorComponent);
    component = fixture.componentInstance;
    authService = TestBed.inject(AuthService) as jest.Mocked<AuthService>;
    loaderController = TestBed.inject(LoadingController) as jest.Mocked<LoadingController>;
    toastController = TestBed.inject(ToastController) as jest.Mocked<ToastController>;

    fixture.detectChanges();
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('Component Initialization', () => {
    it('should create the component', () => {
      expect(component).toBeTruthy();
    });

    it('should initialize form with empty email and password controls', () => {
      expect(component['form'].get('email')?.value).toBe('');
      expect(component['form'].get('password')?.value).toBe('');
    });

    it('should have AuthService injected', () => {
      expect(component['service']).toBe(authService);
    });

    it('should have LoadingController injected', () => {
      expect(component['loader']).toBe(loaderController);
    });

    it('should have ToastController injected', () => {
      expect(component['toast']).toBe(toastController);
    });

    it('should have loginSuccessfully output emitter', () => {
      expect(component.loginSuccessfully).toBeDefined();
    });
  });

  describe('Form Validation', () => {
    it('should have valid form when email and password are provided', () => {
      component['form'].patchValue({
        email: 'test@example.com',
        password: 'password123',
      });

      expect(component['form'].valid).toBeTruthy();
    });

    it('should have invalid form when email is empty', () => {
      component['form'].patchValue({
        email: '',
        password: 'password123',
      });

      expect(component['form'].valid).toBeFalsy();
      expect(component['form'].get('email')?.hasError('required')).toBeTruthy();
    });

    it('should have invalid form when password is empty', () => {
      component['form'].patchValue({
        email: 'test@example.com',
        password: '',
      });

      expect(component['form'].valid).toBeFalsy();
      expect(component['form'].get('password')?.hasError('required')).toBeTruthy();
    });

    it('should have invalid form when email format is invalid', () => {
      component['form'].patchValue({
        email: 'invalid-email',
        password: 'password123',
      });

      expect(component['form'].valid).toBeFalsy();
      expect(component['form'].get('email')?.hasError('email')).toBeTruthy();
    });

    it('should have invalid form when password is too short', () => {
      component['form'].patchValue({
        email: 'test@example.com',
        password: '12345',
      });

      expect(component['form'].valid).toBeFalsy();
      expect(component['form'].get('password')?.hasError('minlength')).toBeTruthy();
    });
  });

  describe('login()', () => {
    beforeEach(() => {
      component['form'].patchValue({
        email: 'test@example.com',
        password: 'password123',
      });
    });

    it('should call AuthService.login with correct credentials when form is valid', async () => {
      const email = 'test@example.com';
      const password = 'password123';

      component['form'].patchValue({ email, password });

      await component.login();

      expect(authService.login).toHaveBeenCalledWith(email, password);
      expect(authService.login).toHaveBeenCalledTimes(1);
    });

    it('should create and show loading spinner with correct configuration', async () => {
      await component.login();

      expect(loaderController.create).toHaveBeenCalledWith({
        message: 'Cargando...',
        keyboardClose: false,
        backdropDismiss: false,
      });
      expect(mockLoading.present).toHaveBeenCalled();
    });

    it('should dismiss loading spinner after successful login', async () => {
      await component.login();

      expect(mockLoading.dismiss).toHaveBeenCalled();
    });

    it('should reset form after successful login', async () => {
      await component.login();

      expect(component['form'].get('email')?.value).toBe('');
      expect(component['form'].get('password')?.value).toBe('');
    });

    it('should emit loginSuccessfully event after successful login', async () => {
      const emitSpy = jest.spyOn(component.loginSuccessfully, 'emit');

      await component.login();

      expect(emitSpy).toHaveBeenCalled();
      expect(emitSpy).toHaveBeenCalledTimes(1);
    });

    it('should not call AuthService.login when form is invalid', async () => {
      component['form'].patchValue({
        email: '',
        password: '',
      });

      await component.login();

      expect(authService.login).not.toHaveBeenCalled();
      expect(loaderController.create).not.toHaveBeenCalled();
    });

    it('should reset only password field when login fails', async () => {
      const email = 'test@example.com';
      const password = 'wrongpassword';

      component['form'].patchValue({ email, password });
      authService.login.mockRejectedValue(new Error('Login failed'));

      await component.login();

      // Email should remain, password should be reset
      expect(component['form'].get('email')?.value).toBe(email);
      expect(component['form'].get('password')?.value).toBe('');
    });

    it('should dismiss loading spinner when login fails', async () => {
      authService.login.mockRejectedValue(new Error('Login failed'));

      await component.login();

      expect(mockLoading.dismiss).toHaveBeenCalled();
    });

    it('should show error toast when login fails', async () => {
      const error = new Error('Invalid credentials');
      authService.login.mockRejectedValue(error);

      await component.login();

      expect(toastController.create).toHaveBeenCalledWith({
        message: 'Error al iniciar sesión',
        duration: 7000,
        color: 'danger',
      });
      expect(mockToast.present).toHaveBeenCalled();
    });

    it('should not emit loginSuccessfully event when login fails', async () => {
      const emitSpy = jest.spyOn(component.loginSuccessfully, 'emit');
      authService.login.mockRejectedValue(new Error('Login failed'));

      await component.login();

      expect(emitSpy).not.toHaveBeenCalled();
    });

    it('should handle login flow completely on success', async () => {
      const emitSpy = jest.spyOn(component.loginSuccessfully, 'emit');

      await component.login();

      // Verify complete flow
      expect(loaderController.create).toHaveBeenCalled();
      expect(mockLoading.present).toHaveBeenCalled();
      expect(authService.login).toHaveBeenCalled();
      expect(mockLoading.dismiss).toHaveBeenCalled();
      expect(emitSpy).toHaveBeenCalled();
      expect(toastController.create).not.toHaveBeenCalled();
    });

    it('should handle login flow completely on failure', async () => {
      const emitSpy = jest.spyOn(component.loginSuccessfully, 'emit');
      authService.login.mockRejectedValue(new Error('Auth error'));

      await component.login();

      // Verify complete flow
      expect(loaderController.create).toHaveBeenCalled();
      expect(mockLoading.present).toHaveBeenCalled();
      expect(authService.login).toHaveBeenCalled();
      expect(mockLoading.dismiss).toHaveBeenCalled();
      expect(emitSpy).not.toHaveBeenCalled();
      expect(toastController.create).toHaveBeenCalled();
      expect(mockToast.present).toHaveBeenCalled();
    });
  });

  describe('showLoader()', () => {
    it('should create loading with correct configuration', async () => {
      component['form'].patchValue({
        email: 'test@example.com',
        password: 'password123',
      });

      await component.login();

      expect(loaderController.create).toHaveBeenCalledWith({
        message: 'Cargando...',
        keyboardClose: false,
        backdropDismiss: false,
      });
    });

    it('should present loading immediately after creation', async () => {
      component['form'].patchValue({
        email: 'test@example.com',
        password: 'password123',
      });

      await component.login();

      expect(mockLoading.present).toHaveBeenCalled();
    });

    it('should return loading instance that can be dismissed', async () => {
      component['form'].patchValue({
        email: 'test@example.com',
        password: 'password123',
      });

      await component.login();

      // The loading instance should have been used
      expect(mockLoading.dismiss).toHaveBeenCalled();
    });
  });

  describe('Form Controls', () => {
    it('should update email control value', () => {
      const newEmail = 'newemail@example.com';

      component['form'].controls['email'].setValue(newEmail);

      expect(component['form'].controls['email'].value).toBe(newEmail);
    });

    it('should update password control value', () => {
      const newPassword = 'newpassword123';

      component['form'].controls['password'].setValue(newPassword);

      expect(component['form'].controls['password'].value).toBe(newPassword);
    });

    it('should have nonNullable controls', () => {
      // Reset to trigger default values
      component['form'].reset();

      expect(component['form'].controls['email'].value).toBe('');
      expect(component['form'].controls['password'].value).toBe('');
    });
  });

  describe('Integration with AuthService observables', () => {
    it('should work with authenticated user state', () => {
      const mockUser = { id: '123', email: 'user@example.com', role: Role.admin };
      authService.isAuthenticated.mockReturnValue(of(true));
      authService.user.mockReturnValue(of(mockUser));

      // Component should be able to access these observables
      component['service'].isAuthenticated().subscribe((isAuth: boolean) => {
        expect(isAuth).toBe(true);
      });

      component['service'].user().subscribe((user: any) => {
        expect(user).toEqual(mockUser);
      });
    });

    it('should work with unauthenticated user state', () => {
      authService.isAuthenticated.mockReturnValue(of(false));
      authService.user.mockReturnValue(of(null));

      component['service'].isAuthenticated().subscribe((isAuth: boolean) => {
        expect(isAuth).toBe(false);
      });

      component['service'].user().subscribe((user: any) => {
        expect(user).toBeNull();
      });
    });
  });

  describe('Error Handling', () => {
    it('should handle network errors gracefully', async () => {
      const networkError = new Error('Network error');
      authService.login.mockRejectedValue(networkError);
      component['form'].patchValue({
        email: 'test@example.com',
        password: 'password123',
      });

      await component.login();

      expect(toastController.create).toHaveBeenCalledWith({
        message: 'Error al iniciar sesión',
        duration: 7000,
        color: 'danger',
      });
    });

    it('should handle authentication errors gracefully', async () => {
      const authError = new Error('Invalid credentials');
      authService.login.mockRejectedValue(authError);
      component['form'].patchValue({
        email: 'test@example.com',
        password: 'wrongpassword',
      });

      await component.login();

      expect(component['form'].get('password')?.value).toBe('');
      expect(toastController.create).toHaveBeenCalled();
    });
  });
});
