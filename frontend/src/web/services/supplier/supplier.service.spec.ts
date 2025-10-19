import { TestBed } from '@angular/core/testing';
import { provideHttpClient } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';

import { SupplierService } from './supplier.service';
import { RegisterSupplierRequest } from '@web/pages/supplier-registration/interfaces/register-supplier-request.interface';
import { RegisterSupplierResponse } from '@web/pages/supplier-registration/interfaces/register-supplier-response.interface';

// Mock environment
jest.mock('@env/environment', () => ({
  environment: {
    providerMicroserviceUrl: 'http://test-provider-api.com',
  },
}));

describe('SupplierService', () => {
  let service: SupplierService;
  let httpMock: HttpTestingController;
  const mockProviderUrl = 'http://test-provider-api.com/';

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [SupplierService, provideHttpClient(), provideHttpClientTesting()],
    });
    service = TestBed.inject(SupplierService);
    httpMock = TestBed.inject(HttpTestingController);
  });

  afterEach(() => {
    httpMock.verify();
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  describe('createSupplier', () => {
    it('should send POST request to provider microservice URL', () => {
      const mockRequest: RegisterSupplierRequest = {
        name: 'Medical Supplies Inc.',
        email: 'contact@medicalsupplies.com',
        phone: '+57 300 123 4567',
        country: 'Colombia',
        nit: '900123456-7',
        address: 'Calle 123 #45-67',
      };

      const mockResponse: RegisterSupplierResponse = {
        message: 'Provider registered successfully',
        provider: {
          provider_id: 'provider-123',
          name: 'Medical Supplies Inc.',
          email: 'contact@medicalsupplies.com',
          phone: '+57 300 123 4567',
          country: 'Colombia',
          nit: '900123456-7',
          address: 'Calle 123 #45-67',
          message: 'Created',
        },
      };

      service.createSupplier(mockRequest).subscribe((response) => {
        expect(response).toEqual(mockResponse);
      });

      const req = httpMock.expectOne(mockProviderUrl);
      expect(req.request.method).toBe('POST');
      expect(req.request.body).toEqual(mockRequest);
      req.flush(mockResponse);
    });

    it('should handle error response', () => {
      const mockRequest: RegisterSupplierRequest = {
        name: 'Medical Supplies Inc.',
        email: 'contact@medicalsupplies.com',
        phone: '+57 300 123 4567',
        country: 'Colombia',
        nit: '900123456-7',
        address: 'Calle 123 #45-67',
      };

      const mockError = {
        error: 'Provider already exists',
        message: 'Bad Request',
      };

      service.createSupplier(mockRequest).subscribe({
        next: () => fail('should have failed with error'),
        error: (error) => {
          expect(error.status).toBe(400);
          expect(error.error).toEqual(mockError);
        },
      });

      const req = httpMock.expectOne(mockProviderUrl);
      req.flush(mockError, { status: 400, statusText: 'Bad Request' });
    });
  });
});
