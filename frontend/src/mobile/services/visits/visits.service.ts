import { firstValueFrom } from 'rxjs';
import { environment } from '@env/environment';
import { HttpClient } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';

import { CustomersService } from '../customers/customers.service';

import { SearchResult, RawVisit, VisitItem, CreateVisitRequest } from './visit.interface';
import { InstitutionalClientData } from '../../models';

@Injectable({ providedIn: 'root' })
export class VisitsService {
  private readonly http = inject(HttpClient);

  private readonly baseUrl = environment.vendorMicroserviceUrl;

  private customersService = inject(CustomersService);

  async create(visitData: CreateVisitRequest): Promise<RawVisit> {
    const url = `${this.baseUrl}/visits/`;
    const request = this.http.post<RawVisit>(url, visitData);
    return firstValueFrom(request);
  }

  async search(date: string): Promise<SearchResult> {
    const visits = await this.getVisitsFor(date);
    const customers = await this.getAllCustomers();

    return {
      total: visits.length,
      visits: this.mapVisits(visits, customers),
    };
  }

  private async getVisitsFor(date: string) {
    const visits = await this.fetchAllVisits();
    const visitsOnDate = visits.filter((visit) => {
      const visitDate = new Date(visit.visit_datetime).toISOString().split('T')[0];
      const targetDate = new Date(date).toISOString().split('T')[0];
      return visitDate === targetDate;
    });
    const sortedByDate = visitsOnDate.sort((a, b) => {
      return new Date(a.visit_datetime).getTime() - new Date(b.visit_datetime).getTime();
    });
    return sortedByDate;
  }

  private fetchAllVisits() {
    const url = `${this.baseUrl}/visits/`;
    const request = this.http.get<RawVisit[]>(url);
    return firstValueFrom(request);
  }

  private async getAllCustomers() {
    return firstValueFrom(this.customersService.getAll());
  }

  private mapVisits(visits: RawVisit[], customers: InstitutionalClientData[]): VisitItem[] {
    return visits.map((visit) => {
      const customer = customers.find((c) => c.client_id === visit.client_id);

      const item: VisitItem = {
        visitId: visit.visit_id,
        observations: visit.observations,
        contactName: visit.contact_name,
        mediaItems: visit.bucket_data,
        visitedAt: visit.visit_datetime,
        institution: {
          id: visit.client_id,
          name: customer?.name || 'N/A',
          country: customer?.country || 'N/A',
          location: customer?.location || 'N/A',
        },
      };
      return item;
    });
  }
}
