import { Injectable, inject } from '@angular/core';
import { TranslateService } from '@ngx-translate/core';
import { Preferences } from '@capacitor/preferences';
import { Capacitor } from '@capacitor/core';
import { AVAILABLE_LANGUAGES, DEFAULT_LANGUAGE, type Language } from '@shared/config';

const LANGUAGE_KEY = 'app_language';

@Injectable({
  providedIn: 'root',
})
export class TranslationService {
  private readonly translate = inject(TranslateService);
  private readonly isNativePlatform = Capacitor.isNativePlatform();

  constructor() {
    // Set default language
    this.translate.setDefaultLang(DEFAULT_LANGUAGE);
  }

  public async init(): Promise<void> {
    const savedLanguage = await this.getSavedLanguage();
    const language = savedLanguage || this.getBrowserLanguage() || DEFAULT_LANGUAGE;
    await this.setLanguage(language as Language);
  }

  public async setLanguage(language: Language): Promise<void> {
    this.translate.use(language);
    await this.saveLanguage(language);
  }

  public getCurrentLanguage(): Language {
    return this.translate.currentLang as Language;
  }

  public getAvailableLanguages(): Language[] {
    return [...AVAILABLE_LANGUAGES];
  }

  /**
   * Gets the saved language from storage
   * Uses Capacitor Preferences on native platforms (iOS/Android)
   * Uses localStorage on web platform
   */
  private async getSavedLanguage(): Promise<string | null> {
    try {
      if (this.isNativePlatform) {
        // Use Capacitor Preferences for native platforms
        const { value } = await Preferences.get({ key: LANGUAGE_KEY });
        return value;
      } else {
        // Use localStorage for web
        return localStorage.getItem(LANGUAGE_KEY);
      }
    } catch (error) {
      console.warn('Error getting saved language, falling back to localStorage:', error);
      // Fallback to localStorage if Preferences fails
      return localStorage.getItem(LANGUAGE_KEY);
    }
  }

  /**
   * Saves the language to storage
   * Uses Capacitor Preferences on native platforms (iOS/Android)
   * Uses localStorage on web platform
   */
  private async saveLanguage(language: Language): Promise<void> {
    try {
      if (this.isNativePlatform) {
        // Use Capacitor Preferences for native platforms
        await Preferences.set({ key: LANGUAGE_KEY, value: language });
      } else {
        // Use localStorage for web
        localStorage.setItem(LANGUAGE_KEY, language);
      }
    } catch (error) {
      console.warn('Error saving language, falling back to localStorage:', error);
      // Fallback to localStorage if Preferences fails
      localStorage.setItem(LANGUAGE_KEY, language);
    }
  }

  private getBrowserLanguage(): string | null {
    const browserLang = this.translate.getBrowserLang();
    if (browserLang && AVAILABLE_LANGUAGES.includes(browserLang as Language)) {
      return browserLang;
    }
    return null;
  }

  public getLocale() {
    const lang = this.getCurrentLanguage();
    const localeMap: Record<Language, string> = {
      en: 'en-US',
      es: 'es-CO',
    };
    return localeMap[lang];
  }
}
