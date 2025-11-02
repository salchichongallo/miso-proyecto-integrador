import { TestBed } from '@angular/core/testing';
import { provideHttpClient } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';

import { SalesPlanService } from './sales-plan.service';
import { CreateSalesPlanRequest } from '@web/pages/sales-plan-creation/interfaces/create-sales-plan-request.interface';
import { CreateSalesPlanResponse } from '@web/pages/sales-plan-creation/interfaces/create-sales-plan-response.interface';

jest.mock('@env/environment', () => ({
  environment: {
    vendorMicroserviceUrl: 'http://test-vendor-api.com',
  },
}));

describe('SalesPlanService', () => {
  let service: SalesPlanService;
  let httpMock: HttpTestingController;
  const mockVendorUrl = 'http://test-vendor-api.com/sales_plan/';

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [SalesPlanService, provideHttpClient(), provideHttpClientTesting()],
    });
    service = TestBed.inject(SalesPlanService);
    httpMock = TestBed.inject(HttpTestingController);
  });

  afterEach(() => {
    httpMock.verify();
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  describe('createSalesPlan', () => {
    it('should send POST request to sales plan endpoint', () => {
      const mockRequest: CreateSalesPlanRequest = {
        vendor_id: 'VENDOR-123',
        period: 'Q2-2025',
        region: 'North America',
        products: [
          {
            product_id: 'P-001',
            name: 'Smartwatch X',
            target_units: 100,
            target_value: 25000,
          },
          {
            product_id: 'P-002',
            name: 'Smartband Pro',
            target_units: 200,
            target_value: 15000,
          },
        ],
      };

      const mockResponse: CreateSalesPlanResponse = {
        message: 'Sales Plan successfully created.',
        plan: {
          plan_id: 'PLAN-001',
          vendor_id: 'VENDOR-123',
          period: 'Q2-2025',
          region: 'North America',
          products: [
            {
              product_id: 'P-001',
              name: 'Smartwatch X',
              target_units: 100,
              target_value: 25000,
            },
            {
              product_id: 'P-002',
              name: 'Smartband Pro',
              target_units: 200,
              target_value: 15000,
            },
          ],
          created_at: '2025-01-15T10:00:00Z',
          updated_at: '2025-01-15T10:00:00Z',
        },
      };

      service.createSalesPlan(mockRequest).subscribe((response) => {
        expect(response).toEqual(mockResponse);
        expect(response.plan.plan_id).toBe('PLAN-001');
        expect(response.plan.products.length).toBe(2);
      });

      const req = httpMock.expectOne(mockVendorUrl);
      expect(req.request.method).toBe('POST');
      expect(req.request.body).toEqual(mockRequest);
      req.flush(mockResponse);
    });

    it('should handle error response', () => {
      const mockRequest: CreateSalesPlanRequest = {
        vendor_id: 'VENDOR-123',
        period: 'Q2-2025',
        region: 'North America',
        products: [
          {
            product_id: 'P-001',
            name: 'Product',
            target_units: 100,
            target_value: 25000,
          },
        ],
      };

      const mockError = {
        error: 'Vendor already has an active plan for this period',
        message: 'Bad Request',
      };

      service.createSalesPlan(mockRequest).subscribe({
        next: () => fail('should have failed with error'),
        error: (error) => {
          expect(error.status).toBe(400);
          expect(error.error).toEqual(mockError);
        },
      });

      const req = httpMock.expectOne(mockVendorUrl);
      req.flush(mockError, { status: 400, statusText: 'Bad Request' });
    });

    it('should handle validation error for invalid products', () => {
      const mockRequest: CreateSalesPlanRequest = {
        vendor_id: 'VENDOR-123',
        period: 'Q2-2025',
        region: 'North America',
        products: [],
      };

      const mockError = {
        error: 'Products list cannot be empty',
        message: 'Validation Error',
      };

      service.createSalesPlan(mockRequest).subscribe({
        next: () => fail('should have failed with error'),
        error: (error) => {
          expect(error.status).toBe(422);
          expect(error.error).toEqual(mockError);
        },
      });

      const req = httpMock.expectOne(mockVendorUrl);
      req.flush(mockError, { status: 422, statusText: 'Unprocessable Entity' });
    });
  });
});
