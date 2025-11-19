import { TestBed } from '@angular/core/testing';
import { TranslationService } from '@shared/services/translation';

import { DateButtonComponent } from './date-button.component';

jest.mock('@shared/services/translation');

describe('DateButtonComponent', () => {
  let component: DateButtonComponent;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [DateButtonComponent, TranslationService],
    });
    component = TestBed.inject(DateButtonComponent);
  });

  describe('on changed', () => {
    it('should emit the new date in ISO format', () => {
      const emitSpy = jest.spyOn(component.onChanged, 'emit');
      const testDate = '2024-06-15T12:00:00Z';
      const event = { detail: { value: testDate } };

      component.onChange(event);
      expect(emitSpy).toHaveBeenCalledWith(new Date(testDate).toISOString());
    });
  });
});
