import { TestBed } from '@angular/core/testing';
import { HttpClientTestingModule, HttpTestingController } from '@angular/common/http/testing';
import { SellerReportsService } from './seller-reports.service';
import { environment } from '@env/environment';
import { ReportFilters, SellerReport } from '@web/pages/seller-reports/interfaces';

describe('SellerReportsService', () => {
  let service: SellerReportsService;
  let httpMock: HttpTestingController;
  const baseUrl = environment.vendorMicroserviceUrl;

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [HttpClientTestingModule],
      providers: [SellerReportsService],
    });
    service = TestBed.inject(SellerReportsService);
    httpMock = TestBed.inject(HttpTestingController);
  });

  afterEach(() => {
    httpMock.verify();
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  it('should get seller report with filters', () => {
    const filters: ReportFilters = {
      vendorId: '123',
      startDate: '2024-01-01',
      endDate: '2024-12-31',
    };

    const mockReport: SellerReport = {
      vendorId: '123',
      vendorName: 'Test Vendor',
      totalSales: 9414000,
      goalCompletion: 83,
      customersServed: 93,
      ordersGenerated: 184,
      salesGrowth: 12.5,
      goalGrowth: 12.5,
      customersGrowth: 12.5,
      ordersGrowth: 12.5,
      topProducts: [],
      salesByMonth: [],
    };

    service.getSellerReport(filters).subscribe((report) => {
      expect(report).toEqual(mockReport);
    });

    const req = httpMock.expectOne(
      `${baseUrl}/reports?vendorId=123&startDate=2024-01-01&endDate=2024-12-31`
    );
    expect(req.request.method).toBe('GET');
    req.flush(mockReport);
  });

  it('should get filter options', () => {
    const mockOptions = {
      vendors: [{ id: '1', name: 'Vendor 1' }],
      regions: [{ id: 'r1', name: 'Region 1' }],
      products: [{ id: 'p1', name: 'Product 1' }],
    };

    service.getFilterOptions().subscribe((options) => {
      expect(options).toEqual(mockOptions);
    });

    const req = httpMock.expectOne(`${baseUrl}/reports/filters`);
    expect(req.request.method).toBe('GET');
    req.flush(mockOptions);
  });

  it('should export to PDF', () => {
    const filters: ReportFilters = { vendorId: '123' };
    const mockBlob = new Blob(['pdf content'], { type: 'application/pdf' });

    service.exportToPDF(filters).subscribe((blob) => {
      expect(blob).toEqual(mockBlob);
    });

    const req = httpMock.expectOne(`${baseUrl}/reports/export/pdf?vendorId=123`);
    expect(req.request.method).toBe('GET');
    expect(req.request.responseType).toBe('blob');
    req.flush(mockBlob);
  });

  it('should export to Excel', () => {
    const filters: ReportFilters = { vendorId: '123' };
    const mockBlob = new Blob(['excel content'], { type: 'application/vnd.ms-excel' });

    service.exportToExcel(filters).subscribe((blob) => {
      expect(blob).toEqual(mockBlob);
    });

    const req = httpMock.expectOne(`${baseUrl}/reports/export/excel?vendorId=123`);
    expect(req.request.method).toBe('GET');
    expect(req.request.responseType).toBe('blob');
    req.flush(mockBlob);
  });
});
