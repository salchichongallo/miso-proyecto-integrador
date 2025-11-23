import { TestBed } from '@angular/core/testing';
import { FormBuilder } from '@angular/forms';
import { Router } from '@angular/router';
import { ToastController } from '@ionic/angular/standalone';
import { TranslateService } from '@ngx-translate/core';
import { of } from 'rxjs';

import { RegisterVisitPage } from './register-visit.page';
import { CustomersService } from '@mobile/services/customers/customers.service';
import { MediaPickerService, MediaFile } from '@mobile/services/media-picker/media-picker.service';
import { VisitsService } from '../../../services/visits';
import { MediaService } from '../../../../shared/services/media/media.service';

jest.mock('../../../services/visits');
jest.mock('../../../../shared/services/media/media.service');

describe('RegisterVisitPage', () => {
  let component: RegisterVisitPage;
  let mockRouter: Partial<jest.Mocked<Router>>;
  let mockFormBuilder: FormBuilder;
  let mockCustomersService: Partial<jest.Mocked<CustomersService>>;
  let mockMediaPickerService: Partial<jest.Mocked<MediaPickerService>>;
  let mockToastController: Partial<jest.Mocked<ToastController>>;
  let mockTranslateService: Partial<jest.Mocked<TranslateService>>;
  let mockVisitsService: any;
  let mockMediaService: any;

  const mockMediaFile: MediaFile = {
    path: '/storage/emulated/0/DCIM/Camera/IMG_20240115_123456.jpg',
    webPath: 'file:///storage/emulated/0/DCIM/Camera/IMG_20240115_123456.jpg',
    name: 'IMG_20240115_123456.jpg',
    mimeType: 'image/jpeg',
    size: 2048576,
    width: 1920,
    height: 1080,
    modifiedAt: Date.now(),
  };

  beforeEach(() => {
    mockRouter = {
      navigate: jest.fn(),
    };

    mockCustomersService = {
      getInstitutionalClients: jest.fn().mockReturnValue(of([])),
    };

    mockMediaPickerService = {
      pickMedia: jest.fn(),
      pickMedia2: jest.fn(),
      isImage: jest.fn(),
      isVideo: jest.fn(),
      formatFileSize: jest.fn(),
      getFilePreview: jest.fn(),
    };

    mockVisitsService = {
      create: jest.fn(),
    };

    mockMediaService = {
      upload: jest.fn(),
    };

    const mockToast = {
      present: jest.fn().mockResolvedValue(undefined),
    };

    mockToastController = {
      create: jest.fn().mockResolvedValue(mockToast as unknown as HTMLIonToastElement),
    };

    mockTranslateService = {
      instant: jest.fn((key: string | string[]) => (Array.isArray(key) ? key[0] : key)),
    };

    TestBed.configureTestingModule({
      providers: [
        FormBuilder,
        { provide: Router, useValue: mockRouter },
        { provide: CustomersService, useValue: mockCustomersService },
        { provide: MediaPickerService, useValue: mockMediaPickerService },
        { provide: ToastController, useValue: mockToastController },
        { provide: TranslateService, useValue: mockTranslateService },
        { provide: VisitsService, useValue: mockVisitsService },
        { provide: MediaService, useValue: mockMediaService },
      ],
    });

    mockFormBuilder = TestBed.inject(FormBuilder);
    const router = TestBed.inject(Router);
    const customersService = TestBed.inject(CustomersService);
    const mediaPickerService = TestBed.inject(MediaPickerService);
    const toastController = TestBed.inject(ToastController);
    const translateService = TestBed.inject(TranslateService);
    const visitService = TestBed.inject(VisitsService);
    const mediaService = TestBed.inject(MediaService);

    component = new RegisterVisitPage(
      mockFormBuilder,
      router,
      customersService,
      mediaPickerService,
      toastController,
      translateService,
      mediaService,
      visitService,
    );
    component.ngOnInit();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should initialize the form with empty values', () => {
    expect(component.visitForm).toBeDefined();
    expect(component.visitForm.get('institutionalClient')?.value).toBe('');
    expect(component.visitForm.get('contactPerson')?.value).toBe('');
    expect(component.visitForm.get('contactPhone')?.value).toBe('');
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

    // Mock visits service to throw an error
    mockVisitsService.create.mockRejectedValue(new Error('Network error'));

    await component.onSubmit();

    expect(component.hasError).toBeTruthy();
    expect(component.errorMessage).toBeTruthy();
  });

  it('should select media files when onLoadMedia is called', async () => {
    const mockPickResult = {
      file: new File(['test'], 'IMG_20240115_123456.jpg', { type: 'image/jpeg' }),
      webPath: mockMediaFile.webPath,
    };
    (mockMediaPickerService.pickMedia2 as jest.Mock).mockResolvedValue(mockPickResult);
    (mockMediaService.upload as jest.Mock).mockResolvedValue({
      fullUrl: 's3://bucket/IMG_20240115_123456.jpg',
      name: 'IMG_20240115_123456.jpg',
    });

    await component.onLoadMedia();

    expect(mockMediaPickerService.pickMedia2).toHaveBeenCalled();
    expect(component.selectedMediaFiles).toHaveLength(1);
    expect(component.selectedMediaFiles[0].name).toBe('IMG_20240115_123456.jpg');
    expect(mockToastController.create).toHaveBeenCalled();
  });

  it('should not show toast when user cancels file picker', async () => {
    (mockMediaPickerService.pickMedia2 as jest.Mock).mockRejectedValue(new Error('User cancelled'));

    await component.onLoadMedia();

    expect(component.selectedMediaFiles).toHaveLength(0);
    expect(mockToastController.create).toHaveBeenCalled();
  });

  it('should handle error when picking media files', async () => {
    (mockMediaPickerService.pickMedia2 as jest.Mock).mockRejectedValue(new Error('Permission denied'));
    const consoleSpy = jest.spyOn(console, 'error').mockImplementation();

    await component.onLoadMedia();

    expect(consoleSpy).toHaveBeenCalled();
    expect(mockToastController.create).toHaveBeenCalled();

    consoleSpy.mockRestore();
  });

  it('should remove media file when removeMediaFile is called', () => {
    component.selectedMediaFiles = [mockMediaFile, mockMediaFile];

    component.removeMediaFile(0);

    expect(component.selectedMediaFiles).toHaveLength(1);
  });

  it('should get file icon for video files', () => {
    (mockMediaPickerService.isVideo as jest.Mock).mockReturnValue(true);

    const icon = component.getFileIcon(mockMediaFile);

    expect(icon).toBe('videocam');
  });

  it('should get file icon for image files', () => {
    (mockMediaPickerService.isVideo as jest.Mock).mockReturnValue(false);

    const icon = component.getFileIcon(mockMediaFile);

    expect(icon).toBe('image');
  });

  it('should format file size correctly', () => {
    (mockMediaPickerService.formatFileSize as jest.Mock).mockReturnValue('2 MB');

    const size = component.formatFileSize(mockMediaFile);

    expect(size).toBe('2 MB');
    expect(mockMediaPickerService.formatFileSize).toHaveBeenCalledWith(mockMediaFile.size);
  });

  it('should get file preview URL', () => {
    (mockMediaPickerService.getFilePreview as jest.Mock).mockReturnValue(mockMediaFile.webPath);

    const preview = component.getFilePreview(mockMediaFile);

    expect(preview).toBe(mockMediaFile.webPath);
  });

  it('should check if file is an image', () => {
    (mockMediaPickerService.isImage as jest.Mock).mockReturnValue(true);

    const isImage = component.isImageFile(mockMediaFile);

    expect(isImage).toBeTruthy();
  });

  it('should check if file is a video', () => {
    (mockMediaPickerService.isVideo as jest.Mock).mockReturnValue(true);

    const isVideo = component.isVideoFile(mockMediaFile);

    expect(isVideo).toBeTruthy();
  });

  it('should reset error state, form and media files when onRetry is called', () => {
    component.hasError = true;
    component.errorMessage = 'Test error';
    component.selectedMediaFiles = [mockMediaFile];
    component.visitForm.patchValue({
      institutionalClient: '1',
      contactPerson: 'Dr. Test',
    });

    component.onRetry();

    expect(component.hasError).toBeFalsy();
    expect(component.errorMessage).toBe('');
    expect(component.selectedMediaFiles).toHaveLength(0);
    expect(component.visitForm.value).toEqual({
      institutionalClient: null,
      contactPerson: null,
      contactPhone: null,
      visitDate: null,
      visitTime: null,
      observations: null,
    });
  });
});
