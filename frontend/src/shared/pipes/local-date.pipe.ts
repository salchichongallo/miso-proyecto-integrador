import { formatDate } from '@angular/common';
import { inject, Pipe, PipeTransform } from '@angular/core';
import { Language, TranslationService } from '../services/translation';

@Pipe({ name: 'localDate' })
export class LocalDatePipe implements PipeTransform {
  private readonly translation = inject(TranslationService);

  transform(value: any, format?: string) {
    if (!value) {
      return '';
    }
    return formatDate(value, format || 'shortDate', this.getLocale());
  }

  private getLocale() {
    const lang = this.translation.getCurrentLanguage();
    const localeMap: Record<Language, string> = {
      en: 'en-US',
      es: 'es-CO',
    };
    return localeMap[lang];
  }
}
