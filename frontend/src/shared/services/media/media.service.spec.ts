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
});
