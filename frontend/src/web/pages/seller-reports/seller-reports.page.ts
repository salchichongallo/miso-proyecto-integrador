import { Component, OnInit, signal, computed } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule } from '@angular/forms';
import { HttpErrorResponse } from '@angular/common/http';
import { CommonModule } from '@angular/common';

import {
  IonContent,
  IonCard,
  IonCardHeader,
  IonCardTitle,
  IonCardContent,
  IonButton,
  IonGrid,
  IonRow,
  IonCol,
  IonSelect,
  IonSelectOption,
  IonIcon,
  IonInput,
  LoadingController,
  ToastController,
} from '@ionic/angular/standalone';

import { TranslateModule } from '@ngx-translate/core';
import { addIcons } from 'ionicons';
import { arrowBackOutline, calendarOutline, downloadOutline } from 'ionicons/icons';
import { finalize } from 'rxjs';

import { SellerReportsService } from '@web/services/seller-reports/seller-reports.service';
import {
  SellerReport,
  ReportFilters,
  ReportFilterOptions,
  SellerDetailRow,
} from './interfaces';

@Component({
  selector: 'app-seller-reports',
  templateUrl: 'seller-reports.page.html',
  styleUrls: ['seller-reports.page.scss'],
  imports: [
    CommonModule,
    ReactiveFormsModule,
    TranslateModule,
    IonContent,
    IonCard,
    IonCardHeader,
    IonCardTitle,
    IonCardContent,
    IonButton,
    IonGrid,
    IonRow,
    IonCol,
    IonSelect,
    IonSelectOption,
    IonIcon,
    IonInput,
  ],
  standalone: true,
})
export class SellerReportsPage implements OnInit {
  // Form
  public filterForm: FormGroup;

  // Signals for state management
  protected readonly reportData = signal<SellerReport | null>(null);
  protected readonly filterOptions = signal<ReportFilterOptions>({
    vendors: [],
    regions: [],
    products: [],
  });
  protected readonly sellerDetails = signal<SellerDetailRow[]>([]);
  protected readonly isLoading = signal<boolean>(false);

  // Computed signals
  protected readonly hasReport = computed(() => this.reportData() !== null);
  protected readonly showInitialState = computed(() => !this.hasReport());

  constructor(
    private readonly fb: FormBuilder,
    private readonly reportsService: SellerReportsService,
    private readonly loadingController: LoadingController,
    private readonly toastController: ToastController,
  ) {
    addIcons({ arrowBackOutline, calendarOutline, downloadOutline });

    this.filterForm = this.fb.group({
      vendorId: [''],
      startDate: [''],
      endDate: [''],
      region: [''],
      productId: [''],
    });
  }

  async ngOnInit(): Promise<void> {
    await this.loadFilterOptions();
  }

  /**
   * Load filter options (vendors, regions, products)
   */
  private async loadFilterOptions(): Promise<void> {
    const loading = await this.loadingController.create({
      message: 'Cargando opciones...',
    });

    await loading.present();

    this.reportsService
      .getFilterOptions()
      .pipe(finalize(() => loading.dismiss()))
      .subscribe({
        next: (options) => {
          this.filterOptions.set(options);
        },
        error: (error: HttpErrorResponse) => {
          console.error('Error loading filter options:', error);
          this.showToast('Error al cargar las opciones de filtro', 'danger');
        },
      });
  }

  /**
   * Generate report based on filters
   */
  public async onGenerateReport(): Promise<void> {
    const filters = this.getFiltersFromForm();

    // Validate that at least vendorId is selected
    if (!filters.vendorId && this.showInitialState()) {
      this.showToast('Por favor seleccione un vendedor', 'warning');
      return;
    }

    const loading = await this.loadingController.create({
      message: 'Generando reporte...',
    });

    await loading.present();
    this.isLoading.set(true);

    const startTime = Date.now();

    this.reportsService
      .getSellerReport(filters)
      .pipe(finalize(() => {
        loading.dismiss();
        this.isLoading.set(false);

        // Check if generation took more than 3 seconds
        const elapsed = Date.now() - startTime;
        if (elapsed > 3000) {
          console.warn(`Report generation took ${elapsed}ms (exceeds 3s requirement)`);
        }
      }))
      .subscribe({
        next: (report) => {
          this.reportData.set(report);
          this.loadSellerDetails(filters);
        },
        error: (error: HttpErrorResponse) => {
          console.error('Error generating report:', error);

          if (error.status === 404 || error.error?.message?.includes('No se encontraron')) {
            this.showToast('No se encontraron registros para los filtros aplicados', 'warning');
            this.reportData.set(null);
          } else {
            this.showToast('Error al generar el reporte', 'danger');
          }
        },
      });
  }

  /**
   * Load seller details for the table
   */
  private loadSellerDetails(filters: ReportFilters): void {
    this.reportsService.getSellerDetails(filters).subscribe({
      next: (details) => {
        this.sellerDetails.set(details);
      },
      error: (error: HttpErrorResponse) => {
        console.error('Error loading seller details:', error);
      },
    });
  }

  /**
   * Export report to PDF
   */
  public async onExportPDF(): Promise<void> {
    const filters = this.getFiltersFromForm();

    const loading = await this.loadingController.create({
      message: 'Exportando a PDF...',
    });

    await loading.present();

    this.reportsService
      .exportToPDF(filters)
      .pipe(finalize(() => loading.dismiss()))
      .subscribe({
        next: (blob) => {
          this.downloadFile(blob, 'reporte-vendedores.pdf');
          this.showToast('Reporte exportado exitosamente', 'success');
        },
        error: (error: HttpErrorResponse) => {
          console.error('Error exporting to PDF:', error);
          this.showToast('Error al exportar el reporte', 'danger');
        },
      });
  }

  /**
   * Export report to Excel
   */
  public async onExportExcel(): Promise<void> {
    const filters = this.getFiltersFromForm();

    const loading = await this.loadingController.create({
      message: 'Exportando a Excel...',
    });

    await loading.present();

    this.reportsService
      .exportToExcel(filters)
      .pipe(finalize(() => loading.dismiss()))
      .subscribe({
        next: (blob) => {
          this.downloadFile(blob, 'reporte-vendedores.xlsx');
          this.showToast('Reporte exportado exitosamente', 'success');
        },
        error: (error: HttpErrorResponse) => {
          console.error('Error exporting to Excel:', error);
          this.showToast('Error al exportar el reporte', 'danger');
        },
      });
  }

  /**
   * Clear filters and reset to initial state
   */
  public onClearFilters(): void {
    this.filterForm.reset();
    this.reportData.set(null);
    this.sellerDetails.set([]);
  }

  /**
   * Get filters from form
   */
  private getFiltersFromForm(): ReportFilters {
    const formValue = this.filterForm.value;
    const filters: ReportFilters = {};

    if (formValue.vendorId) {
      filters.vendorId = formValue.vendorId;
    }
    if (formValue.startDate) {
      filters.startDate = formValue.startDate;
    }
    if (formValue.endDate) {
      filters.endDate = formValue.endDate;
    }
    if (formValue.region) {
      filters.region = formValue.region;
    }
    if (formValue.productId) {
      filters.productId = formValue.productId;
    }

    return filters;
  }

  /**
   * Download blob as file
   */
  private downloadFile(blob: Blob, filename: string): void {
    const url = window.URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = filename;
    link.click();
    window.URL.revokeObjectURL(url);
  }

  /**
   * Show toast notification
   */
  private async showToast(
    message: string,
    color: 'success' | 'danger' | 'warning' = 'success',
  ): Promise<void> {
    const toast = await this.toastController.create({
      message,
      duration: 3000,
      color,
      position: 'top',
    });

    await toast.present();
  }

  /**
   * Format currency
   */
  protected formatCurrency(value: number): string {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(value);
  }

  /**
   * Format percentage
   */
  protected formatPercentage(value: number): string {
    return `${value}%`;
  }

  /**
   * Format growth indicator
   */
  protected formatGrowth(value: number): string {
    const sign = value >= 0 ? '+' : '';
    return `${sign}${value}%`;
  }

  /**
   * Get growth color class
   */
  protected getGrowthColor(value: number): string {
    return value >= 0 ? 'growth-positive' : 'growth-negative';
  }
}
