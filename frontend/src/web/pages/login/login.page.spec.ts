import { TestBed } from '@angular/core/testing';

import { AppAuthenticatorComponent } from '@shared/auth/organisms/app-authenticator/app-authenticator.component';

import { LoginPage } from './login.page';

describe('LoginPage', () => {
  let page: LoginPage;

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [AppAuthenticatorComponent],
      providers: [LoginPage],
    });
    page = TestBed.inject(LoginPage);
  });

  it('should create an instance', () => {
    expect(page).toBeTruthy();
  });
});
