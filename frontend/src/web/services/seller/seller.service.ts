import { HttpClient } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';

import { Observable } from 'rxjs';

import { RegisterSellerRequest } from '@web/pages/seller-registration/interfaces/register-seller-request.interface';
import { RegisterSellerResponse } from '@web/pages/seller-registration/interfaces/register-seller-response.interface';
import { Vendor } from './interfaces/vendor.interface';

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
    return this.http.get<Vendor[]>(this.baseUrl + '/');
  }
}
