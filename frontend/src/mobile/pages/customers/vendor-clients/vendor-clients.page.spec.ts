import { of } from 'rxjs';
import { TestBed } from '@angular/core/testing';
import { SellerService } from '../../../services/seller/seller.service';
import { VendorClientsPage } from './vendor-clients.page';

jest.mock('../../../services/seller/seller.service');

describe('VendorClientsPage', () => {
  let component: VendorClientsPage;
  let service: jest.Mocked<SellerService>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [VendorClientsPage, SellerService],
    });
    service = TestBed.inject(SellerService) as jest.Mocked<SellerService>;
    service.getMyClients.mockReturnValue(of([]));

    component = TestBed.inject(VendorClientsPage);
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
