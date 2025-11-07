import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import {
  IonHeader,
  IonToolbar,
  IonTitle,
  IonContent,
  IonList,
  IonItem,
  IonLabel,
  IonSelect,
  IonSelectOption,
  ToastController,
} from '@ionic/angular/standalone';
import { TranslateModule } from '@ngx-translate/core';

import { TranslationService, Language } from '@shared/services/translation';

@Component({
  selector: 'app-settings',
  templateUrl: './settings.page.html',
  styleUrls: ['./settings.page.scss'],
  imports: [
    CommonModule,
    TranslateModule,
    IonHeader,
    IonToolbar,
    IonTitle,
    IonContent,
    IonList,
    IonItem,
    IonLabel,
    IonSelect,
    IonSelectOption,
  ],
})
export class SettingsPage {
  private readonly translationService = inject(TranslationService);
  private readonly toastController = inject(ToastController);

  public currentLanguage: Language = 'es';
  public readonly availableLanguages = [
    { value: 'es', label: 'settings.language.es' },
    { value: 'en', label: 'settings.language.en' },
  ];

  constructor() {
    this.currentLanguage = this.translationService.getCurrentLanguage();
  }

  public async onLanguageChange(event: CustomEvent): Promise<void> {
    const language = event.detail.value as Language;
    await this.translationService.setLanguage(language);
    this.currentLanguage = language;
    await this.showLanguageChangedToast(language);
  }

  private async showLanguageChangedToast(language: Language): Promise<void> {
    const languageName = language === 'es' ? 'Español' : 'English';
    const toast = await this.toastController.create({
      message:
        language === 'es'
          ? `Idioma cambiado a ${languageName}`
          : `Language changed to ${languageName}`,
      duration: 2000,
      position: 'bottom',
      color: 'success',
    });
    await toast.present();
  }
}
