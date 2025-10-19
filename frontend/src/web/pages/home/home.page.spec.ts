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

  describe('navigateTo', () => {
    it('should navigate to seller registration', () => {
      component.navigateTo('/seller-registration');
      expect(mockRouter.navigate).toHaveBeenCalledWith(['/seller-registration']);
    });

    it('should navigate to supplier registration', () => {
      component.navigateTo('/supplier-registration');
      expect(mockRouter.navigate).toHaveBeenCalledWith(['/supplier-registration']);
    });

    it('should navigate to supplier bulk upload', () => {
      component.navigateTo('/supplier-bulk-upload');
      expect(mockRouter.navigate).toHaveBeenCalledWith(['/supplier-bulk-upload']);
    });

    it('should navigate to product registration', () => {
      component.navigateTo('/product-registration');
      expect(mockRouter.navigate).toHaveBeenCalledWith(['/product-registration']);
    });

    it('should navigate to product bulk upload', () => {
      component.navigateTo('/product-bulk-upload');
      expect(mockRouter.navigate).toHaveBeenCalledWith(['/product-bulk-upload']);
    });

    it('should navigate to any given route', () => {
      component.navigateTo('/custom-route');
      expect(mockRouter.navigate).toHaveBeenCalledWith(['/custom-route']);
    });
  });
});
