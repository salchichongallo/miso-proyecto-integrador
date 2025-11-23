import { catchError, Observable, of } from 'rxjs';
import { HttpClient } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';

import { environment } from '@env/environment';

import { InstitutionalClient } from './institutional-client.interface';

type GetAllInstitutionsResponse = InstitutionalClient[];

@Injectable()
export class CustomersService {
  private readonly http = inject(HttpClient);

  private readonly baseUrl = `${environment.clientMicroserviceUrl}/`;

  public getAll(): Observable<InstitutionalClient[]> {
    return this.http.get<GetAllInstitutionsResponse>(this.baseUrl).pipe(
      catchError((error) => {
        console.error('Error fetching institutions', error);
        return of([]);
      }),
    );
  }
}
