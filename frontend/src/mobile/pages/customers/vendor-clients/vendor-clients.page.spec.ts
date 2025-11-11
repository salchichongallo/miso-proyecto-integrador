import { TestBed } from '@angular/core/testing';
import { VendorClientsPage } from './vendor-clients.page';

describe('VendorClientsPage', () => {
  let component: VendorClientsPage;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [VendorClientsPage],
    });
    component = TestBed.inject(VendorClientsPage);
  });

  it('should be defined', () => {
    expect(component).toBeDefined();
  });
});
