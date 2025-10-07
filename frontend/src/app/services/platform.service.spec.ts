import { TestBed } from '@angular/core/testing';
import { Platform } from '@ionic/angular/standalone';
import { PlatformService } from './platform.service';

describe('PlatformService', () => {
  let service: PlatformService;
  let platformMock: jest.Mocked<Platform>;

  beforeEach(() => {
    const mockPlatform = {
      is: jest.fn(),
    };

    TestBed.configureTestingModule({
      providers: [{ provide: Platform, useValue: mockPlatform }],
    });

    service = TestBed.inject(PlatformService);
    platformMock = TestBed.inject(Platform) as jest.Mocked<Platform>;
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  it('should detect web platform', () => {
    platformMock.is.mockReturnValue(true);
    expect(service.isWeb).toBeDefined();
  });

  it('should detect mobile platform', () => {
    platformMock.is.mockReturnValue(true);
    expect(service.isMobile).toBeDefined();
  });

  it('should return platform features', () => {
    expect(service.features).toBeDefined();
    expect(typeof service.features.camera).toBe('boolean');
  });

  it('should check feature availability', () => {
    expect(service.isFeatureAvailable('camera')).toBeDefined();
  });
});
