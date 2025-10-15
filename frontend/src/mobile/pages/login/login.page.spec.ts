import { Router } from '@angular/router';
import { TestBed } from '@angular/core/testing';

import { AppAuthenticatorComponent } from '@shared/auth/organisms/app-authenticator/app-authenticator.component';

import { LoginPage } from './login.page';

jest.mock('aws-amplify/auth');

describe('LoginPage', () => {
  let page: LoginPage;
  let router: Router;

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [AppAuthenticatorComponent],
      providers: [
        LoginPage,
        AppAuthenticatorComponent,
        {
          provide: Router,
          useValue: { navigate: jest.fn() },
        },
      ],
    });
    page = TestBed.inject(LoginPage);
    router = TestBed.inject(Router);
  });

  it('should create an instance', () => {
    expect(page).toBeTruthy();
  });

  it('should navigate to dashboard', async () => {
    await page.redirectToDashboard();
    expect(router.navigate).toHaveBeenCalledWith(['/']);
  });
});
