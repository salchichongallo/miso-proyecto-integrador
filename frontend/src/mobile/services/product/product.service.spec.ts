import { provideHttpClient } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { ProductService } from './product.service';
import { TestBed } from '@angular/core/testing';
import { Product } from '@mobile/models/product.model';
import { environment } from '@env/environment';

describe('ProductService', () => {
  let service: ProductService;
  let httpMock: HttpTestingController;

  const mockProducts: Product[] = [
    {
      id: '1',
      provider_nit: 'NIT123',
      product_type: 'Electronics',
      storage_conditions: 'Dry',
      temperature_required: 20,
      name: 'Laptop Dell',
      batch: 'BATCH001',
      unit_value: 1500,
      created_at: '2024-01-01',
      sku: 'SKU001',
      stock: 10,
      expiration_date: '2025-12-31',
      status: 'active',
      updated_at: '2024-01-01',
      warehouse: 'WH001',
      warehouse_name: 'Main Warehouse',
      warehouse_address: '123 Main St',
      warehouse_city: 'Bogota',
      warehouse_country: 'Colombia',
    },
    {
      id: '2',
      provider_nit: 'NIT456',
      product_type: 'Furniture',
      storage_conditions: 'Indoor',
      temperature_required: 22,
      name: 'Office Chair',
      batch: 'BATCH002',
      unit_value: 300,
      created_at: '2024-01-02',
      sku: 'SKU002',
      stock: 25,
      expiration_date: '2026-12-31',
      status: 'active',
      updated_at: '2024-01-02',
      warehouse: 'WH001',
      warehouse_name: 'Main Warehouse',
      warehouse_address: '123 Main St',
      warehouse_city: 'Medellin',
      warehouse_country: 'Colombia',
    },
    {
      id: '3',
      provider_nit: 'NIT789',
      product_type: 'Electronics',
      storage_conditions: 'Climate Controlled',
      temperature_required: 18,
      name: 'Monitor Samsung',
      batch: 'BATCH003',
      unit_value: 400,
      created_at: '2024-01-03',
      sku: 'SKU003',
      stock: 15,
      expiration_date: '2025-06-30',
      status: 'active',
      updated_at: '2024-01-03',
      warehouse: 'WH002',
      warehouse_name: 'Secondary Warehouse',
      warehouse_address: '456 Second Ave',
      warehouse_city: 'Cali',
      warehouse_country: 'Colombia',
    },
  ];

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [ProductService, provideHttpClient(), provideHttpClientTesting()],
    });
    service = TestBed.inject(ProductService);
    httpMock = TestBed.inject(HttpTestingController);
  });

  afterEach(() => {
    httpMock.verify();
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  describe('getProducts', () => {
    it('should retrieve all products from the API', () => {
      service.getProducts().subscribe((products) => {
        expect(products).toEqual(mockProducts);
        expect(products.length).toBe(3);
      });

      const req = httpMock.expectOne(environment.productMicroserviceUrl + '/');
      expect(req.request.method).toBe('GET');
      req.flush(mockProducts);
    });

    it('should handle empty products array', () => {
      service.getProducts().subscribe((products) => {
        expect(products).toEqual([]);
        expect(products.length).toBe(0);
      });

      const req = httpMock.expectOne(environment.productMicroserviceUrl + '/');
      req.flush([]);
    });

    it('should handle HTTP errors', () => {
      const errorMessage = 'Server error';

      service.getProducts().subscribe({
        next: () => fail('should have failed with 500 error'),
        error: (error) => {
          expect(error.status).toBe(500);
        },
      });

      const req = httpMock.expectOne(environment.productMicroserviceUrl + '/');
      req.flush(errorMessage, { status: 500, statusText: 'Internal Server Error' });
    });
  });

  describe('searchProducts', () => {
    it('should return all products when query is empty', () => {
      service.searchProducts('').subscribe((products) => {
        expect(products).toEqual(mockProducts);
        expect(products.length).toBe(3);
      });

      const req = httpMock.expectOne(environment.productMicroserviceUrl + '/');
      req.flush(mockProducts);
    });

    it('should return all products when query is only whitespace', () => {
      service.searchProducts('   ').subscribe((products) => {
        expect(products).toEqual(mockProducts);
        expect(products.length).toBe(3);
      });

      const req = httpMock.expectOne(environment.productMicroserviceUrl + '/');
      req.flush(mockProducts);
    });

    it('should filter products by name (case insensitive)', () => {
      service.searchProducts('laptop').subscribe((products) => {
        expect(products.length).toBe(1);
        expect(products[0].name).toBe('Laptop Dell');
      });

      const req = httpMock.expectOne(environment.productMicroserviceUrl + '/');
      req.flush(mockProducts);
    });

    it('should filter products by name with uppercase query', () => {
      service.searchProducts('LAPTOP').subscribe((products) => {
        expect(products.length).toBe(1);
        expect(products[0].name).toBe('Laptop Dell');
      });

      const req = httpMock.expectOne(environment.productMicroserviceUrl + '/');
      req.flush(mockProducts);
    });

    it('should filter products by product_type', () => {
      service.searchProducts('electronics').subscribe((products) => {
        expect(products.length).toBe(2);
        expect(products.every((p) => p.product_type === 'Electronics')).toBe(true);
      });

      const req = httpMock.expectOne(environment.productMicroserviceUrl + '/');
      req.flush(mockProducts);
    });

    it('should filter products by SKU', () => {
      service.searchProducts('SKU002').subscribe((products) => {
        expect(products.length).toBe(1);
        expect(products[0].sku).toBe('SKU002');
        expect(products[0].name).toBe('Office Chair');
      });

      const req = httpMock.expectOne(environment.productMicroserviceUrl + '/');
      req.flush(mockProducts);
    });

    it('should filter products by batch', () => {
      service.searchProducts('BATCH003').subscribe((products) => {
        expect(products.length).toBe(1);
        expect(products[0].batch).toBe('BATCH003');
        expect(products[0].name).toBe('Monitor Samsung');
      });

      const req = httpMock.expectOne(environment.productMicroserviceUrl + '/');
      req.flush(mockProducts);
    });

    it('should handle partial matches in name', () => {
      service.searchProducts('chair').subscribe((products) => {
        expect(products.length).toBe(1);
        expect(products[0].name).toBe('Office Chair');
      });

      const req = httpMock.expectOne(environment.productMicroserviceUrl + '/');
      req.flush(mockProducts);
    });

    it('should return empty array when no products match', () => {
      service.searchProducts('nonexistent').subscribe((products) => {
        expect(products).toEqual([]);
        expect(products.length).toBe(0);
      });

      const req = httpMock.expectOne(environment.productMicroserviceUrl + '/');
      req.flush(mockProducts);
    });

    it('should trim whitespace from query', () => {
      service.searchProducts('  laptop  ').subscribe((products) => {
        expect(products.length).toBe(1);
        expect(products[0].name).toBe('Laptop Dell');
      });

      const req = httpMock.expectOne(environment.productMicroserviceUrl + '/');
      req.flush(mockProducts);
    });

    it('should match products across multiple fields', () => {
      service.searchProducts('samsung').subscribe((products) => {
        expect(products.length).toBe(1);
        expect(products[0].name).toBe('Monitor Samsung');
      });

      const req = httpMock.expectOne(environment.productMicroserviceUrl + '/');
      req.flush(mockProducts);
    });

    it('should handle query with special characters', () => {
      service.searchProducts('SKU-001').subscribe((products) => {
        expect(products).toEqual([]);
      });

      const req = httpMock.expectOne(environment.productMicroserviceUrl + '/');
      req.flush(mockProducts);
    });
  });
});
