import { Router } from '@angular/router';
import { TestBed } from '@angular/core/testing';

import { AuthService } from '@shared/auth';
import { TranslationService } from '@shared/services/translation';

import { SettingsPage } from './settings.page';

jest.mock('@shared/auth');
jest.mock('@shared/services/translation');

describe('SettingsPage', () => {
  describe('logout', () => {
    let router: jest.Mocked<Pick<Router, 'navigateByUrl'>>;
    let authService: jest.Mocked<AuthService>;
    let page: SettingsPage;

    beforeEach(() => {
      router = { navigateByUrl: jest.fn().mockResolvedValue(true) };
      TestBed.configureTestingModule({
        providers: [SettingsPage, AuthService, TranslationService, { provide: Router, useValue: router }],
      });
      page = TestBed.inject(SettingsPage);
      authService = TestBed.inject(AuthService) as jest.Mocked<AuthService>;
    });

    it('should logout user successfully', async () => {
      await page.onLogout();
      expect(authService.logout).toHaveBeenCalled();
      expect(router.navigateByUrl).toHaveBeenCalledWith('/login');
    });
  });
});
