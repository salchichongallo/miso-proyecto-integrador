import { Router } from '@angular/router';
import { TestBed } from '@angular/core/testing';
import { TranslateModule } from '@ngx-translate/core';

import { LoginPage } from './login.page';

jest.mock('aws-amplify/auth');

describe('LoginPage', () => {
  let page: LoginPage;
  let router: Router;

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [TranslateModule.forRoot()],
      providers: [
        LoginPage,
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
});
