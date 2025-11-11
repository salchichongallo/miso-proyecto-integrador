import { HttpClient } from '@angular/common/http';
import { importProvidersFrom, EnvironmentProviders, Provider } from '@angular/core';
import { TranslateModule, TranslateLoader, TranslationObject } from '@ngx-translate/core';
import { provideTranslateService } from '@ngx-translate/core';
import { provideTranslateHttpLoader } from '@ngx-translate/http-loader';
import { Observable } from 'rxjs';

/**
 * Available languages in the application
 */
export const AVAILABLE_LANGUAGES = ['es', 'en'] as const;
export type Language = (typeof AVAILABLE_LANGUAGES)[number];

/**
 * Default language for the application
 */
export const DEFAULT_LANGUAGE: Language = 'es';

/**
 * Fallback language when translation is not found
 */
export const FALLBACK_LANGUAGE: Language = 'en';

/**
 * Path to translation files
 */
export const TRANSLATION_PATH = './assets/i18n/';

/**
 * Custom TranslateLoader for loading translation files
 * This is used in the module-based approach (mobile)
 */
export class CustomTranslateLoader implements TranslateLoader {
  constructor(private http: HttpClient) {}

  getTranslation(lang: string): Observable<TranslationObject> {
    return this.http.get<TranslationObject>(`${TRANSLATION_PATH}${lang}.json`);
  }
}

/**
 * Factory function to create the TranslateLoader
 * Used in the module-based approach (mobile)
 */
export function createTranslateLoader(http: HttpClient): TranslateLoader {
  return new CustomTranslateLoader(http);
}

/**
 * Provides i18n configuration using the standalone API approach
 * This is the modern way and should be preferred for new applications
 * Used in web platform
 *
 * @returns EnvironmentProviders for i18n configuration
 */
export function provideI18nConfig() {
  return provideTranslateService({
    useDefaultLang: true,
    defaultLanguage: DEFAULT_LANGUAGE,
    fallbackLang: FALLBACK_LANGUAGE,
    loader: provideTranslateHttpLoader({
      prefix: TRANSLATION_PATH,
      suffix: '.json',
    }),
  });
}

/**
 * Provides i18n configuration using the module-based approach
 * This is needed for compatibility with older Angular applications
 * Used in mobile platform
 *
 * @returns Provider for i18n configuration using importProvidersFrom
 */
export function provideI18nModuleConfig() {
  return importProvidersFrom(
    TranslateModule.forRoot({
      loader: {
        provide: TranslateLoader,
        useFactory: createTranslateLoader,
        deps: [HttpClient],
      },
      defaultLanguage: DEFAULT_LANGUAGE,
    })
  );
}
