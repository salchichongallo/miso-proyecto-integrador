import { TestBed } from '@angular/core/testing';
import { FilePicker, PickedFile, PickMediaResult, PermissionStatus } from '@capawesome/capacitor-file-picker';
import { MediaPickerService, MediaFile } from './media-picker.service';

// Mock FilePicker
jest.mock('@capawesome/capacitor-file-picker', () => ({
  FilePicker: {
    checkPermissions: jest.fn(),
    requestPermissions: jest.fn(),
    pickMedia: jest.fn(),
  },
}));

describe('MediaPickerService', () => {
  let service: MediaPickerService;
  let mockFilePicker: jest.Mocked<typeof FilePicker>;

  const mockPickedFile = {
    path: '/storage/emulated/0/DCIM/Camera/IMG_20240115_123456.jpg',
    name: 'IMG_20240115_123456.jpg',
    mimeType: 'image/jpeg',
    size: 2048576,
    width: 1920,
    height: 1080,
    modifiedAt: Date.now(),
  } as PickedFile;

  const mockVideoFile = {
    path: '/storage/emulated/0/DCIM/Camera/VID_20240115_123456.mp4',
    name: 'VID_20240115_123456.mp4',
    mimeType: 'video/mp4',
    size: 10485760,
    width: 1920,
    height: 1080,
    duration: 30,
    modifiedAt: Date.now(),
  } as PickedFile;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [MediaPickerService],
    });
    service = TestBed.inject(MediaPickerService);
    mockFilePicker = FilePicker as jest.Mocked<typeof FilePicker>;

    // Reset mocks before each test
    jest.clearAllMocks();
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  describe('checkPermissions', () => {
    it('should return granted true when permissions are granted', async () => {
      const mockStatus: PermissionStatus = {
        readExternalStorage: 'granted',
        accessMediaLocation: 'granted',
      };
      mockFilePicker.checkPermissions.mockResolvedValue(mockStatus);

      const result = await service.checkPermissions();

      expect(result.granted).toBeTruthy();
      expect(result.message).toBeUndefined();
      expect(mockFilePicker.checkPermissions).toHaveBeenCalled();
    });

    it('should return granted false when permissions are denied', async () => {
      const mockStatus: PermissionStatus = {
        readExternalStorage: 'denied',
        accessMediaLocation: 'denied',
      };
      mockFilePicker.checkPermissions.mockResolvedValue(mockStatus);

      const result = await service.checkPermissions();

      expect(result.granted).toBeFalsy();
      expect(result.message).toBe('Storage permission not granted');
    });

    it('should handle errors when checking permissions', async () => {
      mockFilePicker.checkPermissions.mockRejectedValue(new Error('Permission check failed'));

      const result = await service.checkPermissions();

      expect(result.granted).toBeFalsy();
      expect(result.message).toBe('Permission check failed');
    });
  });

  describe('requestPermissions', () => {
    it('should return granted false when user denies permissions', async () => {
      const mockStatus: PermissionStatus = {
        readExternalStorage: 'denied',
        accessMediaLocation: 'denied',
      };
      mockFilePicker.requestPermissions.mockResolvedValue(mockStatus);

      const result = await service.requestPermissions();

      expect(result.granted).toBeFalsy();
      expect(result.message).toBe('Permission check failed');
    });

    it('should handle errors when requesting permissions', async () => {
      mockFilePicker.requestPermissions.mockRejectedValue(new Error('Permission request failed'));

      const result = await service.requestPermissions();

      expect(result.granted).toBeFalsy();
      expect(result.message).toBe('Permission check failed');
    });
  });

  describe('pickMedia', () => {
    beforeEach(() => {
      // Mock permissions as granted
      const mockStatus: PermissionStatus = {
        readExternalStorage: 'granted',
        accessMediaLocation: 'granted',
      };
      mockFilePicker.checkPermissions.mockResolvedValue(mockStatus);
    });

    it('should pick multiple media files when multiple is true', async () => {
      const mockResult: PickMediaResult = {
        files: [mockPickedFile, mockVideoFile],
      };
      mockFilePicker.pickMedia.mockResolvedValue(mockResult);

      const result = await service.pickMedia(true);

      expect(result).toHaveLength(2);
      expect(result[0].name).toBe('IMG_20240115_123456.jpg');
      expect(result[1].name).toBe('VID_20240115_123456.mp4');
      expect(mockFilePicker.pickMedia).toHaveBeenCalledWith({ limit: 0 });
    });

    it('should pick single media file when multiple is false', async () => {
      const mockResult: PickMediaResult = {
        files: [mockPickedFile],
      };
      mockFilePicker.pickMedia.mockResolvedValue(mockResult);

      const result = await service.pickMedia(false);

      expect(result).toHaveLength(1);
      expect(result[0].name).toBe('IMG_20240115_123456.jpg');
      expect(mockFilePicker.pickMedia).toHaveBeenCalledWith({ limit: 1 });
    });

    it('should return empty array when user cancels picker', async () => {
      mockFilePicker.pickMedia.mockRejectedValue(new Error('User cancelled'));

      const result = await service.pickMedia();

      expect(result).toHaveLength(0);
    });

    it('should throw error when permissions are not granted', async () => {
      const mockStatus: PermissionStatus = {
        readExternalStorage: 'denied',
        accessMediaLocation: 'denied',
      };
      mockFilePicker.checkPermissions.mockResolvedValue(mockStatus);
      mockFilePicker.requestPermissions.mockResolvedValue(mockStatus);

      await expect(service.pickMedia()).rejects.toThrow('Storage permission not granted');
    });
  });

  describe('getFilePreview', () => {
    it('should return webPath for file preview', () => {
      const webPath = 'file:///storage/emulated/0/DCIM/Camera/IMG_20240115_123456.jpg';
      const mediaFile: MediaFile = {
        path: mockPickedFile.path || '',
        webPath,
        name: mockPickedFile.name,
        mimeType: mockPickedFile.mimeType,
        size: mockPickedFile.size,
        modifiedAt: mockPickedFile.modifiedAt,
      };

      const preview = service.getFilePreview(mediaFile);

      expect(preview).toBe(webPath);
    });
  });

  describe('formatFileSize', () => {
    it('should format 0 bytes correctly', () => {
      expect(service.formatFileSize(0)).toBe('0 Bytes');
    });

    it('should format bytes correctly', () => {
      expect(service.formatFileSize(500)).toBe('500 Bytes');
    });

    it('should format kilobytes correctly', () => {
      expect(service.formatFileSize(1024)).toBe('1 KB');
    });

    it('should format megabytes correctly', () => {
      expect(service.formatFileSize(2097152)).toBe('2 MB'); // 2 * 1024 * 1024 = 2097152
    });

    it('should format gigabytes correctly', () => {
      expect(service.formatFileSize(10737418240)).toBe('10 GB');
    });

    it('should format decimal values correctly', () => {
      expect(service.formatFileSize(1536)).toBe('1.5 KB');
    });
  });

  describe('isImage', () => {
    it('should return true for image MIME types', () => {
      const imageFile: MediaFile = {
        path: '',
        webPath: '',
        name: 'test.jpg',
        mimeType: 'image/jpeg',
        size: 0,
        modifiedAt: Date.now(),
      };

      expect(service.isImage(imageFile)).toBeTruthy();
    });

    it('should return false for video MIME types', () => {
      const videoFile: MediaFile = {
        path: '',
        webPath: '',
        name: 'test.mp4',
        mimeType: 'video/mp4',
        size: 0,
        modifiedAt: Date.now(),
      };

      expect(service.isImage(videoFile)).toBeFalsy();
    });
  });

  describe('isVideo', () => {
    it('should return true for video MIME types', () => {
      const videoFile: MediaFile = {
        path: '',
        webPath: '',
        name: 'test.mp4',
        mimeType: 'video/mp4',
        size: 0,
        modifiedAt: Date.now(),
      };

      expect(service.isVideo(videoFile)).toBeTruthy();
    });

    it('should return false for image MIME types', () => {
      const imageFile: MediaFile = {
        path: '',
        webPath: '',
        name: 'test.jpg',
        mimeType: 'image/jpeg',
        size: 0,
        modifiedAt: Date.now(),
      };

      expect(service.isVideo(imageFile)).toBeFalsy();
    });
  });
});
