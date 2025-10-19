import { HttpClient } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';

import { Observable } from 'rxjs';

import { environment } from '@env/environment';

import { RegisterSupplierResponse } from '@web/pages/supplier-registration/interfaces/register-supplier-response.interface';
import { RegisterSupplierRequest } from '@web/pages/supplier-registration/interfaces/register-supplier-request.interface';

@Injectable({
  providedIn: 'root',
})
export class SupplierService {
  private readonly baseUrl = environment.providerMicroserviceUrl;
  private readonly http = inject(HttpClient);

  public createSupplier(body: RegisterSupplierRequest): Observable<RegisterSupplierResponse> {
    return this.http.post<RegisterSupplierResponse>(this.baseUrl, body);
  }

  public createBulkSupplier(file: File): Observable<Object> {
    const formData = new FormData();
    formData.append('file', file);
    return this.http.post(`${this.baseUrl}/bulk`, formData);
  }
}
