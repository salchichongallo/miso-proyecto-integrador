import { TestBed } from '@angular/core/testing';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { provideHttpClient } from '@angular/common/http';

import { CustomersService } from './customers.service';
import {
  CreateInstitutionalClientRequest,
  CreateInstitutionalClientResponse,
} from '@mobile/models/institutional-client.model';

// Mock environment
jest.mock('@env/environment', () => ({
  environment: {
    clientMicroserviceUrl: 'http://localhost:3000/api/clients',
  },
}));

describe('CustomersService', () => {
  let service: CustomersService;
  let httpMock: HttpTestingController;
  const baseUrl = 'http://localhost:3000/api/clients';

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [CustomersService, provideHttpClient(), provideHttpClientTesting()],
    });

    service = TestBed.inject(CustomersService);
    httpMock = TestBed.inject(HttpTestingController);
  });

  afterEach(() => {
    httpMock.verify();
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  describe('createInstitutionalClient', () => {
    it('should send POST request to create institutional client', () => {
      const mockRequest: CreateInstitutionalClientRequest = {
        name: 'Hospital Universitario San José',
        tax_id: '9004567893',
        country: 'CO',
        level: 'III',
        specialty: 'Oncología',
        location: 'Calle 9 #18-20, Bogotá, Colombia',
      };

      const mockResponse: CreateInstitutionalClientResponse = {
        mssg: 'Client created successfully',
        vendor: {
          client_id: 'ec1af3bf-ab3c-4385-8a90-dd2be28a6ac7',
          name: 'Hospital Universitario San José',
          tax_id: '9004567893',
          country: 'CO',
          level: 'III',
          specialty: 'Oncología',
          location: 'Calle 9 #18-20, Bogotá, Colombia',
          message: 'Cliente institucional registrado exitosamente',
        },
      };

      service.createInstitutionalClient(mockRequest).subscribe((response) => {
        expect(response).toEqual(mockResponse);
        expect(response.mssg).toBe('Client created successfully');
        expect(response.vendor.client_id).toBe('ec1af3bf-ab3c-4385-8a90-dd2be28a6ac7');
        expect(response.vendor.name).toBe('Hospital Universitario San José');
        expect(response.vendor.tax_id).toBe('9004567893');
        expect(response.vendor.country).toBe('CO');
        expect(response.vendor.level).toBe('III');
        expect(response.vendor.specialty).toBe('Oncología');
        expect(response.vendor.location).toBe('Calle 9 #18-20, Bogotá, Colombia');
      });

      const req = httpMock.expectOne(baseUrl);
      expect(req.request.method).toBe('POST');
      expect(req.request.body).toEqual(mockRequest);
      req.flush(mockResponse);
    });

    it('should send request with correct headers', () => {
      const mockRequest: CreateInstitutionalClientRequest = {
        name: 'Test Hospital',
        tax_id: '123456789',
        country: 'CO',
        level: 'II',
        specialty: 'Cardiología',
        location: 'Calle 123',
      };

      service.createInstitutionalClient(mockRequest).subscribe();

      const req = httpMock.expectOne(baseUrl);
      expect(req.request.headers.has('Content-Type')).toBeFalsy(); // Angular adds this automatically
      req.flush({});
    });

    it('should handle HTTP error response', () => {
      const mockRequest: CreateInstitutionalClientRequest = {
        name: 'Test Hospital',
        tax_id: '123456789',
        country: 'CO',
        level: 'II',
        specialty: 'Cardiología',
        location: 'Calle 123',
      };

      const mockError = {
        error: 'Invalid tax ID',
        message: 'The provided tax ID is already registered',
      };

      service.createInstitutionalClient(mockRequest).subscribe({
        next: () => fail('should have failed with 400 error'),
        error: (error) => {
          expect(error.status).toBe(400);
          expect(error.error.error).toBe('Invalid tax ID');
          expect(error.error.message).toBe('The provided tax ID is already registered');
        },
      });

      const req = httpMock.expectOne(baseUrl);
      req.flush(mockError, { status: 400, statusText: 'Bad Request' });
    });

    it('should handle server error (500)', () => {
      const mockRequest: CreateInstitutionalClientRequest = {
        name: 'Test Hospital',
        tax_id: '123456789',
        country: 'CO',
        level: 'II',
        specialty: 'Cardiología',
        location: 'Calle 123',
      };

      service.createInstitutionalClient(mockRequest).subscribe({
        next: () => fail('should have failed with 500 error'),
        error: (error) => {
          expect(error.status).toBe(500);
        },
      });

      const req = httpMock.expectOne(baseUrl);
      req.flush('Internal Server Error', { status: 500, statusText: 'Internal Server Error' });
    });

    it('should handle network error', () => {
      const mockRequest: CreateInstitutionalClientRequest = {
        name: 'Test Hospital',
        tax_id: '123456789',
        country: 'CO',
        level: 'II',
        specialty: 'Cardiología',
        location: 'Calle 123',
      };

      service.createInstitutionalClient(mockRequest).subscribe({
        next: () => fail('should have failed with network error'),
        error: (error) => {
          expect(error.error.type).toBe('error');
        },
      });

      const req = httpMock.expectOne(baseUrl);
      req.error(new ProgressEvent('error'));
    });

    it('should send request with all care levels correctly', () => {
      const careLevels = ['I', 'II', 'III', 'IV'];

      careLevels.forEach((level) => {
        const mockRequest: CreateInstitutionalClientRequest = {
          name: 'Test Hospital',
          tax_id: '123456789',
          country: 'CO',
          level: level,
          specialty: 'Cardiología',
          location: 'Calle 123',
        };

        service.createInstitutionalClient(mockRequest).subscribe();

        const req = httpMock.expectOne(baseUrl);
        expect(req.request.body.level).toBe(level);
        req.flush({});
      });
    });

    it('should send request with different countries', () => {
      const countries = ['CO', 'AR', 'BR', 'CL', 'PE'];

      countries.forEach((country) => {
        const mockRequest: CreateInstitutionalClientRequest = {
          name: 'Test Hospital',
          tax_id: '123456789',
          country: country,
          level: 'III',
          specialty: 'Cardiología',
          location: 'Calle 123',
        };

        service.createInstitutionalClient(mockRequest).subscribe();

        const req = httpMock.expectOne(baseUrl);
        expect(req.request.body.country).toBe(country);
        req.flush({});
      });
    });

    it('should handle response with special characters in location', () => {
      const mockRequest: CreateInstitutionalClientRequest = {
        name: 'Hospital São José',
        tax_id: '9004567893',
        country: 'BR',
        level: 'III',
        specialty: 'Oncología',
        location: 'Rua José María #18-20, São Paulo, Brasil - CEP: 01234-567',
      };

      const mockResponse: CreateInstitutionalClientResponse = {
        mssg: 'Client created successfully',
        vendor: {
          client_id: 'test-id',
          name: 'Hospital São José',
          tax_id: '9004567893',
          country: 'BR',
          level: 'III',
          specialty: 'Oncología',
          location: 'Rua José María #18-20, São Paulo, Brasil - CEP: 01234-567',
          message: 'Cliente institucional registrado exitosamente',
        },
      };

      service.createInstitutionalClient(mockRequest).subscribe((response) => {
        expect(response.vendor.location).toContain('São Paulo');
        expect(response.vendor.name).toContain('São José');
      });

      const req = httpMock.expectOne(baseUrl);
      req.flush(mockResponse);
    });

    it('should use the correct base URL from environment', () => {
      const mockRequest: CreateInstitutionalClientRequest = {
        name: 'Test Hospital',
        tax_id: '123456789',
        country: 'CO',
        level: 'II',
        specialty: 'Cardiología',
        location: 'Calle 123',
      };

      service.createInstitutionalClient(mockRequest).subscribe();

      const req = httpMock.expectOne(baseUrl);
      expect(req.request.url).toBe(baseUrl);
      req.flush({});
    });
  });
});
