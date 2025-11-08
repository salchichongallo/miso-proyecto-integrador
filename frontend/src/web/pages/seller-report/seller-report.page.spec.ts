import { of } from 'rxjs';
import { TestBed } from '@angular/core/testing';
import { SellerItem, VendorReportPage } from './seller-report.page';

import { SellerService } from '../../services/seller/seller.service';

jest.mock('../../services/seller/seller.service');

describe('VendorReportPage', () => {
  let component: VendorReportPage;
  let sellerService: jest.Mocked<SellerService>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [VendorReportPage, SellerService],
    });
    component = TestBed.inject(VendorReportPage);
    sellerService = TestBed.inject(SellerService) as jest.Mocked<SellerService>;
    sellerService.getVendors.mockReturnValue(of([]));
  });

  it('should load sellers on initialization', async () => {
    const mockSellers: SellerItem[] = [
      { name: 'Seller 1', vendor_id: '1' },
      { name: 'Seller 2', vendor_id: '2' },
    ];
    sellerService.getVendors.mockReturnValue(of(mockSellers as []));

    await component.ngOnInit();

    expect(sellerService.getVendors).toHaveBeenCalled();
    expect(component.sellers()).toEqual(mockSellers);
  });
});
