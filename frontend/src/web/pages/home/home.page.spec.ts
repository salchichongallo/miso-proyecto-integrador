import { ComponentFixture, TestBed } from '@angular/core/testing';
import { Router } from '@angular/router';

import { HomePage } from './home.page';

describe('HomePage', () => {
  let component: HomePage;
  let fixture: ComponentFixture<HomePage>;
  let mockRouter: jest.Mocked<Pick<Router, 'navigate'>>;

  beforeEach(async () => {
    mockRouter = {
      navigate: jest.fn(),
    };

    await TestBed.configureTestingModule({
      imports: [HomePage],
      providers: [{ provide: Router, useValue: mockRouter }],
    }).compileComponents();

    fixture = TestBed.createComponent(HomePage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should navigate to seller registration', () => {
    component.navigateToSellerRegistration();
    expect(mockRouter.navigate).toHaveBeenCalledWith(['/seller-registration']);
  });

  it('should navigate to vendor bulk upload', () => {
    component.navigateToVendorBulkUpload();
    expect(mockRouter.navigate).toHaveBeenCalledWith(['/vendor-bulk-upload']);
  });
});
