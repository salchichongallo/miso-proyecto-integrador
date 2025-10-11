import { TestBed } from '@angular/core/testing';
import { AppAuthenticatorComponent } from './app-authenticator.component';

jest.mock('aws-amplify/auth');

let component: AppAuthenticatorComponent;

beforeEach(() => {
  TestBed.configureTestingModule({
    providers: [AppAuthenticatorComponent],
  });
  component = TestBed.inject(AppAuthenticatorComponent);
});

it('component should be defined', () => {
  expect(component).toBeDefined();
});
