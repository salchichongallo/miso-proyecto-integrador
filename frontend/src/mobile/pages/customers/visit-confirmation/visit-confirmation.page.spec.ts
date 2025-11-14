import { TestBed } from '@angular/core/testing';
import { Router } from '@angular/router';
import { TranslateModule } from '@ngx-translate/core';

import { VisitConfirmationPage } from './visit-confirmation.page';

describe('VisitConfirmationPage', () => {
  let component: VisitConfirmationPage;
  let mockRouter: Partial<jest.Mocked<Router>>;

  beforeEach(() => {
    mockRouter = {
      navigate: jest.fn(),
      getCurrentNavigation: jest.fn().mockReturnValue({
        extras: {
          state: {
            visitSummary: {
              client: 'Hospital San José',
              contact: 'Ana Rodríguez',
              dateTime: '2025-09-28 14:41',
            },
          },
        },
      }),
    };

    TestBed.configureTestingModule({
      imports: [TranslateModule.forRoot()],
      providers: [{ provide: Router, useValue: mockRouter }],
    });

    const router = TestBed.inject(Router);
    component = new VisitConfirmationPage(router);
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should load visit summary from navigation state', () => {
    component.ngOnInit();

    expect(component.visitSummary.client).toBe('Hospital San José');
    expect(component.visitSummary.contact).toBe('Ana Rodríguez');
    expect(component.visitSummary.dateTime).toBe('2025-09-28 14:41');
  });

  it('should navigate to register visit page when clicking register new visit', () => {
    component.onRegisterNewVisit();

    expect(mockRouter.navigate).toHaveBeenCalledWith(['/customers/register-visit']);
  });

  it('should handle missing navigation state gracefully', () => {
    mockRouter.getCurrentNavigation = jest.fn().mockReturnValue(null);

    const router = TestBed.inject(Router);
    const newComponent = new VisitConfirmationPage(router);
    newComponent.ngOnInit();

    expect(newComponent.visitSummary.client).toBe('');
    expect(newComponent.visitSummary.contact).toBe('');
    expect(newComponent.visitSummary.dateTime).toBe('');
  });
});
