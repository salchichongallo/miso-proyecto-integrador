import { TestBed } from '@angular/core/testing';
import { TranslationService } from '@shared/services/translation';
import { LanguageSwitcherComponent } from './language-switcher.component';

jest.mock('@shared/services/translation');

describe('LanguageSwitcherComponent', () => {
  let component: LanguageSwitcherComponent;
  let translationService: jest.Mocked<TranslationService>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [LanguageSwitcherComponent, TranslationService],
    });
    component = TestBed.inject(LanguageSwitcherComponent);
    translationService = TestBed.inject(TranslationService) as jest.Mocked<TranslationService>;
  });

  describe('onChangeLanguage', () => {
    it('should call setLanguage on translationService with the provided language', () => {
      const event = { preventDefault: jest.fn() } as unknown as Event;
      const language = 'es';

      component.onChangeLanguage(event, language);

      expect(translationService.setLanguage).toHaveBeenCalledWith(language);
    });

    it('should call preventDefault on the event', () => {
      const event = { preventDefault: jest.fn() } as unknown as Event;
      const language = 'en';

      component.onChangeLanguage(event, language);
      expect(event.preventDefault).toHaveBeenCalled();
    });
  });
});
