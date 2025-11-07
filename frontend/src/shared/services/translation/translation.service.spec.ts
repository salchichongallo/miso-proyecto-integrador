import { TestBed } from '@angular/core/testing';
import { TranslateModule, TranslateService } from '@ngx-translate/core';
import { Preferences } from '@capacitor/preferences';

import { TranslationService, Language } from './translation.service';

jest.mock('@capacitor/preferences');

describe('TranslationService', () => {
  let service: TranslationService;
  let translateService: TranslateService;

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [TranslateModule.forRoot()],
      providers: [TranslationService],
    });

    service = TestBed.inject(TranslationService);
    translateService = TestBed.inject(TranslateService);

    jest.clearAllMocks();
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('Service Initialization', () => {
    it('should create the service', () => {
      expect(service).toBeTruthy();
    });

    it('should set default language to "es" on creation', () => {
      // Verify that the default language was set during construction
      expect(translateService.getDefaultLang()).toBe('es');
    });
  });

  describe('init', () => {
    it('should use saved language if available', async () => {
      const mockGet = jest.fn().mockResolvedValue({ value: 'en' });
      const mockSet = jest.fn().mockResolvedValue(undefined);
      (Preferences.get as jest.Mock) = mockGet;
      (Preferences.set as jest.Mock) = mockSet;
      const useSpy = jest.spyOn(translateService, 'use');

      await service.init();

      expect(mockGet).toHaveBeenCalledWith({ key: 'app_language' });
      expect(useSpy).toHaveBeenCalledWith('en');
    });

    it('should use browser language if no saved language', async () => {
      const mockGet = jest.fn().mockResolvedValue({ value: null });
      const mockSet = jest.fn().mockResolvedValue(undefined);
      (Preferences.get as jest.Mock) = mockGet;
      (Preferences.set as jest.Mock) = mockSet;
      jest.spyOn(translateService, 'getBrowserLang').mockReturnValue('en');
      const useSpy = jest.spyOn(translateService, 'use');

      await service.init();

      expect(useSpy).toHaveBeenCalledWith('en');
    });

    it('should fallback to "es" if no saved or browser language', async () => {
      const mockGet = jest.fn().mockResolvedValue({ value: null });
      const mockSet = jest.fn().mockResolvedValue(undefined);
      (Preferences.get as jest.Mock) = mockGet;
      (Preferences.set as jest.Mock) = mockSet;
      jest.spyOn(translateService, 'getBrowserLang').mockReturnValue(undefined);
      const useSpy = jest.spyOn(translateService, 'use');

      await service.init();

      expect(useSpy).toHaveBeenCalledWith('es');
    });

    it('should save the selected language', async () => {
      const mockGet = jest.fn().mockResolvedValue({ value: null });
      const mockSet = jest.fn().mockResolvedValue(undefined);
      (Preferences.get as jest.Mock) = mockGet;
      (Preferences.set as jest.Mock) = mockSet;
      jest.spyOn(translateService, 'getBrowserLang').mockReturnValue('en');

      await service.init();

      expect(mockSet).toHaveBeenCalledWith({ key: 'app_language', value: 'en' });
    });
  });

  describe('setLanguage', () => {
    it('should set language to Spanish', async () => {
      const mockSet = jest.fn().mockResolvedValue(undefined);
      (Preferences.set as jest.Mock) = mockSet;
      const useSpy = jest.spyOn(translateService, 'use');

      await service.setLanguage('es');

      expect(useSpy).toHaveBeenCalledWith('es');
      expect(mockSet).toHaveBeenCalledWith({ key: 'app_language', value: 'es' });
    });

    it('should set language to English', async () => {
      const mockSet = jest.fn().mockResolvedValue(undefined);
      (Preferences.set as jest.Mock) = mockSet;
      const useSpy = jest.spyOn(translateService, 'use');

      await service.setLanguage('en');

      expect(useSpy).toHaveBeenCalledWith('en');
      expect(mockSet).toHaveBeenCalledWith({ key: 'app_language', value: 'en' });
    });

    it('should save language to preferences', async () => {
      const mockSet = jest.fn().mockResolvedValue(undefined);
      (Preferences.set as jest.Mock) = mockSet;

      await service.setLanguage('en');

      expect(mockSet).toHaveBeenCalledWith({ key: 'app_language', value: 'en' });
    });
  });

  describe('getCurrentLanguage', () => {
    it('should return current language from TranslateService', () => {
      jest.spyOn(translateService, 'currentLang', 'get').mockReturnValue('es');

      const currentLang = service.getCurrentLanguage();

      expect(currentLang).toBe('es');
    });

    it('should reflect language changes', async () => {
      const mockSet = jest.fn().mockResolvedValue(undefined);
      (Preferences.set as jest.Mock) = mockSet;

      await service.setLanguage('en');
      jest.spyOn(translateService, 'currentLang', 'get').mockReturnValue('en');

      const currentLang = service.getCurrentLanguage();

      expect(currentLang).toBe('en');
    });
  });

  describe('getAvailableLanguages', () => {
    it('should return array with Spanish and English', () => {
      const languages = service.getAvailableLanguages();

      expect(languages).toEqual(['es', 'en']);
    });

    it('should return Language[] type', () => {
      const languages: Language[] = service.getAvailableLanguages();

      expect(Array.isArray(languages)).toBe(true);
      expect(languages.length).toBe(2);
    });
  });

  describe('Private Methods - Browser Language Detection', () => {
    it('should return browser language if it is Spanish', async () => {
      const mockGet = jest.fn().mockResolvedValue({ value: null });
      (Preferences.get as jest.Mock) = mockGet;
      jest.spyOn(translateService, 'getBrowserLang').mockReturnValue('es');
      const useSpy = jest.spyOn(translateService, 'use');

      await service.init();

      expect(useSpy).toHaveBeenCalledWith('es');
    });

    it('should return browser language if it is English', async () => {
      const mockGet = jest.fn().mockResolvedValue({ value: null });
      (Preferences.get as jest.Mock) = mockGet;
      jest.spyOn(translateService, 'getBrowserLang').mockReturnValue('en');
      const useSpy = jest.spyOn(translateService, 'use');

      await service.init();

      expect(useSpy).toHaveBeenCalledWith('en');
    });

    it('should fallback to Spanish for unsupported browser language', async () => {
      const mockGet = jest.fn().mockResolvedValue({ value: null });
      (Preferences.get as jest.Mock) = mockGet;
      jest.spyOn(translateService, 'getBrowserLang').mockReturnValue('fr');
      const useSpy = jest.spyOn(translateService, 'use');

      await service.init();

      expect(useSpy).toHaveBeenCalledWith('es');
    });
  });

  describe('Preferences Storage', () => {
    it('should retrieve saved language from Preferences', async () => {
      const mockGet = jest.fn().mockResolvedValue({ value: 'en' });
      (Preferences.get as jest.Mock) = mockGet;

      await service.init();

      expect(mockGet).toHaveBeenCalledWith({ key: 'app_language' });
    });

    it('should save language to Preferences when setting language', async () => {
      const mockSet = jest.fn().mockResolvedValue(undefined);
      (Preferences.set as jest.Mock) = mockSet;

      await service.setLanguage('es');

      expect(mockSet).toHaveBeenCalledWith({ key: 'app_language', value: 'es' });
    });
  });
});
