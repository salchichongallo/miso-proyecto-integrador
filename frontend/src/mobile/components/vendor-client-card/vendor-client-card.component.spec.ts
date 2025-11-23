import { TestBed } from '@angular/core/testing';
import { VendorClientCardComponent } from './vendor-client-card.component';

describe('VendorClientCardComponent', () => {
  let component: VendorClientCardComponent;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [VendorClientCardComponent],
    });
    component = TestBed.inject(VendorClientCardComponent);
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
