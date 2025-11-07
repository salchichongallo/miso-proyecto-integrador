import { HttpClient } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { environment } from '@env/environment';
import {
  ReportFilters,
  ReportFilterOptions,
  SellerReport,
  SellerDetailRow,
} from '@web/pages/seller-reports/interfaces';

@Injectable({
  providedIn: 'root',
})
export class SellerReportsService {
  private readonly baseUrl = environment.vendorMicroserviceUrl;
  private readonly http = inject(HttpClient);

  /**
   * Get seller report with filters
   * @param filters Report filters
   * @returns Observable with seller report data
   */
  public getSellerReport(filters: ReportFilters): Observable<SellerReport> {
    const params = this.buildQueryParams(filters);
    return this.http.get<SellerReport>(`${this.baseUrl}/reports`, { params });
  }

  /**
   * Get filter options (vendors, regions, products)
   * @returns Observable with filter options
   */
  public getFilterOptions(): Observable<ReportFilterOptions> {
    return this.http.get<ReportFilterOptions>(`${this.baseUrl}/reports/filters`);
  }

  /**
   * Get detailed seller performance list
   * @param filters Report filters
   * @returns Observable with seller detail rows
   */
  public getSellerDetails(filters: ReportFilters): Observable<SellerDetailRow[]> {
    const params = this.buildQueryParams(filters);
    return this.http.get<SellerDetailRow[]>(`${this.baseUrl}/reports/details`, { params });
  }

  /**
   * Export report to PDF
   * @param filters Report filters
   * @returns Observable with PDF blob
   */
  public exportToPDF(filters: ReportFilters): Observable<Blob> {
    const params = this.buildQueryParams(filters);
    return this.http.get(`${this.baseUrl}/reports/export/pdf`, {
      params,
      responseType: 'blob',
    });
  }

  /**
   * Export report to Excel
   * @param filters Report filters
   * @returns Observable with Excel blob
   */
  public exportToExcel(filters: ReportFilters): Observable<Blob> {
    const params = this.buildQueryParams(filters);
    return this.http.get(`${this.baseUrl}/reports/export/excel`, {
      params,
      responseType: 'blob',
    });
  }

  /**
   * Build query parameters from filters
   * @param filters Report filters
   * @returns Query parameters object
   */
  private buildQueryParams(filters: ReportFilters): Record<string, string> {
    const params: Record<string, string> = {};

    if (filters.vendorId) {
      params['vendorId'] = filters.vendorId;
    }
    if (filters.startDate) {
      params['startDate'] = filters.startDate;
    }
    if (filters.endDate) {
      params['endDate'] = filters.endDate;
    }
    if (filters.region) {
      params['region'] = filters.region;
    }
    if (filters.productId) {
      params['productId'] = filters.productId;
    }

    return params;
  }
}
