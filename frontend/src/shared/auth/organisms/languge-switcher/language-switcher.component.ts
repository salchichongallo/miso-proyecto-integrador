import { addIcons } from 'ionicons';
import { languageOutline } from 'ionicons/icons';
import { Component, inject } from '@angular/core';
import { IonIcon } from '@ionic/angular/standalone';
import { TranslateModule } from '@ngx-translate/core';
import { TranslationService } from '@shared/services/translation';

@Component({
  selector: 'app-language-switcher',
  templateUrl: './language-switcher.component.html',
  styleUrls: ['./language-switcher.component.scss'],
  imports: [IonIcon, TranslateModule],
})
export class LanguageSwitcherComponent {
  private readonly translationService = inject(TranslationService);

  constructor() {
    addIcons({ languageOutline });
  }

  onChangeLanguage(event: Event, language: string) {
    event.preventDefault();
    return this.translationService.setLanguage(language as any);
  }
}
