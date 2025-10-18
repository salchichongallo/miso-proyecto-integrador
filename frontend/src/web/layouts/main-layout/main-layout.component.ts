import { Component, OnInit } from '@angular/core';
import { Location } from '@angular/common';
import { Router, RouterOutlet, NavigationEnd } from '@angular/router';

import {
  IonApp,
  IonHeader,
  IonToolbar,
  IonTitle,
  IonContent,
  IonButtons,
  IonButton,
  IonIcon,
} from '@ionic/angular/standalone';

import { addIcons } from 'ionicons';
import { arrowBackOutline, logOutOutline } from 'ionicons/icons';

import { filter } from 'rxjs/operators';

import { AuthService } from '@shared/auth/auth.service';

@Component({
  selector: 'app-main-layout',
  templateUrl: './main-layout.component.html',
  styleUrls: ['./main-layout.component.scss'],
  imports: [
    RouterOutlet,
    IonApp,
    IonHeader,
    IonToolbar,
    IonTitle,
    IonContent,
    IonButtons,
    IonButton,
    IonIcon,
  ],
})
export class MainLayoutComponent implements OnInit {
  pageTitle = 'MISO - MediSupply';
  showBackButton = false;

  private readonly pageTitles: { [key: string]: string } = {
    '/home': 'MISO - MediSupply',
    '/seller-registration': 'Registrar vendedor',
    '/style-demo': 'Demostración de estilos',
  };

  constructor(
    private readonly router: Router,
    private readonly location: Location,
    private readonly authService: AuthService
  ) {
    addIcons({ arrowBackOutline, logOutOutline });
  }

  public ngOnInit(): void {
    this.updatePageTitle(this.router.url);

    this.router.events
      .pipe(filter((event) => event instanceof NavigationEnd))
      .subscribe((event) => {
        if (event instanceof NavigationEnd) {
          this.updatePageTitle(event.urlAfterRedirects);
        }
      });
  }

  public goBack(): void {
    this.location.back();
  }

  public async onLogout(): Promise<void> {
    await this.authService.logout();
    this.router.navigate(['/login']);
  }

  private updatePageTitle(url: string): void {
    this.pageTitle = this.pageTitles[url] ?? 'MISO - MediSupply';
    this.showBackButton = url !== '/home';
  }
}
