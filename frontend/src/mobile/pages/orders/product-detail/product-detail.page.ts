import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { FormsModule } from '@angular/forms';

import {
  IonBackButton,
  IonHeader,
  IonToolbar,
  IonButtons,
  IonContent,
  IonLabel,
  IonIcon,
  IonText,
  IonBadge,
  IonSelect,
  IonSelectOption,
  IonButton,
  IonFooter,
  IonTitle,
} from '@ionic/angular/standalone';

import { Product } from '@mobile/models/product.model';

import { addIcons } from 'ionicons';
import { location, cartOutline } from 'ionicons/icons';

@Component({
  selector: 'app-product-detail',
  templateUrl: './product-detail.page.html',
  styleUrls: ['./product-detail.page.scss'],
  standalone: true,
  imports: [
    IonTitle,
    FormsModule,
    IonContent,
    IonButtons,
    IonToolbar,
    IonHeader,
    IonBackButton,
    IonIcon,
    IonText,
    IonBadge,
    IonSelect,
    IonSelectOption,
    IonButton,
    IonFooter,
  ],
})
export class ProductDetailPage implements OnInit {
  public product: Product | null = null;
  public quantity = '1';

  constructor(private route: ActivatedRoute) {
    addIcons({location,cartOutline});
  }

  public ngOnInit(): void {
    const navigation = history.state;
    if (navigation && navigation.product) {
      this.product = navigation.product;
    }
  }

  public addToCart(): void {
    console.log('Adding to cart:', this.product, 'Quantity:', this.quantity);
    // TODO: Implement add to cart logic
  }
}
