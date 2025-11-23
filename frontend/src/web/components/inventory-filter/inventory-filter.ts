import { FormBuilder, ReactiveFormsModule } from '@angular/forms';
import { Component, EventEmitter, inject, Output } from '@angular/core';
import { IonList, IonItem, IonButton, IonInput, IonIcon, IonCardContent, IonCard } from '@ionic/angular/standalone';
import { TranslateModule } from '@ngx-translate/core';

import { addIcons } from 'ionicons';
import { filter } from 'ionicons/icons';

import { SearchInventoryParams } from '../../pages/product-inventory/interfaces/search-inventory-params.interface';

@Component({
  selector: 'app-inventory-filter',
  templateUrl: './inventory-filter.ts.html',
  styleUrl: './inventory-filter.ts.scss',
  imports: [
    ReactiveFormsModule,
    IonList,
    IonItem,
    IonButton,
    IonInput,
    IonIcon,
    IonCardContent,
    IonCard,
    TranslateModule,
  ],
})
export class InventoryFilterComponent {
  protected readonly fb = inject(FormBuilder);

  protected readonly form = this.fb.group({
    productName: this.fb.control('', { nonNullable: true }),
    batch: this.fb.control('', { nonNullable: true }),
    status: this.fb.control('', { nonNullable: true }),
    warehouseName: this.fb.control('', { nonNullable: true }),
  });

  @Output()
  readonly onSubmit = new EventEmitter<SearchInventoryParams>();

  constructor() {
    addIcons({ filter });
  }

  submit() {
    this.onSubmit.emit({
      productName: this.form.controls.productName.value,
      batch: this.form.controls.batch.value,
      status: this.form.controls.status.value,
      warehouseName: this.form.controls.warehouseName.value,
    });
  }

  reset() {
    this.form.reset();
    this.onSubmit.emit({
      productName: '',
      batch: '',
      status: '',
      warehouseName: '',
    });
  }
}
