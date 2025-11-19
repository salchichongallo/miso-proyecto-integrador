import { TestBed } from '@angular/core/testing';
import { VisitCardItemComponent } from './visit-card-item.component';

describe('VisitCardItemComponent', () => {
  let component: VisitCardItemComponent;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [VisitCardItemComponent],
    });
    component = TestBed.inject(VisitCardItemComponent);
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
