import { HttpClient } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';

import { firstValueFrom, map, Observable, of } from 'rxjs';

import { environment } from '@env/environment';

import { RegisterProductRequest } from '@web/pages/product-registration/interfaces/register-product-request.interface';
import { RegisterProductResponse } from '@web/pages/product-registration/interfaces/register-product-response.interface';
import { SearchInventoryParams } from '@web/pages/product-inventory/interfaces/search-inventory-params.interface';

import { Product } from '@mobile/models/product.model';

type BulkProductResponse = {
  approved: unknown[];
  rejected: unknown[];
  message: string;
  rejected_records: number;
  success_rate: string;
  successful_records: number;
  total_records: number;
};

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
    return this.http.post<BulkProductResponse>(`${this.baseUrl}/bulk`, formData).pipe(
      map((response) => {
        const allCompleted = response.total_records === response.successful_records;
        if (allCompleted) {
          return response;
        }
        if (response.successful_records === 0) {
          throw new Error('Error: No se pudo cargar ningún producto.');
        }
        const message = `Error: Se cargaron ${response.successful_records} de ${response.total_records} productos.`;
        throw new Error(message);
      }),
    );
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
