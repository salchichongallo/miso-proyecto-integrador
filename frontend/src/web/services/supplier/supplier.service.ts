import { HttpClient } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';

import { map, Observable } from 'rxjs';

import { environment } from '@env/environment';

import { RegisterSupplierResponse } from '@web/pages/supplier-registration/interfaces/register-supplier-response.interface';
import { RegisterSupplierRequest } from '@web/pages/supplier-registration/interfaces/register-supplier-request.interface';

type BulkSupplierResponse = {
  approved: unknown[];
  rejected: unknown[];
  message: string;
  rejected_records: number;
  success_rate: string;
  successful_records: number;
  total_records: number;
};

@Injectable({
  providedIn: 'root',
})
export class SupplierService {
  private readonly baseUrl = environment.providerMicroserviceUrl;
  private readonly http = inject(HttpClient);

  public createSupplier(body: RegisterSupplierRequest): Observable<RegisterSupplierResponse> {
    return this.http.post<RegisterSupplierResponse>(this.baseUrl + '/', body);
  }

  public createBulkSupplier(file: File): Observable<Object> {
    const formData = new FormData();
    formData.append('file', file);
    return this.http.post<BulkSupplierResponse>(`${this.baseUrl}/bulk`, formData).pipe(
      map((response) => {
        const allCompleted = response.total_records === response.successful_records;
        if (allCompleted) {
          return response;
        }
        if (response.successful_records === 0) {
          throw new Error('Error: No se pudo cargar ningún proveedor.');
        }
        const message = `Error: Se cargaron ${response.successful_records} de ${response.total_records} proveedores.`;
        throw new Error(message);
      }),
    );
  }
}
