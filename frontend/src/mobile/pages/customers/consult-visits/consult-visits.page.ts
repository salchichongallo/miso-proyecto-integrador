import { addIcons } from 'ionicons';
import { Component, inject, OnInit, signal } from '@angular/core';
import { informationCircle, calendarNumber } from 'ionicons/icons';
import { TranslateModule, TranslateService } from '@ngx-translate/core';
import {
  IonHeader,
  IonTitle,
  IonContent,
  IonToolbar,
  IonButtons,
  IonBackButton,
  IonCard,
  IonIcon,
  IonCardTitle,
  IonCardContent,
  LoadingController,
  ToastController,
} from '@ionic/angular/standalone';
import { VisitsService, SearchResult } from '@mobile/services/visits';
import { DateButtonComponent } from '@mobile/components/date-button/date-button.component';
import { VisitCardItemComponent } from '@mobile/components/visit-card-item/visit-card-item.component';

@Component({
  selector: 'app-consult-visits-page',
  templateUrl: 'consult-visits.page.html',
  styleUrls: ['consult-visits.page.scss'],
  imports: [
    IonCardContent,
    IonCardTitle,
    IonIcon,
    IonCard,
    IonBackButton,
    IonButtons,
    IonHeader,
    IonToolbar,
    IonTitle,
    IonContent,
    TranslateModule,
    DateButtonComponent,
    VisitCardItemComponent,
  ],
})
export class ConsultVisitsPage implements OnInit {
  private readonly visitsService = inject(VisitsService);

  readonly result = signal<SearchResult>({ total: 0, visits: [] });

  readonly selectedDate = signal<string>(new Date().toISOString());

  private readonly toast = inject(ToastController);
  private readonly loader = inject(LoadingController);
  private readonly translate = inject(TranslateService);

  constructor() {
    addIcons({ informationCircle, calendarNumber });
  }

  async ngOnInit() {
    await this.loadVisits();
  }

  private async loadVisits() {
    const loading = await this.showLoader();
    try {
      const result = await this.visitsService.search(this.selectedDate());
      this.result.set(result);
    } catch (error: any) {
      console.error(error);
      await this.showToastError(error);
    } finally {
      await loading.dismiss();
    }
  }

  async onChangeDate(date: string) {
    this.selectedDate.set(date);
    await this.loadVisits();
  }

  private async showLoader() {
    const loading = await this.loader.create({
      message: this.translate.instant('common.loading'),
      keyboardClose: false,
      backdropDismiss: false,
    });
    await loading.present();
    return loading;
  }

  private async showToastError(error: unknown) {
    await this.loader.dismiss();
    const errorMessage = 'Error';
    const fullMessage =
      error && typeof error === 'object' && 'message' in error
        ? `${errorMessage}. ${(error as { message: string }).message}`
        : errorMessage;

    return this.toast
      .create({ message: fullMessage, duration: 7000, color: 'danger' })
      .then((toast) => toast.present());
  }
}
