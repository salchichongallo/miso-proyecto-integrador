import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ReactiveFormsModule } from '@angular/forms';
import { LoadingController, ToastController } from '@ionic/angular/standalone';
import { TranslateModule } from '@ngx-translate/core';
import { of, throwError } from 'rxjs';

import { SellerReportsPage } from './seller-reports.page';
import { SellerReportsService } from '@web/services/seller-reports/seller-reports.service';
import { SellerReport, ReportFilterOptions, SellerDetailRow } from './interfaces';

describe('SellerReportsPage', () => {
  let component: SellerReportsPage;
  let fixture: ComponentFixture<SellerReportsPage>;
  let mockReportsService: jest.Mocked<Partial<SellerReportsService>>;
  let mockLoadingController: jest.Mocked<Partial<LoadingController>>;
  let mockToastController: jest.Mocked<Partial<ToastController>>;

  const mockFilterOptions: ReportFilterOptions = {
    vendors: [
      { id: '1', name: 'Vendor 1' },
      { id: '2', name: 'Vendor 2' },
    ],
    regions: [{ id: 'r1', name: 'Region 1' }],
    products: [{ id: 'p1', name: 'Product 1' }],
  };

  const mockReport: SellerReport = {
    vendorId: '1',
    vendorName: 'Test Vendor',
    totalSales: 9414000,
    goalCompletion: 83,
    customersServed: 93,
    ordersGenerated: 184,
    salesGrowth: 12.5,
    goalGrowth: 12.5,
    customersGrowth: 12.5,
    ordersGrowth: 12.5,
    topProducts: [
      { productId: 'p1', productName: 'Product 1', unitsSold: 100 },
    ],
    salesByMonth: [
      { month: 'January', year: 2024, amount: 50000 },
    ],
  };

  const mockSellerDetails: SellerDetailRow[] = [
    {
      vendorId: '1',
      vendorName: 'Test Vendor',
      email: 'test@vendor.com',
      institutions: ['Institution 1', 'Institution 2'],
    },
  ];

  beforeEach(async () => {
    const mockLoading = {
      present: jest.fn().mockResolvedValue(undefined),
      dismiss: jest.fn().mockResolvedValue(undefined),
    };

    const mockToast = {
      present: jest.fn().mockResolvedValue(undefined),
    };

    mockReportsService = {
      getFilterOptions: jest.fn().mockReturnValue(of(mockFilterOptions)),
      getSellerReport: jest.fn().mockReturnValue(of(mockReport)),
      getSellerDetails: jest.fn().mockReturnValue(of(mockSellerDetails)),
      exportToPDF: jest.fn().mockReturnValue(of(new Blob())),
      exportToExcel: jest.fn().mockReturnValue(of(new Blob())),
    };

    mockLoadingController = {
      create: jest.fn().mockResolvedValue(mockLoading),
    };

    mockToastController = {
      create: jest.fn().mockResolvedValue(mockToast),
    };

    await TestBed.configureTestingModule({
      imports: [SellerReportsPage, ReactiveFormsModule, TranslateModule.forRoot()],
      providers: [
        { provide: SellerReportsService, useValue: mockReportsService },
        { provide: LoadingController, useValue: mockLoadingController },
        { provide: ToastController, useValue: mockToastController },
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(SellerReportsPage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should load filter options on init', async () => {
    await component.ngOnInit();

    expect(mockReportsService.getFilterOptions).toHaveBeenCalled();
    expect(component.filterOptions()).toEqual(mockFilterOptions);
  });

  it('should show initial state by default', () => {
    expect(component.showInitialState()).toBe(true);
    expect(component.hasReport()).toBe(false);
  });

  it('should generate report when vendor is selected', async () => {
    component.filterForm.patchValue({ vendorId: '1' });

    await component.onGenerateReport();

    expect(mockReportsService.getSellerReport).toHaveBeenCalledWith({
      vendorId: '1',
    });
    expect(component.reportData()).toEqual(mockReport);
    expect(component.hasReport()).toBe(true);
  });

  it('should show warning when generating report without vendor in initial state', async () => {
    await component.onGenerateReport();

    expect(mockToastController.create).toHaveBeenCalledWith(
      expect.objectContaining({
        message: 'Por favor seleccione un vendedor',
        color: 'warning',
      })
    );
  });

  it('should handle report generation error', async () => {
    const error = { status: 500, error: { message: 'Server error' } };
    mockReportsService.getSellerReport = jest.fn().mockReturnValue(throwError(() => error));

    component.filterForm.patchValue({ vendorId: '1' });
    await component.onGenerateReport();

    expect(mockToastController.create).toHaveBeenCalledWith(
      expect.objectContaining({
        message: 'Error al generar el reporte',
        color: 'danger',
      })
    );
  });

  it('should show appropriate message when no data found', async () => {
    const error = { status: 404, error: { message: 'No se encontraron registros' } };
    mockReportsService.getSellerReport = jest.fn().mockReturnValue(throwError(() => error));

    component.filterForm.patchValue({ vendorId: '1' });
    await component.onGenerateReport();

    expect(mockToastController.create).toHaveBeenCalledWith(
      expect.objectContaining({
        message: 'No se encontraron registros para los filtros aplicados',
        color: 'warning',
      })
    );
    expect(component.reportData()).toBeNull();
  });

  it('should export to PDF', async () => {
    component.filterForm.patchValue({ vendorId: '1' });

    await component.onExportPDF();

    expect(mockReportsService.exportToPDF).toHaveBeenCalledWith({
      vendorId: '1',
    });
  });

  it('should export to Excel', async () => {
    component.filterForm.patchValue({ vendorId: '1' });

    await component.onExportExcel();

    expect(mockReportsService.exportToExcel).toHaveBeenCalledWith({
      vendorId: '1',
    });
  });

  it('should clear filters and reset state', () => {
    component.filterForm.patchValue({ vendorId: '1' });
    component.reportData.set(mockReport);

    component.onClearFilters();

    expect(component.filterForm.value.vendorId).toBeNull();
    expect(component.reportData()).toBeNull();
    expect(component.sellerDetails()).toEqual([]);
  });

  it('should format currency correctly', () => {
    const formatted = component['formatCurrency'](9414000);
    expect(formatted).toBe('US$9,414,000');
  });

  it('should format percentage correctly', () => {
    const formatted = component['formatPercentage'](83);
    expect(formatted).toBe('83%');
  });

  it('should format growth with positive sign', () => {
    const formatted = component['formatGrowth'](12.5);
    expect(formatted).toBe('+12.5%');
  });

  it('should format growth with negative sign', () => {
    const formatted = component['formatGrowth'](-5.2);
    expect(formatted).toBe('-5.2%');
  });

  it('should return correct growth color class for positive values', () => {
    const colorClass = component['getGrowthColor'](12.5);
    expect(colorClass).toBe('growth-positive');
  });

  it('should return correct growth color class for negative values', () => {
    const colorClass = component['getGrowthColor'](-5.2);
    expect(colorClass).toBe('growth-negative');
  });

  it('should load seller details after generating report', async () => {
    component.filterForm.patchValue({ vendorId: '1' });

    await component.onGenerateReport();

    expect(mockReportsService.getSellerDetails).toHaveBeenCalledWith({
      vendorId: '1',
    });
    expect(component.sellerDetails()).toEqual(mockSellerDetails);
  });

  it('should build filters from form with all fields', () => {
    component.filterForm.patchValue({
      vendorId: '1',
      startDate: '2024-01-01',
      endDate: '2024-12-31',
      region: 'r1',
      productId: 'p1',
    });

    const filters = component['getFiltersFromForm']();

    expect(filters).toEqual({
      vendorId: '1',
      startDate: '2024-01-01',
      endDate: '2024-12-31',
      region: 'r1',
      productId: 'p1',
    });
  });

  it('should build filters from form with only filled fields', () => {
    component.filterForm.patchValue({
      vendorId: '1',
      startDate: '2024-01-01',
    });

    const filters = component['getFiltersFromForm']();

    expect(filters).toEqual({
      vendorId: '1',
      startDate: '2024-01-01',
    });
  });
});
