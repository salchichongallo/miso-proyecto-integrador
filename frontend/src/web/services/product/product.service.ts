import { HttpClient } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';

import { Observable } from 'rxjs';

import { environment } from '@env/environment';

@Injectable({
  providedIn: 'root',
})
export class ProductService {
  private readonly baseUrl = environment.productMicroserviceUrl;
  private readonly http = inject(HttpClient);

  public createBulkProduct(file: File): Observable<object> {
    const formData = new FormData();
    formData.append('file', file);
    return this.http.post(`${this.baseUrl}/bulk`, formData);
  }
}
