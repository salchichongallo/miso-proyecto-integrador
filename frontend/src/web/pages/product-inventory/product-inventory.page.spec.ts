import { TestBed } from '@angular/core/testing';
import { ProductInventoryPage } from './product-inventory.page';

describe('ProductInventoryPage', () => {
  let component: ProductInventoryPage;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [ProductInventoryPage],
    });
    component = TestBed.inject(ProductInventoryPage);
  });

  it('should be defined', () => {
    expect(component).toBeDefined();
  });
});
