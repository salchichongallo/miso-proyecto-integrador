import { TestBed } from '@angular/core/testing';
import { FormBuilder } from '@angular/forms';
import { Router } from '@angular/router';

import { RegisterVisitPage } from './register-visit.page';

describe('RegisterVisitPage', () => {
  let component: RegisterVisitPage;
  let mockRouter: Partial<jest.Mocked<Router>>;
  let mockFormBuilder: FormBuilder;

  beforeEach(() => {
    mockRouter = {
      navigate: jest.fn(),
    };

    TestBed.configureTestingModule({
      providers: [
        FormBuilder,
        { provide: Router, useValue: mockRouter },
      ],
    });

    mockFormBuilder = TestBed.inject(FormBuilder);
    const router = TestBed.inject(Router);

    component = new RegisterVisitPage(mockFormBuilder, router);
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
    expect(component.institutionalClients.length).toBeGreaterThan(0);
    expect(component.contactPersons.length).toBeGreaterThan(0);
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

  it('should navigate to customers page on successful registration', async () => {
    component.visitForm.patchValue({
      institutionalClient: '1',
      contactPerson: '1',
      visitDate: '2024-01-15',
      visitTime: '10:30',
    });

    // Mock Math.random to always succeed
    jest.spyOn(Math, 'random').mockReturnValue(0.5);

    await component.onSubmit();

    expect(mockRouter.navigate).toHaveBeenCalledWith(['/tabs/customers']);
  });

  it('should call onLoadMedia when upload button is clicked', () => {
    const consoleSpy = jest.spyOn(console, 'log').mockImplementation();

    component.onLoadMedia();

    expect(consoleSpy).toHaveBeenCalledWith('Load media clicked');

    consoleSpy.mockRestore();
  });
});
