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
        path: 'vendor-bulk-upload',
        loadComponent: () =>
          import('./pages/vendor-bulk-upload/vendor-bulk-upload.page').then((m) => m.VendorBulkUploadPage),
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
