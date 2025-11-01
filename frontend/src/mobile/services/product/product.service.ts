import { HttpClient } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';

import { Observable, of } from 'rxjs';

import { environment } from '@env/environment';

import { Product } from '@mobile/models/product.model';

// Mock data temporal - será reemplazado por llamadas HTTP reales
const mockProducts: Product[] = [
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
  {
    provider_nit: '1234567845',
    product_type: 'Suplemento',
    storage_conditions: 'Ambiente controlado',
    temperature_required: 20,
    name: 'Vitamina C 1000mg',
    batch: 'L045',
    unit_value: 15.5,
    created_at: '2025-10-20T10:00:00.000000',
    sku: 'a1b2c3d4e5f6g7h8i9j0k1l2m3n4o5p6',
    stock: 250,
    expiration_date: '2027-05-15',
    status: 'Disponible',
  },
  {
    provider_nit: '1234567856',
    product_type: 'Medicamento',
    storage_conditions: 'Refrigerado 2-8°C',
    temperature_required: 5,
    name: 'Insulina Rápida',
    batch: 'L056',
    unit_value: 45.0,
    created_at: '2025-10-21T14:30:00.000000',
    sku: 'q1w2e3r4t5y6u7i8o9p0a1s2d3f4g5h6',
    stock: 75,
    expiration_date: '2026-08-30',
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
    // TODO: Reemplazar con llamada HTTP real cuando el backend esté disponible
    return of(mockProducts);
    // return this.http.get<Product[]>(this.baseUrl + '/');
  }

  public getProductBySku(sku: string): Observable<Product | undefined> {
    // TODO: Reemplazar con llamada HTTP real
    return of(mockProducts.find((p) => p.sku === sku));
    // return this.http.get<Product>(`${this.baseUrl}/${sku}`);
  }

  public searchProducts(query: string): Observable<Product[]> {
    // TODO: Reemplazar con llamada HTTP real que soporte búsqueda
    const lowerQuery = query.toLowerCase().trim();
    if (!lowerQuery) {
      return of(mockProducts);
    }

    const filtered = mockProducts.filter(
      (product) =>
        product.name.toLowerCase().includes(lowerQuery) ||
        product.product_type.toLowerCase().includes(lowerQuery) ||
        product.sku.toLowerCase().includes(lowerQuery) ||
        product.batch.toLowerCase().includes(lowerQuery)
    );

    return of(filtered);
    // return this.http.get<Product[]>(`${this.baseUrl}/search?q=${query}`);
  }
}
