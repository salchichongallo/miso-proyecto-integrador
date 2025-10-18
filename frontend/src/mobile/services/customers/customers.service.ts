import { HttpClient } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';

import { Observable } from 'rxjs';

import { environment } from '@env/environment';

import { CreateInstitutionalClientRequest, CreateInstitutionalClientResponse } from '@mobile/models';

@Injectable({
  providedIn: 'root',
})
export class CustomersService {
  private readonly baseUrl = environment.clientMicroserviceUrl;
  private readonly http = inject(HttpClient);

  public createInstitutionalClient(
    data: CreateInstitutionalClientRequest,
  ): Observable<CreateInstitutionalClientResponse> {
    return this.http.post<CreateInstitutionalClientResponse>(`${this.baseUrl}`, data);
  }
}
