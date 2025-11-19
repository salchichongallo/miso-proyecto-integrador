import { Routes } from '@angular/router';
import { Role, roleGuard } from '@shared/auth';
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
            path: 'settings',
            loadComponent: () => import('./pages/settings/settings.page').then((m) => m.SettingsPage),
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
        canActivate: [roleGuard.admin],
        loadComponent: () =>
          import('./pages/customers/register-institutional/register-institutional.page').then(
            (m) => m.RegisterInstitutionalPage,
          ),
      },
      {
        path: 'customers/my-clients',
        canActivate: [roleGuard.vendor],
        pathMatch: 'full',
        loadComponent: () =>
          import('./pages/customers/vendor-clients/vendor-clients.page').then((m) => m.VendorClientsPage),
      },
      {
        path: 'orders/search-orders',
        canActivate: [roleGuard.client],
        loadComponent: () => import('./pages/orders/search-orders/search-orders.page').then((m) => m.SearchOrdersPage),
      },
      {
        path: 'orders/create-order-with-products',
        canActivate: [roleGuard.oneOf([Role.vendor, Role.client])],
        loadComponent: () =>
          import('./pages/orders/create-order-with-products/create-order-with-products.page').then(
            (m) => m.CreateOrderWithProductsPage,
          ),
      },
      {
        path: 'orders/product-detail',
        canActivate: [roleGuard.oneOf([Role.vendor, Role.client])],
        loadComponent: () =>
          import('./pages/orders/product-detail/product-detail.page').then((m) => m.ProductDetailPage),
      },
      {
        path: 'cart',
        canActivate: [roleGuard.oneOf([Role.vendor, Role.client])],
        loadComponent: () => import('./pages/cart/cart.page').then((m) => m.CartPage),
      },
      {
        path: 'order-confirmation',
        canActivate: [roleGuard.oneOf([Role.vendor, Role.client])],
        loadComponent: () =>
          import('./pages/order-confirmation/order-confirmation.page').then((m) => m.OrderConfirmationPage),
      },
      {
        path: 'orders/scheduled-deliveries',
        canActivate: [roleGuard.client],
        pathMatch: 'full',
        loadComponent: () =>
          import('./pages/orders/scheduled-deliveries/scheduled-deliveries.page').then(
            (m) => m.ScheduledDeliveriesPage,
          ),
      },
      {
        path: 'customers/visits',
        canActivate: [roleGuard.vendor],
        pathMatch: 'full',
        loadComponent: () =>
          import('./pages/customers/consult-visits/consult-visits.page').then((m) => m.ConsultVisitsPage),
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
