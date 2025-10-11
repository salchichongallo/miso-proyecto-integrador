import { TestBed } from '@angular/core/testing';
import { fetchUserAttributes } from 'aws-amplify/auth';
import { AppAuthenticatorComponent } from './app-authenticator.component';

jest.mock('aws-amplify/auth');
jest.mock('@aws-amplify/ui-angular');

describe('AppAuthenticatorComponent', () => {
  let component: AppAuthenticatorComponent;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [AppAuthenticatorComponent],
    });
    component = TestBed.inject(AppAuthenticatorComponent);
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should fetch user attributes', async () => {
    const mockAttributes = { email: 'test@example.com', name: 'Test User' };
    (fetchUserAttributes as jest.Mock).mockResolvedValue(mockAttributes);

    await component.fetchProfile();

    expect(component.userAttributes).toEqual(mockAttributes);
    expect(fetchUserAttributes).toHaveBeenCalled();
  });
});
