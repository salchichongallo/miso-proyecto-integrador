import { formatDate } from '@angular/common';
import { inject, Pipe, PipeTransform } from '@angular/core';
import { TranslationService } from '../services/translation';

@Pipe({ name: 'localDate' })
export class LocalDatePipe implements PipeTransform {
  private readonly translation = inject(TranslationService);

  transform(value: any, format?: string) {
    if (!value) {
      return '';
    }
    return formatDate(value, format || 'shortDate', this.translation.getLocale());
  }
}
