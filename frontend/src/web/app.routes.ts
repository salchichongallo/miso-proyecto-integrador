import { Routes } from '@angular/router';

export const routes: Routes = [
  {
    path: 'login',
    loadComponent: () => import('./pages/login/login.page').then((m) => m.LoginPage),
  },
  {
    path: 'style-demo',
    loadComponent: () => import('./pages/style-demo/style-demo.page').then((m) => m.StyleDemoPage),
  },
  {
    path: '',
    redirectTo: 'login',
    pathMatch: 'full',
  }
];
