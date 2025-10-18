import { TestBed } from '@angular/core/testing';
import { provideHttpClient } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';

import { ProductService } from './product.service';

// Mock environment
jest.mock('@env/environment', () => ({
  environment: {
    productMicroserviceUrl: 'http://test-product-api.com',
  },
}));

describe('ProductService', () => {
  let service: ProductService;
  let httpMock: HttpTestingController;
  const mockProductUrl = 'http://test-product-api.com';

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [ProductService, provideHttpClient(), provideHttpClientTesting()],
    });
    service = TestBed.inject(ProductService);
    httpMock = TestBed.inject(HttpTestingController);
  });

  afterEach(() => {
    httpMock.verify();
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  describe('createBulkProduct', () => {
    it('should send POST request with FormData to bulk endpoint', () => {
      const mockFile = new File(['test content'], 'products.csv', { type: 'text/csv' });
      const mockResponse = { message: 'Products uploaded successfully' };

      service.createBulkProduct(mockFile).subscribe((response) => {
        expect(response).toEqual(mockResponse);
      });

      const req = httpMock.expectOne(`${mockProductUrl}/bulk`);
      expect(req.request.method).toBe('POST');
      expect(req.request.body instanceof FormData).toBe(true);
      expect(req.request.body.get('file')).toBe(mockFile);
      req.flush(mockResponse);
    });

    it('should handle error response', () => {
      const mockFile = new File(['test content'], 'products.csv', { type: 'text/csv' });
      const mockError = {
        error: 'Invalid file format',
        message: 'Bad Request',
      };

      service.createBulkProduct(mockFile).subscribe({
        next: () => fail('should have failed with error'),
        error: (error) => {
          expect(error.status).toBe(400);
          expect(error.error).toEqual(mockError);
        },
      });

      const req = httpMock.expectOne(`${mockProductUrl}/bulk`);
      req.flush(mockError, { status: 400, statusText: 'Bad Request' });
    });
  });
});
