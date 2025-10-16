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
            path: 'tab1',
            loadComponent: () => import('./tab1/tab1.page').then((m) => m.Tab1Page),
          },
          {
            path: 'tab2',
            loadComponent: () => import('./tab2/tab2.page').then((m) => m.Tab2Page),
          },
          {
            path: 'tab3',
            loadComponent: () => import('./tab3/tab3.page').then((m) => m.Tab3Page),
          },
          {
            path: '',
            redirectTo: '/tabs/tab1',
            pathMatch: 'full',
          },
        ],
      },
      {
        path: '',
        redirectTo: '/tabs/tab1',
        pathMatch: 'full',
      },
    ],
  },
  {
    path: '**',
    redirectTo: '',
  },
];
