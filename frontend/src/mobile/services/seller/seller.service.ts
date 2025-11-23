import { catchError, Observable, of } from 'rxjs';
import { HttpClient } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';

import { AuthService } from '@shared/auth';
import { environment } from '@env/environment';

import { InstitutionalClient, MyClientsResponse } from './interfaces/my-clients.response';

@Injectable({ providedIn: 'root' })
export class SellerService {
  private readonly http = inject(HttpClient);

  private readonly baseUrl = environment.vendorMicroserviceUrl;

  private readonly authService = inject(AuthService);

  public getMyClients(): Observable<InstitutionalClient[]> {
    const vendorId = this.authService.getUserId();
    const url = `${this.baseUrl}/${vendorId}/clients`;
    return this.http.get<MyClientsResponse>(url).pipe(
      catchError((error) => {
        console.error('Error fetching clients:', error);
        return of([]);
      }),
    );
  }
}
