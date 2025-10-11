import { TestBed } from '@angular/core/testing';
import { fetchUserAttributes } from 'aws-amplify/auth';
import { AppAuthenticatorComponent } from './app-authenticator.component';

jest.mock('aws-amplify/auth');
jest.mock('@aws-amplify/ui-angular');

let component: AppAuthenticatorComponent;

beforeEach(() => {
  TestBed.configureTestingModule({
    providers: [AppAuthenticatorComponent],
  });
  component = TestBed.inject(AppAuthenticatorComponent);
});

it('should fetch user attributes', async () => {
  (fetchUserAttributes as jest.Mock) = jest.fn().mockResolvedValue({ foo: 'bar' });
  await component.fetchProfile();
  expect(component.userAttributes).toEqual({ foo: 'bar' });
});
