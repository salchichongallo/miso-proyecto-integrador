import { HttpClient } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';

import { Observable, of } from 'rxjs';
import { map } from 'rxjs/operators';

import { environment } from '@env/environment';

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

  public searchProducts(query: string): Observable<Product[]> {
    const lowerQuery = query.toLowerCase().trim();

    if (!lowerQuery) {
      return this.getProducts();
    }

    return this.getProducts().pipe(
      map((products) =>
        products.filter(
          (product) =>
            product.name.toLowerCase().includes(lowerQuery) ||
            product.product_type.toLowerCase().includes(lowerQuery) ||
            product.sku.toLowerCase().includes(lowerQuery) ||
            product.batch.toLowerCase().includes(lowerQuery)
        )
      )
    );
  }
}
