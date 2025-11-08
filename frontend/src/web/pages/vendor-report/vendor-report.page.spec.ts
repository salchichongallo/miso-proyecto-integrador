import { TestBed } from '@angular/core/testing';
import { VendorReportPage } from './vendor-report.page';

describe('VendorReportPage', () => {
  let component: VendorReportPage;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [VendorReportPage],
    });
    component = TestBed.inject(VendorReportPage);
  });

  it('should create', () => {
    component.ngOnInit();
    expect(component).toBeTruthy();
  });
});
