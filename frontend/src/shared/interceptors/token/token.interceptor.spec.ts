import { TestBed } from '@angular/core/testing';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { HttpClient, provideHttpClient, withInterceptors } from '@angular/common/http';
import { AuthService } from '@shared/auth/auth.service';
import { tokenInterceptor } from './token.interceptor';

describe('tokenInterceptor', () => {
  let httpClient: HttpClient;
  let httpTestingController: HttpTestingController;
  let authService: jest.Mocked<AuthService>;

  const mockAuthService = {
    accessToken: jest.fn(),
  };

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [
        provideHttpClient(withInterceptors([tokenInterceptor])),
        provideHttpClientTesting(),
        { provide: AuthService, useValue: mockAuthService },
      ],
    });

    httpClient = TestBed.inject(HttpClient);
    httpTestingController = TestBed.inject(HttpTestingController);
    authService = TestBed.inject(AuthService) as jest.Mocked<AuthService>;
  });

  afterEach(() => {
    // Verify that no unmatched requests are outstanding
    httpTestingController.verify();
    jest.clearAllMocks();
  });

  describe('when token is available', () => {
    it('should add Authorization header with Bearer token to the request', () => {
      const mockToken = 'test-access-token-123';
      authService.accessToken.mockReturnValue(mockToken);

      // Make an HTTP GET request
      httpClient.get('/api/test').subscribe();

      // Expect one request to the URL
      const req = httpTestingController.expectOne('/api/test');

      // Verify that the Authorization header was added
      expect(req.request.headers.has('Authorization')).toBe(true);
      expect(req.request.headers.get('Authorization')).toBe(`Bearer ${mockToken}`);

      // Respond to the request so the observable completes
      req.flush({});
    });

    it('should add token to POST requests', () => {
      const mockToken = 'another-token-456';
      authService.accessToken.mockReturnValue(mockToken);

      const testData = { name: 'test' };
      httpClient.post('/api/create', testData).subscribe();

      const req = httpTestingController.expectOne('/api/create');

      expect(req.request.headers.get('Authorization')).toBe(`Bearer ${mockToken}`);
      expect(req.request.method).toBe('POST');
      expect(req.request.body).toEqual(testData);

      req.flush({});
    });

    it('should add token to PUT requests', () => {
      const mockToken = 'put-token-789';
      authService.accessToken.mockReturnValue(mockToken);

      const updateData = { id: 1, name: 'updated' };
      httpClient.put('/api/update/1', updateData).subscribe();

      const req = httpTestingController.expectOne('/api/update/1');

      expect(req.request.headers.get('Authorization')).toBe(`Bearer ${mockToken}`);
      expect(req.request.method).toBe('PUT');

      req.flush({});
    });

    it('should add token to DELETE requests', () => {
      const mockToken = 'delete-token-101';
      authService.accessToken.mockReturnValue(mockToken);

      httpClient.delete('/api/delete/1').subscribe();

      const req = httpTestingController.expectOne('/api/delete/1');

      expect(req.request.headers.get('Authorization')).toBe(`Bearer ${mockToken}`);
      expect(req.request.method).toBe('DELETE');

      req.flush({});
    });

    it('should preserve other headers when adding Authorization', () => {
      const mockToken = 'preserve-headers-token';
      authService.accessToken.mockReturnValue(mockToken);

      const customHeaders = {
        'Content-Type': 'application/json',
        'X-Custom-Header': 'custom-value',
      };

      httpClient.get('/api/test', { headers: customHeaders }).subscribe();

      const req = httpTestingController.expectOne('/api/test');

      expect(req.request.headers.get('Authorization')).toBe(`Bearer ${mockToken}`);
      expect(req.request.headers.get('Content-Type')).toBe('application/json');
      expect(req.request.headers.get('X-Custom-Header')).toBe('custom-value');

      req.flush({});
    });
  });

  describe('when token is not available', () => {
    it('should not add Authorization header when token is null', () => {
      authService.accessToken.mockReturnValue(null);

      httpClient.get('/api/test').subscribe();

      const req = httpTestingController.expectOne('/api/test');

      expect(req.request.headers.has('Authorization')).toBe(false);

      req.flush({});
    });

    it('should not add Authorization header when token is undefined', () => {
      authService.accessToken.mockReturnValue(undefined as any);

      httpClient.get('/api/test').subscribe();

      const req = httpTestingController.expectOne('/api/test');

      expect(req.request.headers.has('Authorization')).toBe(false);

      req.flush({});
    });

    it('should not add Authorization header when token is empty string', () => {
      authService.accessToken.mockReturnValue('');

      httpClient.get('/api/test').subscribe();

      const req = httpTestingController.expectOne('/api/test');

      expect(req.request.headers.has('Authorization')).toBe(false);

      req.flush({});
    });

    it('should allow request to proceed normally without token', () => {
      authService.accessToken.mockReturnValue(null);

      const responseData = { message: 'success' };
      let response: any;

      httpClient.get('/api/public').subscribe((data) => {
        response = data;
      });

      const req = httpTestingController.expectOne('/api/public');
      req.flush(responseData);

      expect(response).toEqual(responseData);
    });
  });

  describe('multiple requests', () => {
    it('should add token to multiple concurrent requests', () => {
      const mockToken = 'concurrent-token';
      authService.accessToken.mockReturnValue(mockToken);

      // Make multiple requests
      httpClient.get('/api/endpoint1').subscribe();
      httpClient.get('/api/endpoint2').subscribe();
      httpClient.post('/api/endpoint3', {}).subscribe();

      // Verify all requests have the token
      const req1 = httpTestingController.expectOne('/api/endpoint1');
      const req2 = httpTestingController.expectOne('/api/endpoint2');
      const req3 = httpTestingController.expectOne('/api/endpoint3');

      expect(req1.request.headers.get('Authorization')).toBe(`Bearer ${mockToken}`);
      expect(req2.request.headers.get('Authorization')).toBe(`Bearer ${mockToken}`);
      expect(req3.request.headers.get('Authorization')).toBe(`Bearer ${mockToken}`);

      req1.flush({});
      req2.flush({});
      req3.flush({});
    });

    it('should call authService.accessToken() for each request', () => {
      authService.accessToken.mockReturnValue('token1');
      httpClient.get('/api/first').subscribe();
      const req1 = httpTestingController.expectOne('/api/first');
      req1.flush({});

      authService.accessToken.mockReturnValue('token2');
      httpClient.get('/api/second').subscribe();
      const req2 = httpTestingController.expectOne('/api/second');
      req2.flush({});

      // Should be called once per request
      expect(authService.accessToken).toHaveBeenCalledTimes(2);
      expect(req1.request.headers.get('Authorization')).toBe('Bearer token1');
      expect(req2.request.headers.get('Authorization')).toBe('Bearer token2');
    });
  });

  describe('edge cases', () => {
    it('should handle requests with query parameters', () => {
      const mockToken = 'query-params-token';
      authService.accessToken.mockReturnValue(mockToken);

      httpClient.get('/api/test?page=1&limit=10').subscribe();

      const req = httpTestingController.expectOne('/api/test?page=1&limit=10');

      expect(req.request.headers.get('Authorization')).toBe(`Bearer ${mockToken}`);
      expect(req.request.url).toContain('?page=1&limit=10');

      req.flush({});
    });

    it('should handle requests to different domains', () => {
      const mockToken = 'external-token';
      authService.accessToken.mockReturnValue(mockToken);

      httpClient.get('https://external-api.example.com/data').subscribe();

      const req = httpTestingController.expectOne('https://external-api.example.com/data');

      expect(req.request.headers.get('Authorization')).toBe(`Bearer ${mockToken}`);

      req.flush({});
    });
  });
});
