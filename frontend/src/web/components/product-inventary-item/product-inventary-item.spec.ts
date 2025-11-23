import { ComponentFixture, TestBed } from '@angular/core/testing';
import { TranslateModule } from '@ngx-translate/core';
import { ProductInventaryItem } from './product-inventary-item';

describe('ProductInventaryItem', () => {
  let component: ProductInventaryItem;
  let fixture: ComponentFixture<ProductInventaryItem>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [ProductInventaryItem],
      imports: [TranslateModule.forRoot()],
    });
    fixture = TestBed.createComponent(ProductInventaryItem);
    component = fixture.componentInstance;
    fixture.componentRef.setInput('product', { expiration_date: '2024-12-31' });
    fixture.detectChanges();
  });

  describe('expiration date', () => {
    it('should parse expiration date correctly', () => {
      fixture.componentRef.setInput('product', { expiration_date: '2025-12-31' });
      fixture.detectChanges();
      expect(component.expirationDate()).toEqual(new Date('2025-12-31'));
    });

    it('should calculate remaining days correctly', () => {
      const today = new Date();
      jest.useFakeTimers().setSystemTime(new Date('2024-12-01'));
      fixture.componentRef.setInput('product', { expiration_date: '2024-12-31' });
      fixture.detectChanges();
      expect(component.remainingDays()).toBe(30);
      jest.useRealTimers();
    });

    it('should identify expiring soon products', () => {
      jest.useFakeTimers().setSystemTime(new Date('2024-12-01'));
      fixture.componentRef.setInput('product', { expiration_date: '2024-12-15' });
      fixture.detectChanges();
      expect(component.expiringSoon()).toBe(true);

      fixture.componentRef.setInput('product', { expiration_date: '2025-01-15' });
      fixture.detectChanges();
      expect(component.expiringSoon()).toBe(false);
      jest.useRealTimers();
    });
  });
});
