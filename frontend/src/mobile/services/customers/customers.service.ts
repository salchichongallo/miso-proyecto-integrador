import { HttpClient } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { catchError, Observable, of } from 'rxjs';

import { environment } from '@env/environment';

import {
  CreateInstitutionalClientRequest,
  CreateInstitutionalClientResponse,
  InstitutionalClientData,
} from '@mobile/models';

@Injectable({
  providedIn: 'root',
})
export class CustomersService {
  private readonly baseUrl = environment.clientMicroserviceUrl;
  private readonly http = inject(HttpClient);

  public createInstitutionalClient(
    data: CreateInstitutionalClientRequest,
  ): Observable<CreateInstitutionalClientResponse> {
    return this.http.post<CreateInstitutionalClientResponse>(`${this.baseUrl}/`, data);
  }

  public getInstitutionalClients(): Observable<InstitutionalClientData[]> {
    return this.http.get<InstitutionalClientData[]>(`${this.baseUrl}/`);
  }

  public getAll() {
    const url = `${this.baseUrl}/`;
    return this.http.get<InstitutionalClientData[]>(url).pipe(
      catchError((error) => {
        console.error('Error fetching clients:', error);
        return of<InstitutionalClientData[]>([]);
      }),
    );
  }
}
