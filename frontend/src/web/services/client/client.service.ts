import { HttpClient } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';

import { Observable, of } from 'rxjs';

import { environment } from '@env/environment';

import { Client } from './interfaces/client.interface';

@Injectable({
  providedIn: 'root',
})
export class ClientService {
  private readonly baseUrl = environment.clientMicroserviceUrl;
  private readonly http = inject(HttpClient);

  /**
   * Get all clients
   * @returns Observable of clients array
   */
  public getClients(): Observable<Client[]> {
    return this.http.get<Client[]>(`${this.baseUrl}/`);
  }
}
