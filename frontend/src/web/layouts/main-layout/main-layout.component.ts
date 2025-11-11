import { Component, OnInit } from '@angular/core';
import { Location } from '@angular/common';
import { Router, RouterOutlet, NavigationEnd } from '@angular/router';
import { FormsModule } from '@angular/forms';

import {
  IonApp,
  IonHeader,
  IonToolbar,
  IonTitle,
  IonContent,
  IonButtons,
  IonButton,
  IonIcon,
  IonSelect,
  IonSelectOption,
} from '@ionic/angular/standalone';
import { TranslateModule } from '@ngx-translate/core';

import { addIcons } from 'ionicons';
import { arrowBackOutline, logOutOutline, languageOutline } from 'ionicons/icons';

import { filter } from 'rxjs/operators';

import { AuthService } from '@shared/auth/auth.service';
import { TranslationService, type Language } from '@shared/services/translation';

@Component({
  selector: 'app-main-layout',
  templateUrl: './main-layout.component.html',
  styleUrls: ['./main-layout.component.scss'],
  imports: [
    FormsModule,
    RouterOutlet,
    IonApp,
    IonHeader,
    IonToolbar,
    IonTitle,
    IonContent,
    IonButtons,
    IonButton,
    IonIcon,
    IonSelect,
    IonSelectOption,
    TranslateModule,
  ],
})
export class MainLayoutComponent implements OnInit {
  pageTitle = 'MISO - MediSupply';
  showBackButton = false;

  public currentLanguage: Language = 'es';
  public readonly availableLanguages = [
    { value: 'es' as Language, label: 'settings.language.es' },
    { value: 'en' as Language, label: 'settings.language.en' },
  ];

  private readonly pageTitles: { [key: string]: string } = {
    '/home': 'MISO - MediSupply',
    '/seller-registration': 'Registrar vendedor',
    '/supplier-registration': 'Registrar proveedor',
    '/supplier-bulk-upload': 'Registro masivo de proveedores',
    '/product-registration': 'Registrar producto',
    '/product-bulk-upload': 'Registro masivo de productos',
    '/seller-report': 'Consulta de reportes e informes de los vendedores',
    '/delivery-routes': 'Generación de rutas de entrega',
    '/style-demo': 'Demostración de estilos',
  };

  constructor(
    private readonly router: Router,
    private readonly location: Location,
    private readonly authService: AuthService,
    private readonly translationService: TranslationService,
  ) {
    addIcons({ arrowBackOutline, logOutOutline, languageOutline });
    this.currentLanguage = this.translationService.getCurrentLanguage();
  }

  public ngOnInit(): void {
    this.updatePageTitle(this.router.url);

    this.router.events.pipe(filter((event) => event instanceof NavigationEnd)).subscribe((event) => {
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

  public async onLanguageChange(event: CustomEvent): Promise<void> {
    const language = event.detail.value as Language;
    await this.translationService.setLanguage(language);
    this.currentLanguage = language;
  }

  private updatePageTitle(url: string): void {
    this.pageTitle = this.pageTitles[url] ?? 'MISO - MediSupply';
    this.showBackButton = url !== '/home';
  }
}
