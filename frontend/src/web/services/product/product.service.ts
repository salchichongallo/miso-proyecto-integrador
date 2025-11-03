import { HttpClient } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';

import { firstValueFrom, Observable, of } from 'rxjs';

import { environment } from '@env/environment';

import { RegisterProductRequest } from '@web/pages/product-registration/interfaces/register-product-request.interface';
import { RegisterProductResponse } from '@web/pages/product-registration/interfaces/register-product-response.interface';
import { SearchInventoryParams } from '@web/pages/product-inventory/interfaces/search-inventory-params.interface';

import { Product } from '@mobile/models/product.model';

@Injectable({
  providedIn: 'root',
})
export class ProductService {
  private readonly baseUrl = environment.productMicroserviceUrl;
  private readonly http = inject(HttpClient);

  public getProducts(): Observable<Product[]> {
    return this.http.get<Product[]>(this.baseUrl + '/');
  }

  public createProduct(body: RegisterProductRequest): Observable<RegisterProductResponse> {
    return this.http.post<RegisterProductResponse>(this.baseUrl + '/', body);
  }

  public createBulkProduct(file: File): Observable<object> {
    const formData = new FormData();
    formData.append('file', file);
    return this.http.post(`${this.baseUrl}/bulk`, formData);
  }

  public async search(params: SearchInventoryParams) {
    const url = this.baseUrl + '/';
    const request = this.http.get<Product[]>(url, {
      params: {
        product_name: params.productName,
        batch: params.batch,
        status: params.status,
        warehouse_name: params.warehouseName,
      },
    });
    return firstValueFrom(request);
  }
}
