import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ModalController } from '@ionic/angular/standalone';

import { AddInstitutionModalComponent } from './add-institution-modal.component';

describe('AddInstitutionModalComponent', () => {
  let component: AddInstitutionModalComponent;
  let fixture: ComponentFixture<AddInstitutionModalComponent>;
  let modalControllerMock: { dismiss: jest.Mock };

  beforeEach(async () => {
    modalControllerMock = {
      dismiss: jest.fn(),
    };

    await TestBed.configureTestingModule({
      imports: [AddInstitutionModalComponent],
      providers: [{ provide: ModalController, useValue: modalControllerMock }],
    }).compileComponents();

    fixture = TestBed.createComponent(AddInstitutionModalComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  describe('Form initialization', () => {
    it('should initialize form with empty name field', () => {
      expect(component.institutionForm).toBeDefined();
      expect(component.institutionForm.get('name')?.value).toBe('');
    });

    it('should have required validator on name field', () => {
      const nameControl = component.institutionForm.get('name');
      nameControl?.setValue('');
      expect(nameControl?.hasError('required')).toBe(true);
    });

    it('should have minLength validator on name field', () => {
      const nameControl = component.institutionForm.get('name');
      nameControl?.setValue('ab');
      expect(nameControl?.hasError('minlength')).toBe(true);

      nameControl?.setValue('abc');
      expect(nameControl?.hasError('minlength')).toBe(false);
    });
  });

  describe('nameControl getter', () => {
    it('should return the name form control', () => {
      const nameControl = component.nameControl;
      expect(nameControl).toBe(component.institutionForm.get('name'));
    });
  });

  describe('onCancel', () => {
    it('should dismiss modal with cancel role', () => {
      component.onCancel();

      expect(modalControllerMock.dismiss).toHaveBeenCalledWith(null, 'cancel');
    });
  });

  describe('onAdd', () => {
    it('should dismiss modal with institution name when form is valid', () => {
      const institutionName = 'Hospital General';
      component.institutionForm.get('name')?.setValue(institutionName);

      component.onAdd();

      expect(modalControllerMock.dismiss).toHaveBeenCalledWith(institutionName, 'confirm');
    });

    it('should not dismiss modal when form is invalid', () => {
      component.institutionForm.get('name')?.setValue('');

      component.onAdd();

      expect(modalControllerMock.dismiss).not.toHaveBeenCalled();
    });

    it('should not dismiss modal when name is too short', () => {
      component.institutionForm.get('name')?.setValue('ab');

      component.onAdd();

      expect(modalControllerMock.dismiss).not.toHaveBeenCalled();
    });
  });
});
