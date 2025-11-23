import { HttpClient } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';

import { firstValueFrom, map, Observable } from 'rxjs';

import { SellerReport } from '../../pages/seller-report/interfaces/seller-report.interface';

import { RegisterSellerRequest } from '@web/pages/seller-registration/interfaces/register-seller-request.interface';
import { RegisterSellerResponse } from '@web/pages/seller-registration/interfaces/register-seller-response.interface';
import { Vendor, VendorResponse } from './interfaces/vendor.interface';
import { HttpSellerReport } from './interfaces/seller-report.response';

import { environment } from '@env/environment';

@Injectable({
  providedIn: 'root',
})
export class SellerService {
  private readonly baseUrl = environment.vendorMicroserviceUrl;
  private readonly http = inject(HttpClient);

  public registerSeller(sellerData: RegisterSellerRequest): Observable<RegisterSellerResponse> {
    return this.http.post<RegisterSellerResponse>(this.baseUrl + '/', sellerData);
  }

  public getVendors(): Observable<Vendor[]> {
    return this.http.get<VendorResponse[]>(this.baseUrl + '/').pipe(
      map((response) =>
        response.map((vendor) => ({
          ...vendor,
          institutions: vendor.institutions.map((it) => it.name),
        })),
      ),
    );
  }

  public async getReport(sellerId: string): Promise<SellerReport> {
    const url = `${this.baseUrl}/sales_plan/${sellerId}`;
    const response = await firstValueFrom(this.http.get<HttpSellerReport>(url));
    return {
      sellerId: response.vendor_id,
      orderedProducts: response.ordered_products,
      salesPercentage: response.sales_percentage,
      soldProducts: response.sold_products.map((it) => ({
        id: it.id,
        name: it.name,
        quantity: `${it.quantity} unidades`,
      })),
      customersServed: response.customers_served,
      totalSales: response.total_sales,
    };
  }
}
