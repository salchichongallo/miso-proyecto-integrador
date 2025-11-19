import { TestBed } from '@angular/core/testing';
import { TranslateModule, TranslateService } from '@ngx-translate/core';
import { VisitsService } from '@mobile/services/visits';

import { ConsultVisitsPage } from './consult-visits.page';

// jest.mock('@ngx-translate/core');
jest.mock('@mobile/services/visits');

beforeAll(() => {
  jest.useFakeTimers();
});

describe('ConsultVisitsPage', () => {
  let component: ConsultVisitsPage;
  let service: jest.Mocked<VisitsService>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [ConsultVisitsPage, VisitsService],
      imports: [TranslateModule.forRoot()],
    });
    component = TestBed.inject(ConsultVisitsPage);
    service = TestBed.inject(VisitsService) as jest.Mocked<VisitsService>;
    service.search.mockResolvedValue({ total: 1, visits: [{} as any] });
  });

  describe('load visits', () => {
    it('should load visits on init', async () => {
      await component.ngOnInit();
      expect(service.search).toHaveBeenCalledWith(component.selectedDate());
    });

    it('should load visits on date change', async () => {
      const newDate = new Date('2024-06-02').toISOString();
      await component.onChangeDate(newDate);
      expect(service.search).toHaveBeenCalledWith(newDate);
    });

    it('should update result after loading visits', async () => {
      await component.ngOnInit();
      expect(component.result().total).toBe(1);
      expect(component.result().visits.length).toBe(1);
    });
  });

  describe('error handling', () => {
    it('should show a toast on load error', async () => {
      service.search.mockRejectedValueOnce(new Error('Load error'));
      const toastSpy = jest.spyOn(component['toast'], 'create').mockResolvedValue({
        present: jest.fn(),
      } as any);
      await component.ngOnInit();
      expect(toastSpy).toHaveBeenCalled();
    });
  });
});
