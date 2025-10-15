import { Router } from '@angular/router';
import { TestBed } from '@angular/core/testing';

import { LoginTemplate } from './login.template';

describe('LoginTemplate', () => {
  let page: LoginTemplate;
  let router: Router;

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [LoginTemplate],
      providers: [
        LoginTemplate,
        {
          provide: Router,
          useValue: { navigate: jest.fn() },
        },
      ],
    });
    page = TestBed.inject(LoginTemplate);
    router = TestBed.inject(Router);
  });

  it('should navigate to dashboard', async () => {
    await page.redirectToDashboard();
    expect(router.navigate).toHaveBeenCalledWith(['/']);
  });
});
