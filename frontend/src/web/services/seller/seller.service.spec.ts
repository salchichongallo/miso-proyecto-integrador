import { TestBed } from '@angular/core/testing';
import { provideHttpClient } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';

import { SellerService } from './seller.service';
import { RegisterSellerRequest } from '@web/pages/seller-registration/interfaces/register-seller-request.interface';
import { RegisterSellerResponse } from '@web/pages/seller-registration/interfaces/register-seller-response.interface';

// Mock environment
jest.mock('@env/environment', () => ({
  environment: {
    vendorMicroserviceUrl: 'http://test-vendor-api.com',
  },
}));

describe('SellerService', () => {
  let service: SellerService;
  let httpMock: HttpTestingController;
  const mockVendorUrl = 'http://test-vendor-api.com/';

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [SellerService, provideHttpClient(), provideHttpClientTesting()],
    });
    service = TestBed.inject(SellerService);
    httpMock = TestBed.inject(HttpTestingController);
  });

  afterEach(() => {
    httpMock.verify();
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  describe('registerSeller', () => {
    it('should send POST request to vendor microservice URL', () => {
      const mockRequest: RegisterSellerRequest = {
        name: 'John Doe',
        email: 'john@example.com',
        institutions: ['inst-1', 'inst-2'],
      };

      const mockResponse: RegisterSellerResponse = {
        mssg: 'Vendor registered successfully',
        vendor: {
          vendor_id: 'vendor-123',
          name: 'John Doe',
          email: 'john@example.com',
          institutions: ['inst-1', 'inst-2'],
        },
      };

      service.registerSeller(mockRequest).subscribe((response) => {
        expect(response).toEqual(mockResponse);
      });

      const req = httpMock.expectOne(mockVendorUrl);
      expect(req.request.method).toBe('POST');
      expect(req.request.body).toEqual(mockRequest);
      req.flush(mockResponse);
    });

    it('should handle error response', () => {
      const mockRequest: RegisterSellerRequest = {
        name: 'John Doe',
        email: 'john@example.com',
        institutions: ['inst-1'],
      };

      const mockError = {
        error: 'Vendor already exists',
        message: 'Bad Request',
      };

      service.registerSeller(mockRequest).subscribe({
        next: () => fail('should have failed with error'),
        error: (error) => {
          expect(error.status).toBe(400);
          expect(error.error).toEqual(mockError);
        },
      });

      const req = httpMock.expectOne(mockVendorUrl);
      req.flush(mockError, { status: 400, statusText: 'Bad Request' });
    });
  });
});
