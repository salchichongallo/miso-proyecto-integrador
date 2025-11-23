import { TestBed } from '@angular/core/testing';
import { provideHttpClient } from '@angular/common/http';
import { provideHttpClientTesting } from '@angular/common/http/testing';
import { of, throwError } from 'rxjs';

import { CustomersService } from './customers.service';

describe('CustomersService', () => {
  let service: CustomersService;
  let httpClientSpy: { get: jest.Mock };

  beforeEach(() => {
    httpClientSpy = { get: jest.fn() };
    TestBed.configureTestingModule({
      providers: [CustomersService, provideHttpClient(), provideHttpClientTesting()],
    });
    service = TestBed.inject(CustomersService);
    // Patch the injected http property to use our spy
    (service as any).http = httpClientSpy;
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  it('should return expected institutions (getAll success)', (done) => {
    const mockData = [
      { id: '1', name: 'Inst 1' },
      { id: '2', name: 'Inst 2' },
    ];
    httpClientSpy.get.mockReturnValueOnce(of(mockData));
    service.getAll().subscribe((result) => {
      expect(result).toEqual(mockData);
      done();
    });
  });

  it('should return empty array on error (getAll error)', (done) => {
    const error = new Error('Network error');
    httpClientSpy.get.mockImplementation(() => throwError(() => error));
    service.getAll().subscribe((result) => {
      expect(result).toEqual([]);
      done();
    });
  });
});
