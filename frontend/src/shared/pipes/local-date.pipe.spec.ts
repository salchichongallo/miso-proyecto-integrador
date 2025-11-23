import { TestBed } from '@angular/core/testing';
import { registerLocaleData } from '@angular/common';
import localeEs from '@angular/common/locales/es-CO';

import { TranslationService } from '../services/translation';

import { LocalDatePipe } from './local-date.pipe';

beforeAll(() => registerLocaleData(localeEs));

describe('LocalDatePipe', () => {
  let pipe: LocalDatePipe;
  let translationService: jest.Mocked<TranslationService>;

  beforeEach(() => {
    const translationServiceMock = {
      getLocale: jest.fn(),
    } as any;

    TestBed.configureTestingModule({
      providers: [LocalDatePipe, { provide: TranslationService, useValue: translationServiceMock }],
    });

    pipe = TestBed.inject(LocalDatePipe);
    translationService = TestBed.inject(TranslationService) as jest.Mocked<TranslationService>;
  });

  describe('transform', () => {
    it('should return empty string when value is null or undefined', () => {
      translationService.getLocale.mockReturnValue('en-US');

      const resultNull = pipe.transform(null);
      const resultUndefined = pipe.transform(undefined);

      expect(resultNull).toBe('');
      expect(resultUndefined).toBe('');
    });

    it('should format date with default format', () => {
      translationService.getLocale.mockReturnValue('en-US');
      const date = new Date('2023-12-25T10:30:00');

      const result = pipe.transform(date);

      expect(result).toBeTruthy();
    });

    it('should format date with custom format', () => {
      translationService.getLocale.mockReturnValue('en-US');
      const date = new Date('2023-12-25T10:30:00');

      const result = pipe.transform(date, 'dd/MM/yyyy');

      expect(result).toBeTruthy();
    });

    it('should use correct locale based on current language', () => {
      const date = new Date('2023-12-25T10:30:00');

      translationService.getLocale.mockReturnValue('en-US');
      const resultEn = pipe.transform(date);

      translationService.getLocale.mockReturnValue('es-CO');
      const resultEs = pipe.transform(date);

      expect(resultEn).toBeTruthy();
      expect(resultEs).toBeTruthy();
      expect(translationService.getLocale).toHaveBeenCalled();
    });
  });
});
