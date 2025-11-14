import { TestBed } from '@angular/core/testing';
import { FormBuilder } from '@angular/forms';
import { Router } from '@angular/router';
import { of } from 'rxjs';

import { RegisterVisitPage } from './register-visit.page';
import { CustomersService } from '@mobile/services/customers/customers.service';

describe('RegisterVisitPage', () => {
  let component: RegisterVisitPage;
  let mockRouter: Partial<jest.Mocked<Router>>;
  let mockFormBuilder: FormBuilder;
  let mockCustomersService: Partial<jest.Mocked<CustomersService>>;

  beforeEach(() => {
    mockRouter = {
      navigate: jest.fn(),
    };

    mockCustomersService = {
      getInstitutionalClients: jest.fn().mockReturnValue(of([])),
    };

    TestBed.configureTestingModule({
      providers: [
        FormBuilder,
        { provide: Router, useValue: mockRouter },
        { provide: CustomersService, useValue: mockCustomersService },
      ],
    });

    mockFormBuilder = TestBed.inject(FormBuilder);
    const router = TestBed.inject(Router);
    const customersService = TestBed.inject(CustomersService);

    component = new RegisterVisitPage(mockFormBuilder, router, customersService);
    component.ngOnInit();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should initialize the form with empty values', () => {
    expect(component.visitForm).toBeDefined();
    expect(component.visitForm.get('institutionalClient')?.value).toBe('');
    expect(component.visitForm.get('contactPerson')?.value).toBe('');
    expect(component.visitForm.get('visitDate')?.value).toBe('');
    expect(component.visitForm.get('visitTime')?.value).toBe('');
    expect(component.visitForm.get('observations')?.value).toBe('');
  });

  it('should load mock data on init', () => {
    expect(component.contactPersons.length).toBeGreaterThan(0);
    expect(mockCustomersService.getInstitutionalClients).toHaveBeenCalled();
  });

  it('should validate required fields', () => {
    const form = component.visitForm;

    expect(form.valid).toBeFalsy();

    form.patchValue({
      institutionalClient: '1',
      contactPerson: '1',
      visitDate: '2024-01-15',
      visitTime: '10:30',
    });

    expect(form.valid).toBeTruthy();
  });

  it('should not submit if form is invalid', async () => {
    component.visitForm.patchValue({
      institutionalClient: '',
      contactPerson: '',
    });

    await component.onSubmit();

    expect(component.isLoading).toBeFalsy();
    expect(mockRouter.navigate).not.toHaveBeenCalled();
  });

  it('should set hasError to true when registration fails', async () => {
    component.visitForm.patchValue({
      institutionalClient: '1',
      contactPerson: '1',
      visitDate: '2024-01-15',
      visitTime: '10:30',
    });

    // Mock Math.random to always fail
    jest.spyOn(Math, 'random').mockReturnValue(0.8);

    await component.onSubmit();

    expect(component.hasError).toBeTruthy();
    expect(component.errorMessage).toBeTruthy();
  });

  it('should navigate to confirmation page on successful registration', async () => {
    component.institutionalClients = [
      {
        client_id: '1',
        name: 'Hospital Test',
        tax_id: '123',
        country: 'CO',
        level: 'III',
        specialty: 'Test',
        location: 'Test Location',
        message: '',
      },
    ];

    component.visitForm.patchValue({
      institutionalClient: '1',
      contactPerson: 'Dr. Test',
      visitDate: '2024-01-15',
      visitTime: '10:30',
    });

    // Mock Math.random to always succeed
    jest.spyOn(Math, 'random').mockReturnValue(0.5);

    await component.onSubmit();

    expect(mockRouter.navigate).toHaveBeenCalledWith(
      ['/customers/visit-confirmation'],
      expect.objectContaining({
        state: {
          visitSummary: {
            client: 'Hospital Test',
            contact: 'Dr. Test',
            dateTime: '2024-01-15 10:30',
          },
        },
      }),
    );
  });

  it('should call onLoadMedia when upload button is clicked', () => {
    const consoleSpy = jest.spyOn(console, 'log').mockImplementation();

    component.onLoadMedia();

    expect(consoleSpy).toHaveBeenCalledWith('Load media clicked');

    consoleSpy.mockRestore();
  });

  it('should reset error state and form when onRetry is called', () => {
    component.hasError = true;
    component.errorMessage = 'Test error';
    component.visitForm.patchValue({
      institutionalClient: '1',
      contactPerson: 'Dr. Test',
    });

    component.onRetry();

    expect(component.hasError).toBeFalsy();
    expect(component.errorMessage).toBe('');
    expect(component.visitForm.value).toEqual({
      institutionalClient: null,
      contactPerson: null,
      visitDate: null,
      visitTime: null,
      observations: null,
    });
  });
});
