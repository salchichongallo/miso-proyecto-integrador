import { TestBed } from '@angular/core/testing';
import { uploadData } from 'aws-amplify/storage';
import { MediaService } from './media.service';

jest.mock('aws-amplify/storage', () => ({
  uploadData: jest.fn().mockReturnValue({
    result: Promise.resolve({ path: '' }),
  }),
}));

const mockUploadData = uploadData as jest.MockedFunction<typeof uploadData>;

describe('MediaService', () => {
  let service: MediaService;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [MediaService],
    });
    service = TestBed.inject(MediaService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  describe('upload', () => {
    it('should upload file and return path', async () => {
      const file = new File(['file content'], 'test-file.txt', { type: 'text/plain' });
      const expectedPath = 'media/uuid-test-file.txt';
      mockUploadData.mockReturnValueOnce({
        result: Promise.resolve({ path: expectedPath }),
      } as any);
      const result = await service.upload(file);
      expect(mockUploadData).toHaveBeenCalledWith(
        expect.objectContaining({
          data: file,
        }),
      );
      expect(result).toEqual({ path: expectedPath });
    });
  });
});
