import { TestBed } from '@angular/core/testing';
import { provideHttpClient } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';

import { AuthService } from '@shared/auth';
import { SellerService } from './seller.service';

jest.mock('@shared/auth');

jest.mock('@env/environment', () => ({
  environment: {
    vendorMicroserviceUrl: 'http://test-vendor-api.com',
  },
}));

describe('SellerService', () => {
  let service: SellerService;
  let httpMock: HttpTestingController;
  let authService: jest.Mocked<AuthService>;

  const mockVendorUrl = 'http://test-vendor-api.com/';

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [SellerService, provideHttpClient(), provideHttpClientTesting(), AuthService],
    });
    authService = TestBed.inject(AuthService) as jest.Mocked<AuthService>;
    service = TestBed.inject(SellerService);
    httpMock = TestBed.inject(HttpTestingController);
  });

  afterEach(() => {
    httpMock.verify();
  });

  describe('getMyClients', () => {
    it('should fetch the clients for the authenticated vendor', () => {
      const mockVendorId = 'vendor123';
      const mockResponse = {
        clients: [
          { id: 'client1', name: 'Client One' },
          { id: 'client2', name: 'Client Two' },
        ],
      };

      authService.getUserId.mockReturnValue(mockVendorId);

      service.getMyClients().subscribe((clients) => {
        expect(clients).toEqual(mockResponse.clients);
      });

      const req = httpMock.expectOne(`${mockVendorUrl}${mockVendorId}/clients`);
      expect(req.request.method).toBe('GET');
      req.flush(mockResponse);
    });
  });
});
