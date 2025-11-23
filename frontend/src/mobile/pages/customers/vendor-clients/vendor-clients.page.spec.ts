import { of } from 'rxjs';
import { TestBed } from '@angular/core/testing';
import { SellerService } from '../../../services/seller/seller.service';
import { VendorClientsPage } from './vendor-clients.page';

jest.mock('../../../services/seller/seller.service');

describe('VendorClientsPage', () => {
  let component: VendorClientsPage;
  let service: jest.Mocked<SellerService>;

  const setupPage = (clients: any = []) => {
    TestBed.configureTestingModule({
      providers: [VendorClientsPage, SellerService],
    });
    service = TestBed.inject(SellerService) as jest.Mocked<SellerService>;
    service.getMyClients.mockReturnValue(of(clients));

    component = TestBed.inject(VendorClientsPage);
  };

  describe('search', () => {
    it('should filter clients based on search term', () => {
      const mockClients = [
        { name: 'Client One', country: 'US' },
        { name: 'Client Two', country: 'CA' },
        { name: 'Another Client', country: 'US' },
      ];
      setupPage(mockClients);

      // Initial state: no search term, all clients should be returned
      expect(component.clients()).toHaveLength(3);

      // Set search term to 'Client'
      component.handleInput({ target: { value: 'Client' } } as any);
      expect(component.clients()).toHaveLength(3);

      // Set search term to 'Another'
      component.handleInput({ target: { value: 'Another' } } as any);
      expect(component.clients()).toHaveLength(1);
      expect(component.clients()[0].name).toBe('Another Client');

      // Set search term to 'Nonexistent'
      component.handleInput({ target: { value: 'Nonexistent' } } as any);
      expect(component.clients()).toHaveLength(0);
    });

    it('should handle empty search term', () => {
      const mockClients = [
        { name: 'Client One', country: 'US' },
        { name: 'Client Two', country: 'CA' },
      ];
      setupPage(mockClients);

      // Set search term to empty string
      component.handleInput({ target: { value: '' } } as any);
      expect(component.clients()).toHaveLength(2);
    });
  });
});
