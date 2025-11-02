import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { HttpErrorResponse } from '@angular/common/http';

import {
  IonContent,
  IonCard,
  IonCardHeader,
  IonCardTitle,
  IonCardContent,
  IonItem,
  IonLabel,
  IonInput,
  IonSelect,
  IonSelectOption,
  IonButton,
  IonGrid,
  IonRow,
  IonCol,
  IonIcon,
  ModalController,
  LoadingController,
  ToastController,
} from '@ionic/angular/standalone';

import { finalize } from 'rxjs';

import { addIcons } from 'ionicons';
import { add, trashOutline } from 'ionicons/icons';

import { SalesPlanService } from '@web/services/sales-plan/sales-plan.service';
import { SellerService } from '@web/services/seller/seller.service';
import { ProductService } from '@web/services/product/product.service';

import { Product } from '@mobile/models/product.model';
import { Vendor } from '@web/services/seller/interfaces/vendor.interface';

import { CreateSalesPlanRequest } from './interfaces/create-sales-plan-request.interface';
import { SalesPlanFormValue } from './interfaces/sales-plan-form-value.interface';
import { ProductFormItem } from './interfaces/product-form-item.interface';
import { ProductTarget } from './interfaces/product-target.interface';

import { AddProductModalComponent } from './components/add-product-modal/add-product-modal.component';

@Component({
  selector: 'app-sales-plan-creation',
  templateUrl: 'sales-plan-creation.page.html',
  styleUrls: ['sales-plan-creation.page.scss'],
  imports: [
    ReactiveFormsModule,
    IonContent,
    IonCard,
    IonCardHeader,
    IonCardTitle,
    IonCardContent,
    IonItem,
    IonLabel,
    IonSelect,
    IonSelectOption,
    IonButton,
    IonGrid,
    IonRow,
    IonCol,
    IonIcon,
  ],
})
export class SalesPlanCreationPage implements OnInit {
  salesPlanForm: FormGroup;
  vendors: Vendor[] = [];
  products: Product[] = [];
  selectedProducts: ProductFormItem[] = [];

  public readonly regions = [
    { value: 'North America', label: 'Norteamérica' },
    { value: 'South America', label: 'Suramérica' },
    { value: 'Central America', label: 'Centroamérica' },
    { value: 'Europe', label: 'Europa' },
    { value: 'Asia', label: 'Asia' },
    { value: 'Africa', label: 'África' },
    { value: 'Oceania', label: 'Oceanía' },
  ];

  public readonly periods = [
    { value: 'Q1-2025', label: 'Q1 2025 (Ene - Mar)' },
    { value: 'Q2-2025', label: 'Q2 2025 (Abr - Jun)' },
    { value: 'Q3-2025', label: 'Q3 2025 (Jul - Sep)' },
    { value: 'Q4-2025', label: 'Q4 2025 (Oct - Dic)' },
    { value: 'Q1-2026', label: 'Q1 2026 (Ene - Mar)' },
    { value: 'Q2-2026', label: 'Q2 2026 (Abr - Jun)' },
  ];

  constructor(
    private readonly fb: FormBuilder,
    private readonly modalController: ModalController,
    private readonly salesPlanService: SalesPlanService,
    private readonly sellerService: SellerService,
    private readonly productService: ProductService,
    private readonly loadingController: LoadingController,
    private readonly toastController: ToastController,
  ) {
    addIcons({ add, trashOutline });
    this.salesPlanForm = this.fb.group({
      vendor_id: ['', [Validators.required]],
      period: ['', [Validators.required, Validators.minLength(3), Validators.maxLength(50)]],
      region: ['', [Validators.required]],
    });
  }

  public ngOnInit(): void {
    this.loadVendors();
    this.loadProducts();
  }

  public get vendorControl() {
    return this.salesPlanForm.get('vendor_id');
  }

  public get periodControl() {
    return this.salesPlanForm.get('period');
  }

  public get regionControl() {
    return this.salesPlanForm.get('region');
  }

  public onCancel(): void {
    this.salesPlanForm.reset();
    this.selectedProducts = [];
  }

  public onSubmit(): void {
    if (!this.salesPlanForm.valid) {
      this.salesPlanForm.markAllAsTouched();
      return;
    }

    if (this.selectedProducts.length === 0) {
      this.showErrorMessage('Debe agregar al menos un producto al plan de venta');
      return;
    }

    this.createSalesPlan();
  }

  public async openAddProductModal(): Promise<void> {
    const modal = await this.modalController.create({
      component: AddProductModalComponent,
      componentProps: {
        products: this.products,
      },
    });

    await modal.present();

    const { data, role } = await modal.onWillDismiss<ProductFormItem>();

    if (role === 'confirm' && data) {
      this.addProduct(data);
    }
  }

  public addProduct(productData: ProductFormItem): void {
    const existingProduct = this.selectedProducts.find(p => p.product_id === productData.product_id);

    if (existingProduct) {
      this.showErrorMessage('Este producto ya ha sido agregado al plan');
      return;
    }

    const newProduct: ProductFormItem = {
      id: this.generateId(),
      product_id: productData.product_id,
      name: productData.name,
      target_units: productData.target_units,
      target_value: productData.target_value,
    };

    this.selectedProducts.push(newProduct);
  }

  public removeProduct(id: string): void {
    this.selectedProducts = this.selectedProducts.filter((product) => product.id !== id);
  }

  private generateId(): string {
    return `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
  }

  private loadVendors(): void {
    this.sellerService.getVendors().subscribe({
      next: (vendors) => {
        this.vendors = vendors;
      },
      error: (httpError: HttpErrorResponse) => {
        const message =
          httpError.error?.error ??
          httpError.error?.message ??
          httpError.message ??
          'Error al cargar los vendedores.';
        this.showErrorMessage(message);
      },
    });
  }

  private loadProducts(): void {
    this.productService.getProducts().subscribe({
      next: (products) => {
        this.products = products;
      },
      error: (httpError: HttpErrorResponse) => {
        const message =
          httpError.error?.error ??
          httpError.error?.message ??
          httpError.message ??
          'Error al cargar los productos.';
        this.showErrorMessage(message);
      },
    });
  }

  private async createSalesPlan(): Promise<void> {
    const loading = await this.loadingController.create({
      message: 'Creando plan de venta...',
    });

    loading.present();

    const { vendor_id, period, region } = this.salesPlanForm.value as SalesPlanFormValue;

    const productTargets: ProductTarget[] = this.selectedProducts.map((product) => ({
      product_id: product.product_id,
      name: product.name,
      target_units: product.target_units,
      target_value: product.target_value,
    }));

    const salesPlanData: CreateSalesPlanRequest = {
      vendor_id,
      period,
      region,
      products: productTargets,
    };

    this.salesPlanService
      .createSalesPlan(salesPlanData)
      .pipe(finalize(() => this.loadingController.dismiss()))
      .subscribe({
        next: () => {
          this.salesPlanForm.reset();
          this.selectedProducts = [];
          this.showSuccessMessage('Plan de venta creado exitosamente.');
        },
        error: (httpError: HttpErrorResponse) => {
          const message =
            httpError.error?.error ??
            httpError.error?.message ??
            httpError.message ??
            'Error al crear el plan de venta.';
          this.showErrorMessage(message);
        },
      });
  }

  private async showSuccessMessage(message: string): Promise<void> {
    const toast = await this.toastController.create({
      message: message,
      duration: 3000,
      position: 'top',
    });

    await toast.present();
  }

  private async showErrorMessage(message: string): Promise<void> {
    const toast = await this.toastController.create({
      message: message,
      duration: 3000,
      position: 'top',
      color: 'danger',
    });

    await toast.present();
  }
}
