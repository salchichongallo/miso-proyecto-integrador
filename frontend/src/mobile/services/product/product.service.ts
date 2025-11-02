import { HttpClient } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';

import { Observable, of } from 'rxjs';
import { map } from 'rxjs/operators';

import { environment } from '@env/environment';

import { Product } from '@mobile/models/product.model';

const productsMock: Product[] = [
  {
    batch: 'L-2025-001',
    created_at: '2025-11-02T01:41:23.848123+00:00',
    expiration_date: '2026-08-15',
    id: 'ae64bfb3-253c-4267-99a6-51cd2b28cb4d',
    name: 'Small Plastic Tuna 42mg',
    product_type: 'Medicamento',
    provider_nit: '9001234567',
    sku: '179b3247-b283-431a-9a91-18313950b1b9',
    status: 'Disponible',
    stock: 5,
    storage_conditions: 'Mantener en un lugar fresco y seco',
    temperature_required: 555.0,
    unit_value: 800.0,
    updated_at: '2025-11-02T01:41:23.848137+00:00',
    warehouse: '2',
    warehouse_address: '24899 Swaniawski Walks',
    warehouse_city: 'South Okey',
    warehouse_country: 'Palestinian Territory',
    warehouse_name: 'Marisa',
  },
  {
    batch: 'L-2025-001',
    created_at: '2025-11-02T01:41:22.452579+00:00',
    expiration_date: '2026-08-15',
    id: '27be3eae-918b-4e33-9bd1-dbe38b47442a',
    name: 'Unbranded Concrete Cheese 263mg',
    product_type: 'Medicamento',
    provider_nit: '9001234567',
    sku: '179b3247-b283-431a-9a91-18313950b1b9',
    status: 'Disponible',
    stock: 905,
    storage_conditions: 'Mantener en un lugar fresco y seco',
    temperature_required: 982.0,
    unit_value: 800.0,
    updated_at: '2025-11-02T01:41:22.452617+00:00',
    warehouse: '1',
    warehouse_address: '10159 Thea River',
    warehouse_city: 'Nikolausborough',
    warehouse_country: 'Bouvet Island (Bouvetoya)',
    warehouse_name: 'Kurt',
  },
];

@Injectable({
  providedIn: 'root',
})
export class ProductService {
  private readonly baseUrl = environment.productMicroserviceUrl;
  private readonly http = inject(HttpClient);

  public getProducts(): Observable<Product[]> {
    return of(productsMock);
    // return this.http.get<Product[]>(this.baseUrl + '/');
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
            product.batch.toLowerCase().includes(lowerQuery),
        ),
      ),
    );
  }
}
