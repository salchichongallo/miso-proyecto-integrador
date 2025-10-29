import { HttpClient } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';

import { Observable, of } from 'rxjs';

import { environment } from '@env/environment';

import { RegisterProductRequest } from '@web/pages/product-registration/interfaces/register-product-request.interface';
import { RegisterProductResponse } from '@web/pages/product-registration/interfaces/register-product-response.interface';

import { Product } from '@mobile/models/product.model';

const products: Product[] = [
  {
    provider_nit: '1234567816',
    product_type: 'Medicamento',
    storage_conditions: 'Conservar en lugar fresco y seco',
    temperature_required: 25,
    name: 'Producto 17',
    batch: 'L017',
    unit_value: 3.1,
    created_at: '2025-10-18T23:07:07.551425',
    sku: 'e236c0bc6c7242c892f942a835d2b6db',
    stock: 17,
    expiration_date: '2026-11-03',
    status: 'Disponible',
  },
  {
    provider_nit: '1234567892',
    product_type: 'Medicamento',
    storage_conditions: 'Conservar en lugar fresco y seco',
    temperature_required: 25,
    name: 'Producto 93',
    batch: 'L093',
    unit_value: 10.7,
    created_at: '2025-10-18T23:07:08.402411',
    sku: 'd63f51557bfb48368bff26631eb6c64c',
    stock: 43,
    expiration_date: '2027-01-18',
    status: 'Disponible',
  },
  {
    provider_nit: '1234567802',
    product_type: 'Medicamento',
    storage_conditions: 'Conservar en lugar fresco y seco',
    temperature_required: 25,
    name: 'Producto 3',
    batch: 'L003',
    unit_value: 1.7,
    created_at: '2025-10-18T23:07:07.385938',
    sku: '69aac792bebb4565a62f946bf0a44cc5',
    stock: 3,
    expiration_date: '2026-10-20',
    status: 'Disponible',
  },
];

@Injectable({
  providedIn: 'root',
})
export class ProductService {
  private readonly baseUrl = environment.productMicroserviceUrl;
  private readonly http = inject(HttpClient);

  public getProducts(): Observable<Product[]> {
    return of(products);
    // return this.http.get<Product[]>(this.baseUrl + '/');
  }

  public createProduct(body: RegisterProductRequest): Observable<RegisterProductResponse> {
    return this.http.post<RegisterProductResponse>(this.baseUrl + '/', body);
  }

  public createBulkProduct(file: File): Observable<object> {
    const formData = new FormData();
    formData.append('file', file);
    return this.http.post(`${this.baseUrl}/bulk`, formData);
  }
}
