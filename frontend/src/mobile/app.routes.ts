import { Routes } from '@angular/router';
import { loginGuard } from '@shared/guards/login/login.guard';
import { authGuard } from '../shared/guards/auth/auth.guard';
import { TabsPage } from './tabs/tabs.page';

export const routes: Routes = [
  {
    path: 'login',
    canActivate: [loginGuard],
    loadComponent: () => import('./pages/login/login.page').then((m) => m.LoginPage),
  },
  {
    path: '',
    canActivate: [authGuard],
    children: [
      {
        path: 'tabs',
        component: TabsPage,
        children: [
          {
            path: 'customers',
            loadComponent: () => import('./pages/customers/customers.page').then((m) => m.CustomersPage),
          },
          {
            path: 'orders',
            loadComponent: () => import('./pages/orders/orders.page').then((m) => m.OrdersPage),
          },
          {
            path: '',
            redirectTo: '/tabs/customers',
            pathMatch: 'full',
          },
        ],
      },
      {
        path: 'customers/register-institutional',
        loadComponent: () =>
          import('./pages/customers/register-institutional/register-institutional.page').then(
            (m) => m.RegisterInstitutionalPage,
          ),
      },
      {
        path: 'orders/create-order-with-products',
        loadComponent: () =>
          import('./pages/orders/create-order-with-products/create-order-with-products.page').then(
            (m) => m.CreateOrderWithProductsPage,
          ),
      },
      {
        path: 'orders/product-detail',
        loadComponent: () =>
          import('./pages/orders/product-detail/product-detail.page').then(
            (m) => m.ProductDetailPage,
          ),
      },
      {
        path: 'cart',
        loadComponent: () => import('./pages/cart/cart.page').then((m) => m.CartPage),
      },
      {
        path: 'order-confirmation',
        loadComponent: () =>
          import('./pages/order-confirmation/order-confirmation.page').then(
            (m) => m.OrderConfirmationPage,
          ),
      },
      {
        path: '',
        pathMatch: 'full',
        redirectTo: '/tabs/customers',
      },
    ],
  },
  {
    path: '**',
    redirectTo: '',
  },
];
