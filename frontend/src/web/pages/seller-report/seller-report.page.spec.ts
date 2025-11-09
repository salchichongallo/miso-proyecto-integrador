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

  describe('seller report', () => {
    it('should generate report for selected seller', async () => {
      sellerService.getReport.mockResolvedValue({ sellerId: 'seller-123' } as any);

      component.sellerForm.setValue({ seller: 'seller-123' });
      await component.submit();

      const report = component.sellerReport();
      expect(report).toBeDefined();
      expect(report!.sellerId).toBe('seller-123');
    });

    it('should show error toast if report generation fails', async () => {
      sellerService.getReport.mockRejectedValue(new Error('Report generation failed'));

      component.sellerForm.setValue({ seller: 'seller-123' });
      const toastSpy = jest.spyOn(component['toast'], 'create').mockResolvedValue({
        present: jest.fn(),
      } as any);

      await component.submit();

      expect(toastSpy).toHaveBeenCalledWith(
        expect.objectContaining({
          message: 'Error al generar reporte. Report generation failed',
        }),
      );
    });
  });
});
