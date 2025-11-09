import { TestBed } from '@angular/core/testing';
import { ScheduledDeliveriesPage } from './scheduled-deliveries.page';

describe('ScheduledDeliveriesPage', () => {
  let component: ScheduledDeliveriesPage;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [ScheduledDeliveriesPage],
    });
    component = TestBed.inject(ScheduledDeliveriesPage);
  });

  it('should create the component', () => {
    expect(component).toBeTruthy();
  });
});
