import { TestBed } from '@angular/core/testing';
import { fetchUserAttributes } from 'aws-amplify/auth';

import { AppAuthenticatorComponent } from '@shared/auth/organisms/app-authenticator/app-authenticator.component';

import { LoginPage } from './login.page';

jest.mock('aws-amplify/auth');

describe('LoginPage', () => {
  let page: LoginPage;

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [AppAuthenticatorComponent],
      providers: [LoginPage, AppAuthenticatorComponent],
    });
    page = TestBed.inject(LoginPage);
  });

  it('should create an instance', () => {
    expect(page).toBeTruthy();
  });

  it('should fetch user attributes through authenticator', async () => {
    const authenticatorComponent = new AppAuthenticatorComponent();
    const mockAttributes = { email: 'test@example.com', name: 'Test User' };
    (fetchUserAttributes as jest.Mock).mockResolvedValue(mockAttributes);

    await authenticatorComponent.fetchProfile();

    expect(authenticatorComponent.userAttributes).toEqual(mockAttributes);
    expect(fetchUserAttributes).toHaveBeenCalled();
  });
});
