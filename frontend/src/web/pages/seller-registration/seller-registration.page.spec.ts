import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ReactiveFormsModule } from '@angular/forms';
import { HttpErrorResponse } from '@angular/common/http';
import { LoadingController, ModalController, ToastController } from '@ionic/angular/standalone';
import { TranslateModule, TranslateLoader } from '@ngx-translate/core';
import { of, throwError } from 'rxjs';

import { SellerRegistrationPage } from './seller-registration.page';
import { SellerService } from '../../services/seller/seller.service';
import { AddInstitutionModalComponent } from './components/add-institution-modal/add-institution-modal.component';
import { RegisterSellerResponse } from './interfaces/register-seller-response.interface';

class FakeLoader implements TranslateLoader {
  getTranslation() {
    return of({});
  }
}

describe('SellerRegistrationPage', () => {
  let component: SellerRegistrationPage;
  let fixture: ComponentFixture<SellerRegistrationPage>;
  let sellerService: { registerSeller: jest.Mock };
  let modalController: { create: jest.Mock };
  let loadingController: { create: jest.Mock; dismiss: jest.Mock };
  let toastController: { create: jest.Mock };

  const mockLoading = {
    present: jest.fn().mockResolvedValue(undefined),
    dismiss: jest.fn().mockResolvedValue(true),
  };

  const mockToast = {
    present: jest.fn().mockResolvedValue(undefined),
  };

  beforeEach(async () => {
    const sellerServiceMock = {
      registerSeller: jest.fn(),
    };

    const modalControllerMock = {
      create: jest.fn(),
    };

    const loadingControllerMock = {
      create: jest.fn().mockResolvedValue(mockLoading),
      dismiss: jest.fn().mockResolvedValue(true),
    };

    const toastControllerMock = {
      create: jest.fn().mockResolvedValue(mockToast),
    };

    await TestBed.configureTestingModule({
      imports: [
        SellerRegistrationPage,
        TranslateModule.forRoot({
          loader: { provide: TranslateLoader, useClass: FakeLoader },
        }),
      ],
      providers: [
        { provide: SellerService, useValue: sellerServiceMock },
        { provide: ModalController, useValue: modalControllerMock },
        { provide: LoadingController, useValue: loadingControllerMock },
        { provide: ToastController, useValue: toastControllerMock },
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(SellerRegistrationPage);
    component = fixture.componentInstance;
    sellerService = sellerServiceMock;
    modalController = modalControllerMock;
    loadingController = loadingControllerMock;
    toastController = toastControllerMock;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  describe('Form initialization', () => {
    it('should initialize form with empty fields', () => {
      expect(component.sellerForm.get('name')?.value).toBe('');
      expect(component.sellerForm.get('email')?.value).toBe('');
    });

    it('should have validators on name field', () => {
      const nameControl = component.sellerForm.get('name');
      nameControl?.setValue('');
      expect(nameControl?.hasError('required')).toBe(true);

      nameControl?.setValue('ab');
      expect(nameControl?.hasError('minlength')).toBe(true);

      nameControl?.setValue('abc');
      expect(nameControl?.valid).toBe(true);
    });

    it('should have validators on email field', () => {
      const emailControl = component.sellerForm.get('email');
      emailControl?.setValue('');
      expect(emailControl?.hasError('required')).toBe(true);

      emailControl?.setValue('invalid-email');
      expect(emailControl?.hasError('email')).toBe(true);

      emailControl?.setValue('valid@email.com');
      expect(emailControl?.valid).toBe(true);
    });
  });

  describe('Form control getters', () => {
    it('should return nameControl', () => {
      expect(component.nameControl).toBe(component.sellerForm.get('name'));
    });

    it('should return emailControl', () => {
      expect(component.emailControl).toBe(component.sellerForm.get('email'));
    });
  });

  describe('onCancel', () => {
    it('should reset form and clear institutions', () => {
      component.sellerForm.patchValue({ name: 'John', email: 'john@test.com' });
      component.institutions = [
        { id: '1', name: 'Institution 1' },
        { id: '2', name: 'Institution 2' },
      ];

      component.onCancel();

      expect(component.sellerForm.get('name')?.value).toBeNull();
      expect(component.sellerForm.get('email')?.value).toBeNull();
      expect(component.institutions).toEqual([]);
    });
  });

  describe('onSubmit', () => {
    it('should mark form as touched when invalid', () => {
      const markAllAsTouchedSpy = jest.spyOn(component.sellerForm, 'markAllAsTouched');

      component.onSubmit();

      expect(markAllAsTouchedSpy).toHaveBeenCalled();
      expect(sellerService.registerSeller).not.toHaveBeenCalled();
    });

    it('should call registerSeller when form is valid', async () => {
      const mockResponse: RegisterSellerResponse = {
        mssg: 'Success',
        vendor: {
          vendor_id: '123',
          name: 'John Doe',
          email: 'john@test.com',
          institutions: [],
        },
      };

      sellerService.registerSeller.mockReturnValue(of(mockResponse));

      component.sellerForm.patchValue({
        name: 'John Doe',
        email: 'john@test.com',
      });

      component.onSubmit();

      await fixture.whenStable();

      expect(sellerService.registerSeller).toHaveBeenCalled();
    });
  });

  describe('openAddInstitutionModal', () => {
    it('should open modal and add institution on confirm', async () => {
      const mockModal = {
        present: jest.fn().mockResolvedValue(undefined),
        onWillDismiss: jest.fn().mockResolvedValue({
          data: 'New Institution',
          role: 'confirm',
        }),
      };

      modalController.create.mockResolvedValue(mockModal as unknown as HTMLIonModalElement);

      await component.openAddInstitutionModal();

      expect(modalController.create).toHaveBeenCalledWith({
        component: AddInstitutionModalComponent,
      });
      expect(mockModal.present).toHaveBeenCalled();
      expect(component.institutions.length).toBe(1);
      expect(component.institutions[0].name).toBe('New Institution');
    });

    it('should not add institution on cancel', async () => {
      const mockModal = {
        present: jest.fn().mockResolvedValue(undefined),
        onWillDismiss: jest.fn().mockResolvedValue({
          data: null,
          role: 'cancel',
        }),
      };

      modalController.create.mockResolvedValue(mockModal as unknown as HTMLIonModalElement);

      await component.openAddInstitutionModal();

      expect(component.institutions.length).toBe(0);
    });
  });

  describe('addInstitution', () => {
    it('should add institution to the list', () => {
      component.addInstitution('Test Institution');

      expect(component.institutions.length).toBe(1);
      expect(component.institutions[0].name).toBe('Test Institution');
      expect(component.institutions[0].id).toBeDefined();
    });
  });

  describe('removeInstitution', () => {
    it('should remove institution from the list', () => {
      component.institutions = [
        { id: '1', name: 'Institution 1' },
        { id: '2', name: 'Institution 2' },
        { id: '3', name: 'Institution 3' },
      ];

      component.removeInstitution('2');

      expect(component.institutions.length).toBe(2);
      expect(component.institutions.find((i) => i.id === '2')).toBeUndefined();
    });
  });

  describe('registerSeller', () => {
    beforeEach(() => {
      component.sellerForm.patchValue({
        name: 'John Doe',
        email: 'john@test.com',
      });
      component.institutions = [{ id: 'inst-1', name: 'Institution 1' }];
    });

    it('should show loading, call service, and show success message', async () => {
      const mockResponse: RegisterSellerResponse = {
        mssg: 'Success',
        vendor: {
          vendor_id: '123',
          name: 'John Doe',
          email: 'john@test.com',
          institutions: ['inst-1'],
        },
      };

      sellerService.registerSeller.mockReturnValue(of(mockResponse));

      component.onSubmit();

      await fixture.whenStable();

      expect(loadingController.create).toHaveBeenCalledWith({
        message: 'Registrando vendedor...',
      });
      expect(mockLoading.present).toHaveBeenCalled();
      expect(sellerService.registerSeller).toHaveBeenCalledWith({
        name: 'John Doe',
        email: 'john@test.com',
        institutions: ['inst-1'],
      });
      expect(loadingController.dismiss).toHaveBeenCalled();
      expect(toastController.create).toHaveBeenCalledWith({
        message: 'Vendedor registrado exitosamente.',
        duration: 3000,
        position: 'top',
      });
      expect(component.sellerForm.get('name')?.value).toBeNull();
      expect(component.institutions).toEqual([]);
    });

    it('should handle error with error.error property', async () => {
      const mockError = new HttpErrorResponse({
        error: { error: 'Custom error message' },
        status: 400,
        statusText: 'Bad Request',
      });

      sellerService.registerSeller.mockReturnValue(throwError(() => mockError));

      component.onSubmit();

      await fixture.whenStable();

      expect(loadingController.dismiss).toHaveBeenCalled();
      expect(toastController.create).toHaveBeenCalledWith({
        message: 'Custom error message',
        duration: 3000,
        position: 'top',
        color: 'danger',
      });
    });

    it('should handle error with error.message property', async () => {
      const mockError = new HttpErrorResponse({
        error: { message: 'Server error message' },
        status: 500,
        statusText: 'Internal Server Error',
      });

      sellerService.registerSeller.mockReturnValue(throwError(() => mockError));

      component.onSubmit();

      await fixture.whenStable();

      expect(toastController.create).toHaveBeenCalledWith({
        message: 'Server error message',
        duration: 3000,
        position: 'top',
        color: 'danger',
      });
    });

    it('should handle error with default message', async () => {
      const mockError = new HttpErrorResponse({
        error: {},
        status: 500,
        statusText: 'Internal Server Error',
        url: 'http://test.com',
      });

      sellerService.registerSeller.mockReturnValue(throwError(() => mockError));

      component.onSubmit();

      await fixture.whenStable();

      expect(toastController.create).toHaveBeenCalledWith({
        message: 'Http failure response for http://test.com: 500 Internal Server Error',
        duration: 3000,
        position: 'top',
        color: 'danger',
      });
    });
  });
});
