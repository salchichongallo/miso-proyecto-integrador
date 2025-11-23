import { of } from 'rxjs';
import { TestBed } from '@angular/core/testing';
import { ModalController } from '@ionic/angular/standalone';
import { TranslateModule } from '@ngx-translate/core';

import { CustomersService } from '@web/services/customers/customers.service';
import { InstitutionalClient } from '@web/services/customers/institutional-client.interface';

import { AddInstitutionModalComponent } from './add-institution-modal.component';

jest.mock('@web/services/customers/customers.service');

describe('AddInstitutionModalComponent', () => {
  let component: AddInstitutionModalComponent;
  let modalControllerMock: { dismiss: jest.Mock };
  let service: jest.Mocked<CustomersService>;

  beforeEach(async () => {
    modalControllerMock = {
      dismiss: jest.fn(),
    };

    TestBed.configureTestingModule({
      providers: [
        AddInstitutionModalComponent,
        CustomersService,
        { provide: ModalController, useValue: modalControllerMock },
      ],
      imports: [TranslateModule.forRoot()],
    });

    service = TestBed.inject(CustomersService) as jest.Mocked<CustomersService>;
    service.getAll.mockReturnValue(of([]));

    component = TestBed.inject(AddInstitutionModalComponent);
  });

  it('should not have a selected institution initially', () => {
    expect(component.selectedInstitution()).toBeNull();
  });

  describe('compareWith', () => {
    it('should return true for identical institutions', () => {
      const institution1 = {
        client_id: '1',
        country: 'CO',
        level: 'A',
        location: 'Bogotá',
        name: 'Cliente 1',
        specialty: 'General',
        tax_id: '123',
        tax_id_encrypted: 'abc',
      };
      const institution2 = { ...institution1 };

      expect(component.compareWith(institution1, institution2)).toBe(true);
    });

    it('should return false for different institutions', () => {
      const institution1: InstitutionalClient = {
        client_id: '1',
        country: 'CO',
        level: 'A',
        location: 'Bogotá',
        name: 'Cliente 1',
        specialty: 'General',
        tax_id: '123',
        tax_id_encrypted: 'abc',
      };
      const institution2: InstitutionalClient = {
        client_id: '2',
        country: 'CO',
        level: 'B',
        location: 'Medellín',
        name: 'Cliente 2',
        specialty: 'Especial',
        tax_id: '456',
        tax_id_encrypted: 'def',
      };

      expect(component.compareWith(institution1, institution2)).toBe(false);
    });

    it('should handle null values correctly', () => {
      const institution: InstitutionalClient = {
        client_id: '1',
        country: 'CO',
        level: 'A',
        location: 'Bogotá',
        name: 'Cliente 1',
        specialty: 'General',
        tax_id: '123',
        tax_id_encrypted: 'abc',
      };

      expect(component.compareWith(institution, null!)).toBe(false);
      expect(component.compareWith(null!, institution)).toBe(false);
      expect(component.compareWith(null!, null!)).toBe(true);
    });
  });

  it('should update selectedInstitution when onClientChange is called', () => {
    const institution: InstitutionalClient = {
      client_id: '1',
      country: 'CO',
      level: 'A',
      location: 'Bogotá',
      name: 'Cliente 1',
      specialty: 'General',
      tax_id: '123',
      tax_id_encrypted: 'abc',
    };

    const event = {
      target: {
        value: institution,
      },
    } as unknown as Event;

    component.onClientChange(event);

    expect(component.selectedInstitution()).toEqual(institution);
  });

  it('should dismiss modal with null on onCancel', () => {
    component.onCancel();

    expect(modalControllerMock.dismiss).toHaveBeenCalledWith(null, 'cancel');
  });

  it('should dismiss modal with selected institution on onSubmit', () => {
    const institution: InstitutionalClient = {
      client_id: '1',
      country: 'CO',
      level: 'A',
      location: 'Bogotá',
      name: 'Cliente 1',
      specialty: 'General',
      tax_id: '123',
      tax_id_encrypted: 'abc',
    };
    component.selectedInstitution.set(institution);

    const event = {
      preventDefault: jest.fn(),
    } as unknown as Event;

    component.onSubmit(event);

    expect(event.preventDefault).toHaveBeenCalled();
    expect(modalControllerMock.dismiss).toHaveBeenCalledWith(institution, 'confirm');
  });
});
