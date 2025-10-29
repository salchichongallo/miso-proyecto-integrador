import { HttpClient } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';

import { Observable } from 'rxjs';

import { environment } from '@env/environment';

import { RegisterProductRequest } from '@web/pages/product-registration/interfaces/register-product-request.interface';
import { RegisterProductResponse } from '@web/pages/product-registration/interfaces/register-product-response.interface';

@Injectable({
  providedIn: 'root',
})
export class ProductService {
  private readonly baseUrl = environment.productMicroserviceUrl;
  private readonly http = inject(HttpClient);

  public createProduct(body: RegisterProductRequest): Observable<RegisterProductResponse> {
    return this.http.post<RegisterProductResponse>(this.baseUrl + '/', body);
  }

  public createBulkProduct(file: File): Observable<object> {
    const formData = new FormData();
    formData.append('file', file);
    return this.http.post(`${this.baseUrl}/bulk`, formData);
  }
}
