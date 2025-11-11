import { TestBed } from '@angular/core/testing';
import { provideHttpClient } from '@angular/common/http';
import { provideHttpClientTesting } from '@angular/common/http/testing';

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

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [ClientService, provideHttpClient(), provideHttpClientTesting()],
    });
    service = TestBed.inject(ClientService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  describe('getClients', () => {
    it('should return mock clients including CLIENT-1234', (done) => {
      service.getClients().subscribe((clients) => {
        expect(clients).toBeDefined();
        expect(Array.isArray(clients)).toBe(true);
        expect(clients.length).toBeGreaterThan(0);

        const client1234 = clients.find((c) => c.client_id === 'CLIENT-1234');
        expect(client1234).toBeDefined();
        expect(client1234?.name).toBe('Farmacia San Rafael');

        done();
      });
    });

    it('should return clients with all required properties', (done) => {
      service.getClients().subscribe((clients) => {
        clients.forEach((client: Client) => {
          expect(client.client_id).toBeDefined();
          expect(client.name).toBeDefined();
          expect(typeof client.client_id).toBe('string');
          expect(typeof client.name).toBe('string');
        });

        done();
      });
    });
  });
});
