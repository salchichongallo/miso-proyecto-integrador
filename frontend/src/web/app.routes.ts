import { Routes } from '@angular/router';

import { authGuard } from '@shared/guards/auth/auth.guard';
import { loginGuard } from '@shared/guards/login/login.guard';

export const routes: Routes = [
  {
    path: 'login',
    canActivate: [loginGuard],
    loadComponent: () => import('./pages/login/login.page').then((m) => m.LoginPage),
  },
  {
    path: '',
    canActivate: [authGuard],
    loadComponent: () => import('./layouts/main-layout/main-layout.component').then((m) => m.MainLayoutComponent),
    children: [
      {
        path: 'home',
        loadComponent: () => import('./pages/home/home.page').then((m) => m.HomePage),
      },
      {
        path: 'seller-registration',
        loadComponent: () =>
          import('./pages/seller-registration/seller-registration.page').then((m) => m.SellerRegistrationPage),
      },
      {
        path: 'supplier-registration',
        loadComponent: () =>
          import('./pages/supplier-registration/supplier-registration.page').then((m) => m.SupplierRegistrationPage),
      },
      {
        path: 'supplier-bulk-upload',
        loadComponent: () =>
          import('./pages/supplier-bulk-upload/supplier-bulk-upload.page').then((m) => m.SupplierBulkUploadPage),
      },
      {
        path: 'product-registration',
        loadComponent: () =>
          import('./pages/product-registration/product-registration.page').then((m) => m.ProductRegistrationPage),
      },
      {
        path: 'product-bulk-upload',
        loadComponent: () =>
          import('./pages/product-bulk-upload/product-bulk-upload.page').then((m) => m.ProductBulkUploadPage),
      },
      {
        path: 'sales-plan-creation',
        loadComponent: () =>
          import('./pages/sales-plan-creation/sales-plan-creation.page').then((m) => m.SalesPlanCreationPage),
      },
      {
        path: 'product-inventory',
        pathMatch: 'full',
        loadComponent: () =>
          import('./pages/product-inventory/product-inventory.page').then((m) => m.ProductInventoryPage),
      },
      {
        path: 'seller-reports',
        loadComponent: () =>
          import('./pages/seller-reports/seller-reports.page').then((m) => m.SellerReportsPage),
      },
      {
        path: 'style-demo',
        loadComponent: () => import('./pages/style-demo/style-demo.page').then((m) => m.StyleDemoPage),
      },
      {
        path: '',
        redirectTo: 'home',
        pathMatch: 'full',
      },
      {
        path: '**',
        redirectTo: 'home',
        pathMatch: 'full',
      },
    ],
  },
];
