import { TestBed } from '@angular/core/testing';
import { LoginPage } from './login.page';

describe('LoginPage', () => {
  let page: LoginPage;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [LoginPage],
    });
    page = TestBed.inject(LoginPage);
  });

  it('should create an instance', () => {
    expect(page).toBeTruthy();
  });
});
