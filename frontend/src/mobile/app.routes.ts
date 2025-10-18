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
            path: '',
            redirectTo: '/tabs/customers',
            pathMatch: 'full',
          },
        ],
      },
      {
        path: '',
        redirectTo: '/tabs/customers',
        pathMatch: 'full',
      },
    ],
  },
  {
    path: '**',
    redirectTo: '',
  },
];
