import { ComponentFixture, TestBed } from '@angular/core/testing';
import { LoadingController, ToastController } from '@ionic/angular/standalone';

import { of, throwError } from 'rxjs';

import { ProductBulkUploadPage } from './product-bulk-upload.page';
import { ProductService } from '@web/services/product/product.service';

describe('ProductBulkUploadPage', () => {
  let component: ProductBulkUploadPage;
  let fixture: ComponentFixture<ProductBulkUploadPage>;
  let mockProductService: jest.Mocked<Pick<ProductService, 'createBulkProduct'>>;
  let mockLoadingController: jest.Mocked<Pick<LoadingController, 'create' | 'dismiss'>>;
  let mockToastController: jest.Mocked<Pick<ToastController, 'create'>>;
  let mockLoading: { present: jest.Mock };
  let mockToast: { present: jest.Mock };

  beforeEach(async () => {
    mockProductService = {
      createBulkProduct: jest.fn(),
    };

    mockLoading = {
      present: jest.fn().mockResolvedValue(undefined),
    };

    mockToast = {
      present: jest.fn().mockResolvedValue(undefined),
    };

    mockLoadingController = {
      create: jest.fn().mockResolvedValue(mockLoading),
      dismiss: jest.fn().mockResolvedValue(true),
    };

    mockToastController = {
      create: jest.fn().mockResolvedValue(mockToast),
    };

    await TestBed.configureTestingModule({
      imports: [ProductBulkUploadPage],
      providers: [
        { provide: ProductService, useValue: mockProductService },
        { provide: LoadingController, useValue: mockLoadingController },
        { provide: ToastController, useValue: mockToastController },
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(ProductBulkUploadPage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  describe('File Selection', () => {
    it('should set selected file when file is chosen', () => {
      const file = new File(['test'], 'test.csv', { type: 'text/csv' });
      const event = {
        target: {
          files: [file],
        },
      } as unknown as Event;

      component.onFileSelected(event);

      expect(component.selectedFile).toBe(file);
      expect(component.fileName).toBe('test.csv');
    });

    it('should not set selected file when no file is chosen', () => {
      const event = {
        target: {
          files: [],
        },
      } as unknown as Event;

      component.onFileSelected(event);

      expect(component.selectedFile).toBeNull();
      expect(component.fileName).toBe('');
    });
  });

  describe('File Processing', () => {
    it('should not call service when no file is selected', async () => {
      component.selectedFile = null;

      await component.onProcessFile();

      expect(mockProductService.createBulkProduct).not.toHaveBeenCalled();
      expect(mockLoadingController.create).not.toHaveBeenCalled();
    });

    it('should show loading spinner while processing file', async () => {
      mockProductService.createBulkProduct.mockReturnValue(of({ message: 'Success' }));
      const file = new File(['test'], 'products.csv', { type: 'text/csv' });
      component.selectedFile = file;
      component.fileName = 'products.csv';

      component.onProcessFile();

      await new Promise(resolve => setTimeout(resolve, 100));

      expect(mockLoadingController.create).toHaveBeenCalledWith({
        message: 'Procesando archivo de productos...',
      });
      expect(mockLoading.present).toHaveBeenCalled();
      expect(mockLoadingController.dismiss).toHaveBeenCalled();
    });

    it('should call service with selected file', async () => {
      mockProductService.createBulkProduct.mockReturnValue(of({ message: 'Success' }));
      const file = new File(['test'], 'products.csv', { type: 'text/csv' });
      component.selectedFile = file;
      component.fileName = 'products.csv';

      component.onProcessFile();

      await new Promise(resolve => setTimeout(resolve, 100));

      expect(mockProductService.createBulkProduct).toHaveBeenCalledWith(file);
    });

    it('should show success message and clear file after successful upload', async () => {
      mockProductService.createBulkProduct.mockReturnValue(of({ message: 'Success' }));
      const file = new File(['test'], 'products.csv', { type: 'text/csv' });
      component.selectedFile = file;
      component.fileName = 'products.csv';

      component.onProcessFile();

      await new Promise(resolve => setTimeout(resolve, 100));

      expect(mockToastController.create).toHaveBeenCalledWith({
        message: 'Productos cargados exitosamente.',
        duration: 3000,
        position: 'top',
      });
      expect(mockToast.present).toHaveBeenCalled();
      expect(component.selectedFile).toBeNull();
      expect(component.fileName).toBe('');
    });

    it('should show error message on upload failure', async () => {
      const errorResponse = {
        error: { message: 'Upload failed' },
        message: 'Http failure',
      };
      mockProductService.createBulkProduct.mockReturnValue(throwError(() => errorResponse));
      const file = new File(['test'], 'products.csv', { type: 'text/csv' });
      component.selectedFile = file;
      component.fileName = 'products.csv';

      component.onProcessFile();

      await new Promise(resolve => setTimeout(resolve, 100));

      expect(mockToastController.create).toHaveBeenCalledWith({
        message: 'Upload failed',
        duration: 3000,
        position: 'top',
        color: 'danger',
      });
      expect(mockToast.present).toHaveBeenCalled();
    });

    it('should show default error message when error has no details', async () => {
      const errorResponse = {
        message: 'Http failure',
      };
      mockProductService.createBulkProduct.mockReturnValue(throwError(() => errorResponse));
      const file = new File(['test'], 'products.csv', { type: 'text/csv' });
      component.selectedFile = file;

      component.onProcessFile();

      await new Promise(resolve => setTimeout(resolve, 100));

      expect(mockToastController.create).toHaveBeenCalledWith({
        message: 'Http failure',
        duration: 3000,
        position: 'top',
        color: 'danger',
      });
      expect(mockToast.present).toHaveBeenCalled();
    });
  });
});
