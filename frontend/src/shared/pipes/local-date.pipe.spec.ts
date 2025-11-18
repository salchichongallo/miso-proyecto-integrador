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
    // Arrange
    const translationServiceMock = {
      getCurrentLanguage: jest.fn(),
    } as any;

    TestBed.configureTestingModule({
      providers: [LocalDatePipe, { provide: TranslationService, useValue: translationServiceMock }],
    });

    pipe = TestBed.inject(LocalDatePipe);
    translationService = TestBed.inject(TranslationService) as jest.Mocked<TranslationService>;
  });

  it('should create', () => {
    // Assert
    expect(pipe).toBeTruthy();
  });

  describe('transform', () => {
    it('should return empty string when value is null or undefined', () => {
      // Arrange
      translationService.getCurrentLanguage.mockReturnValue('en');

      // Act
      const resultNull = pipe.transform(null);
      const resultUndefined = pipe.transform(undefined);

      // Assert
      expect(resultNull).toBe('');
      expect(resultUndefined).toBe('');
    });

    it('should format date with default format', () => {
      // Arrange
      translationService.getCurrentLanguage.mockReturnValue('en');
      const date = new Date('2023-12-25T10:30:00');

      // Act
      const result = pipe.transform(date);

      // Assert
      expect(result).toBeTruthy();
    });

    it('should format date with custom format', () => {
      // Arrange
      translationService.getCurrentLanguage.mockReturnValue('en');
      const date = new Date('2023-12-25T10:30:00');

      // Act
      const result = pipe.transform(date, 'dd/MM/yyyy');

      // Assert
      expect(result).toBeTruthy();
    });

    it('should use correct locale based on current language', () => {
      // Arrange
      const date = new Date('2023-12-25T10:30:00');

      // Act
      translationService.getCurrentLanguage.mockReturnValue('en');
      const resultEn = pipe.transform(date);

      translationService.getCurrentLanguage.mockReturnValue('es');
      const resultEs = pipe.transform(date);

      // Assert
      expect(resultEn).toBeTruthy();
      expect(resultEs).toBeTruthy();
      expect(translationService.getCurrentLanguage).toHaveBeenCalled();
    });
  });
});
