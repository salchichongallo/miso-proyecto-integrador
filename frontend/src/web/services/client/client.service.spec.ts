import { TestBed } from '@angular/core/testing';
import { provideHttpClient } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';

import { ClientService } from './client.service';
import { Client } from './interfaces/client.interface';

// Mock environment
jest.mock('@env/environment', () => ({
  environment: {
    clientMicroserviceUrl: 'http://test-client-api.com',
  },
}));

describe('ClientService', () => {
  let service: ClientService;
  let httpMock: HttpTestingController;
  const mockBaseUrl = 'http://test-client-api.com';

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [ClientService, provideHttpClient(), provideHttpClientTesting()],
    });
    service = TestBed.inject(ClientService);
    httpMock = TestBed.inject(HttpTestingController);
  });

  afterEach(() => {
    httpMock.verify();
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  describe('getClients', () => {
    it('should return mock clients including CLIENT-1234', () => {
      const mockClients: Client[] = [
        {
          client_id: 'CLIENT-1234',
          name: 'Farmacia San Rafael',
        },
        {
          client_id: 'CLIENT-5678',
          name: 'Droguería Central',
        },
      ];

      service.getClients().subscribe((clients) => {
        expect(clients).toBeDefined();
        expect(Array.isArray(clients)).toBe(true);
        expect(clients.length).toBeGreaterThan(0);

        const client1234 = clients.find((c) => c.client_id === 'CLIENT-1234');
        expect(client1234).toBeDefined();
        expect(client1234?.name).toBe('Farmacia San Rafael');
      });

      const req = httpMock.expectOne(`${mockBaseUrl}/`);
      expect(req.request.method).toBe('GET');
      req.flush(mockClients);
    });

    it('should return clients with all required properties', () => {
      const mockClients: Client[] = [
        {
          client_id: 'CLIENT-1234',
          name: 'Farmacia San Rafael',
        },
        {
          client_id: 'CLIENT-5678',
          name: 'Droguería Central',
        },
      ];

      service.getClients().subscribe((clients) => {
        clients.forEach((client: Client) => {
          expect(client.client_id).toBeDefined();
          expect(client.name).toBeDefined();
          expect(typeof client.client_id).toBe('string');
          expect(typeof client.name).toBe('string');
        });
      });

      const req = httpMock.expectOne(`${mockBaseUrl}/`);
      expect(req.request.method).toBe('GET');
      req.flush(mockClients);
    });
  });
});
