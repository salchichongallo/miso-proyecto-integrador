import { HttpClient } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';

import { Observable } from 'rxjs';

import { environment } from '@env/environment';

import { CreateSalesPlanRequest } from '@web/pages/sales-plan-creation/interfaces/create-sales-plan-request.interface';
import { CreateSalesPlanResponse } from '@web/pages/sales-plan-creation/interfaces/create-sales-plan-response.interface';

@Injectable({
  providedIn: 'root',
})
export class SalesPlanService {
  private readonly baseUrl = environment.vendorMicroserviceUrl;
  private readonly http = inject(HttpClient);

  public createSalesPlan(salesPlanData: CreateSalesPlanRequest): Observable<CreateSalesPlanResponse> {
    return this.http.post<CreateSalesPlanResponse>(this.baseUrl + '/sales_plan/', salesPlanData);
  }
}
