import { TestBed } from '@angular/core/testing';
import { ConsultVisitsPage } from './consult-visits.page';

describe('ConsultVisitsPage', () => {
  let component: ConsultVisitsPage;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [ConsultVisitsPage],
    });
    component = TestBed.inject(ConsultVisitsPage);
  });

  it('should work', () => {
    expect(component).toBeTruthy();
  });
});
