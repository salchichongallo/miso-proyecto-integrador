import { TestBed } from '@angular/core/testing';
import { provideHttpClient } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { of } from 'rxjs';

import { CustomersService } from '../customers/customers.service';
import { InstitutionalClientData } from '../../models';

import { VisitsService } from './visits.service';
import { RawVisit } from './visit.interface';

// Mock environment
jest.mock('@env/environment', () => ({
  environment: {
    vendorMicroserviceUrl: 'http://localhost:3000/api/vendors',
  },
}));

describe('VisitsService', () => {
  let service: VisitsService;
  let httpMock: HttpTestingController;
  let customersService: jest.Mocked<CustomersService>;
  const baseUrl = 'http://localhost:3000/api/vendors/visits/';

  const mockRawVisits: RawVisit[] = [
    {
      visit_id: 'visit-1',
      client_id: 'client-1',
      vendor_id: 'vendor-1',
      contact_name: 'Dr. John Smith',
      contact_phone: '+1234567890',
      visit_datetime: '2025-11-19T10:00:00Z',
      observations: 'First visit observation',
      bucket_data: [],
      created_at: '2025-11-19T09:00:00Z',
      updated_at: '2025-11-19T09:00:00Z',
    },
    {
      visit_id: 'visit-2',
      client_id: 'client-2',
      vendor_id: 'vendor-1',
      contact_name: 'Dr. Jane Doe',
      contact_phone: '+0987654321',
      visit_datetime: '2025-11-19T14:00:00Z',
      observations: 'Second visit observation',
      bucket_data: [],
      created_at: '2025-11-19T13:00:00Z',
      updated_at: '2025-11-19T13:00:00Z',
    },
    {
      visit_id: 'visit-3',
      client_id: 'client-1',
      vendor_id: 'vendor-1',
      contact_name: 'Dr. Bob Wilson',
      contact_phone: '+1122334455',
      visit_datetime: '2025-11-20T11:00:00Z',
      observations: 'Third visit observation',
      bucket_data: [],
      created_at: '2025-11-20T10:00:00Z',
      updated_at: '2025-11-20T10:00:00Z',
    },
  ];

  const mockCustomers: InstitutionalClientData[] = [
    {
      client_id: 'client-1',
      name: 'Hospital Central',
      country: 'CO',
      location: 'Bogotá, Colombia',
      level: 'III',
      specialty: 'Cardiology',
      tax_id: '123456789',
      message: 'Cliente institucional registrado exitosamente',
    },
    {
      client_id: 'client-2',
      name: 'Clinic San José',
      country: 'AR',
      location: 'Buenos Aires, Argentina',
      level: 'II',
      specialty: 'General Medicine',
      tax_id: '987654321',
      message: 'Cliente institucional registrado exitosamente',
    },
  ];

  beforeEach(() => {
    const mockCustomersService = {
      getAll: jest.fn(),
    };

    TestBed.configureTestingModule({
      providers: [
        VisitsService,
        { provide: CustomersService, useValue: mockCustomersService },
        provideHttpClient(),
        provideHttpClientTesting(),
      ],
    });

    service = TestBed.inject(VisitsService);
    httpMock = TestBed.inject(HttpTestingController);
    customersService = TestBed.inject(CustomersService) as jest.Mocked<CustomersService>;
  });

  afterEach(() => {
    httpMock.verify();
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  describe('search', () => {
    it('should return visits for a specific date', async () => {
      customersService.getAll.mockReturnValue(of(mockCustomers));

      const searchPromise = service.search('2025-11-19');

      const req = httpMock.expectOne(baseUrl);
      expect(req.request.method).toBe('GET');
      req.flush(mockRawVisits);

      const result = await searchPromise;

      expect(result.total).toBe(2);
      expect(result.visits).toHaveLength(2);
      expect(result.visits[0].visitId).toBe('visit-1');
      expect(result.visits[1].visitId).toBe('visit-2');
    });

    it('should filter visits by date correctly', async () => {
      customersService.getAll.mockReturnValue(of(mockCustomers));

      const searchPromise = service.search('2025-11-20');

      const req = httpMock.expectOne(baseUrl);
      req.flush(mockRawVisits);

      const result = await searchPromise;

      expect(result.total).toBe(1);
      expect(result.visits).toHaveLength(1);
      expect(result.visits[0].visitId).toBe('visit-3');
      expect(result.visits[0].contactName).toBe('Dr. Bob Wilson');
    });

    it('should sort visits by datetime in ascending order', async () => {
      const unsortedVisits: RawVisit[] = [
        {
          ...mockRawVisits[1],
          visit_datetime: '2025-11-19T14:00:00Z',
        },
        {
          ...mockRawVisits[0],
          visit_datetime: '2025-11-19T10:00:00Z',
        },
      ];

      customersService.getAll.mockReturnValue(of(mockCustomers));

      const searchPromise = service.search('2025-11-19');

      const req = httpMock.expectOne(baseUrl);
      req.flush(unsortedVisits);

      const result = await searchPromise;

      expect(result.visits[0].visitedAt).toBe('2025-11-19T10:00:00Z');
      expect(result.visits[1].visitedAt).toBe('2025-11-19T14:00:00Z');
    });

    it('should return empty array when no visits found for date', async () => {
      customersService.getAll.mockReturnValue(of(mockCustomers));

      const searchPromise = service.search('2025-12-01');

      const req = httpMock.expectOne(baseUrl);
      req.flush(mockRawVisits);

      const result = await searchPromise;

      expect(result.total).toBe(0);
      expect(result.visits).toHaveLength(0);
    });

    it('should map customer data to visit items correctly', async () => {
      customersService.getAll.mockReturnValue(of(mockCustomers));

      const searchPromise = service.search('2025-11-19');

      const req = httpMock.expectOne(baseUrl);
      req.flush([mockRawVisits[0]]);

      const result = await searchPromise;

      expect(result.visits[0].institution.id).toBe('client-1');
      expect(result.visits[0].institution.name).toBe('Hospital Central');
      expect(result.visits[0].institution.country).toBe('CO');
      expect(result.visits[0].institution.location).toBe('Bogotá, Colombia');
    });

    it('should handle visit with missing customer data', async () => {
      const visitWithUnknownClient: RawVisit = {
        ...mockRawVisits[0],
        client_id: 'unknown-client',
      };

      customersService.getAll.mockReturnValue(of(mockCustomers));

      const searchPromise = service.search('2025-11-19');

      const req = httpMock.expectOne(baseUrl);
      req.flush([visitWithUnknownClient]);

      const result = await searchPromise;

      expect(result.visits[0].institution.id).toBe('unknown-client');
      expect(result.visits[0].institution.name).toBe('N/A');
      expect(result.visits[0].institution.country).toBe('N/A');
      expect(result.visits[0].institution.location).toBe('N/A');
    });

    it('should include all visit properties in mapped items', async () => {
      const visitWithBucketData: RawVisit = {
        ...mockRawVisits[0],
        bucket_data: [{}, {}],
      };

      customersService.getAll.mockReturnValue(of(mockCustomers));

      const searchPromise = service.search('2025-11-19');

      const req = httpMock.expectOne(baseUrl);
      req.flush([visitWithBucketData]);

      const result = await searchPromise;

      expect(result.visits[0].visitId).toBe('visit-1');
      expect(result.visits[0].observations).toBe('First visit observation');
      expect(result.visits[0].contactName).toBe('Dr. John Smith');
      expect(result.visits[0].mediaItems).toHaveLength(2);
      expect(result.visits[0].visitedAt).toBe('2025-11-19T10:00:00Z');
    });

    it('should handle HTTP error from visits endpoint', async () => {
      customersService.getAll.mockReturnValue(of(mockCustomers));

      const searchPromise = service.search('2025-11-19');

      const req = httpMock.expectOne(baseUrl);
      req.flush('Internal Server Error', { status: 500, statusText: 'Internal Server Error' });

      try {
        await searchPromise;
        fail('should have thrown an error');
      } catch (error) {
        expect(error).toBeDefined();
      }
    });

    it('should handle error from customers service', async () => {
      const mockError = new Error('Customer service error');
      customersService.getAll.mockImplementation(() => {
        throw mockError;
      });

      const searchPromise = service.search('2025-11-19');

      const req = httpMock.expectOne(baseUrl);
      req.flush(mockRawVisits);

      try {
        await searchPromise;
        fail('should have thrown an error');
      } catch (error) {
        expect(error).toBeDefined();
      }
    });

    it('should handle network error', async () => {
      customersService.getAll.mockReturnValue(of(mockCustomers));

      const searchPromise = service.search('2025-11-19');

      const req = httpMock.expectOne(baseUrl);
      req.error(new ProgressEvent('error'));

      try {
        await searchPromise;
        fail('should have thrown an error');
      } catch (error) {
        expect(error).toBeDefined();
      }
    });

    it('should handle empty visits array from API', async () => {
      customersService.getAll.mockReturnValue(of(mockCustomers));

      const searchPromise = service.search('2025-11-19');

      const req = httpMock.expectOne(baseUrl);
      req.flush([]);

      const result = await searchPromise;

      expect(result.total).toBe(0);
      expect(result.visits).toHaveLength(0);
    });

    it('should handle empty customers array', async () => {
      customersService.getAll.mockReturnValue(of([]));

      const searchPromise = service.search('2025-11-19');

      const req = httpMock.expectOne(baseUrl);
      req.flush([mockRawVisits[0]]);

      const result = await searchPromise;

      expect(result.visits[0].institution.name).toBe('N/A');
      expect(result.visits[0].institution.country).toBe('N/A');
      expect(result.visits[0].institution.location).toBe('N/A');
    });

    it('should handle visits with different timezones on same date', async () => {
      const visitsWithTimezones: RawVisit[] = [
        {
          ...mockRawVisits[0],
          visit_datetime: '2025-11-19T00:00:00-05:00',
        },
        {
          ...mockRawVisits[1],
          visit_datetime: '2025-11-19T23:59:59+05:00',
        },
      ];

      customersService.getAll.mockReturnValue(of(mockCustomers));

      const searchPromise = service.search('2025-11-19');

      const req = httpMock.expectOne(baseUrl);
      req.flush(visitsWithTimezones);

      const result = await searchPromise;

      expect(result.total).toBe(2);
    });

    it('should use correct base URL from environment', async () => {
      customersService.getAll.mockReturnValue(of(mockCustomers));

      const searchPromise = service.search('2025-11-19');

      const req = httpMock.expectOne(baseUrl);
      expect(req.request.url).toBe(baseUrl);
      req.flush([]);

      await searchPromise;
    });

    it('should handle multiple visits for same client on same date', async () => {
      const multipleVisitsSameClient: RawVisit[] = [
        {
          ...mockRawVisits[0],
          visit_id: 'visit-1a',
          visit_datetime: '2025-11-19T08:00:00Z',
        },
        {
          ...mockRawVisits[0],
          visit_id: 'visit-1b',
          visit_datetime: '2025-11-19T16:00:00Z',
        },
      ];

      customersService.getAll.mockReturnValue(of(mockCustomers));

      const searchPromise = service.search('2025-11-19');

      const req = httpMock.expectOne(baseUrl);
      req.flush(multipleVisitsSameClient);

      const result = await searchPromise;

      expect(result.total).toBe(2);
      expect(result.visits[0].visitId).toBe('visit-1a');
      expect(result.visits[1].visitId).toBe('visit-1b');
      expect(result.visits[0].institution.id).toBe(result.visits[1].institution.id);
    });

    it('should handle visits with special characters in observations', async () => {
      const visitWithSpecialChars: RawVisit = {
        ...mockRawVisits[0],
        observations: 'Visit with special chars: áéíóú ñ © ® €',
        contact_name: 'Dr. José María González',
      };

      customersService.getAll.mockReturnValue(of(mockCustomers));

      const searchPromise = service.search('2025-11-19');

      const req = httpMock.expectOne(baseUrl);
      req.flush([visitWithSpecialChars]);

      const result = await searchPromise;

      expect(result.visits[0].observations).toBe('Visit with special chars: áéíóú ñ © ® €');
      expect(result.visits[0].contactName).toBe('Dr. José María González');
    });

    it('should handle date string in different formats', async () => {
      customersService.getAll.mockReturnValue(of(mockCustomers));

      const searchPromise = service.search('2025-11-19T00:00:00.000Z');

      const req = httpMock.expectOne(baseUrl);
      req.flush([mockRawVisits[0]]);

      const result = await searchPromise;

      expect(result.total).toBe(1);
      expect(result.visits[0].visitId).toBe('visit-1');
    });
  });
});
