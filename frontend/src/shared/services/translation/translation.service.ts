import { Injectable, inject } from '@angular/core';
import { TranslateService } from '@ngx-translate/core';
import { Preferences } from '@capacitor/preferences';

export type Language = 'es' | 'en';

const LANGUAGE_KEY = 'app_language';

@Injectable({
  providedIn: 'root',
})
export class TranslationService {
  private readonly translate = inject(TranslateService);

  constructor() {
    // Set default language
    this.translate.setDefaultLang('es');
  }

  public async init(): Promise<void> {
    const savedLanguage = await this.getSavedLanguage();
    const language = savedLanguage || this.getBrowserLanguage() || 'es';
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
    return ['es', 'en'];
  }

  private async getSavedLanguage(): Promise<string | null> {
    const { value } = await Preferences.get({ key: LANGUAGE_KEY });
    return value;
  }

  private async saveLanguage(language: Language): Promise<void> {
    await Preferences.set({ key: LANGUAGE_KEY, value: language });
  }

  private getBrowserLanguage(): string | null {
    const browserLang = this.translate.getBrowserLang();
    if (browserLang && ['es', 'en'].includes(browserLang)) {
      return browserLang;
    }
    return null;
  }
}
