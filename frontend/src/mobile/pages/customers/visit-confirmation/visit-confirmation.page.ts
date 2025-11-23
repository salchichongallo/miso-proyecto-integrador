import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { CommonModule } from '@angular/common';

import { addIcons } from 'ionicons';
import { arrowBack } from 'ionicons/icons';

import {
  IonHeader,
  IonToolbar,
  IonTitle,
  IonContent,
  IonButtons,
  IonBackButton,
  IonButton,
} from '@ionic/angular/standalone';
import { TranslateModule } from '@ngx-translate/core';

interface VisitSummary {
  client: string;
  contact: string;
  dateTime: string;
}

@Component({
  selector: 'app-visit-confirmation-page',
  templateUrl: 'visit-confirmation.page.html',
  styleUrls: ['visit-confirmation.page.scss'],
  imports: [
    CommonModule,
    IonHeader,
    IonToolbar,
    IonTitle,
    IonContent,
    IonButtons,
    IonBackButton,
    IonButton,
    TranslateModule,
  ],
})
export class VisitConfirmationPage implements OnInit {
  visitSummary: VisitSummary = {
    client: '',
    contact: '',
    dateTime: '',
  };

  constructor(private readonly router: Router) {
    addIcons({ arrowBack });
  }

  ngOnInit(): void {
    // Get visit summary from navigation state
    const navigation = this.router.getCurrentNavigation();
    const state = navigation?.extras?.state;

    if (state && state['visitSummary']) {
      this.visitSummary = state['visitSummary'];
    }
  }

  onRegisterNewVisit(): void {
    this.router.navigate(['/customers/register-visit']);
  }
}
