import { TestBed } from '@angular/core/testing';
import { provideHttpClient } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';

import { SellerService } from './seller.service';
import { RegisterSellerRequest } from '@web/pages/seller-registration/interfaces/register-seller-request.interface';
import { RegisterSellerResponse } from '@web/pages/seller-registration/interfaces/register-seller-response.interface';
import { Vendor } from './interfaces/vendor.interface';

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

  describe('getVendors', () => {
    it('should send GET request to vendor microservice URL', () => {
      const mockVendors: Vendor[] = [
        {
          vendor_id: 'VENDOR-001',
          name: 'John Doe',
          email: 'john@example.com',
          institutions: ['inst-1', 'inst-2'],
          created_at: '2025-01-15T10:00:00Z',
          updated_at: '2025-01-15T10:00:00Z',
        },
        {
          vendor_id: 'VENDOR-002',
          name: 'Jane Smith',
          email: 'jane@example.com',
          institutions: ['inst-3'],
          created_at: '2025-01-15T10:00:00Z',
          updated_at: '2025-01-15T10:00:00Z',
        },
      ];

      service.getVendors().subscribe((vendors) => {
        expect(vendors).toEqual(mockVendors);
        expect(vendors.length).toBe(2);
        expect(vendors[0].vendor_id).toBe('VENDOR-001');
      });

      const req = httpMock.expectOne(mockVendorUrl);
      expect(req.request.method).toBe('GET');
      req.flush(mockVendors);
    });

    it('should handle error response when getting vendors', () => {
      const mockError = {
        error: 'Failed to retrieve vendors',
        message: 'Internal Server Error',
      };

      service.getVendors().subscribe({
        next: () => fail('should have failed with error'),
        error: (error) => {
          expect(error.status).toBe(500);
          expect(error.error).toEqual(mockError);
        },
      });

      const req = httpMock.expectOne(mockVendorUrl);
      req.flush(mockError, { status: 500, statusText: 'Internal Server Error' });
    });

    it('should handle empty vendors list', () => {
      const emptyVendors: Vendor[] = [];

      service.getVendors().subscribe((vendors) => {
        expect(vendors).toEqual(emptyVendors);
        expect(vendors.length).toBe(0);
      });

      const req = httpMock.expectOne(mockVendorUrl);
      expect(req.request.method).toBe('GET');
      req.flush(emptyVendors);
    });
  });
});
