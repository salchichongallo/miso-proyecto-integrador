import { Router } from '@angular/router';
import { TestBed, ComponentFixture } from '@angular/core/testing';
import { Platform } from '@ionic/angular/standalone';
import { Keyboard } from '@capacitor/keyboard';

import { LoginTemplate } from './login.template';

jest.mock('@capacitor/keyboard');

describe('LoginTemplate', () => {
  let component: LoginTemplate;
  let fixture: ComponentFixture<LoginTemplate>;
  let router: jest.Mocked<Router>;
  let platform: jest.Mocked<Platform>;

  beforeEach(async () => {
    const mockRouter = {
      navigate: jest.fn().mockResolvedValue(true),
    };

    const mockPlatform = {
      is: jest.fn().mockReturnValue(false),
    };

    await TestBed.configureTestingModule({
      imports: [LoginTemplate],
      providers: [
        { provide: Router, useValue: mockRouter },
        { provide: Platform, useValue: mockPlatform },
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(LoginTemplate);
    component = fixture.componentInstance;
    router = TestBed.inject(Router) as jest.Mocked<Router>;
    platform = TestBed.inject(Platform) as jest.Mocked<Platform>;

    // Mock Keyboard methods
    (Keyboard.addListener as jest.Mock) = jest.fn().mockResolvedValue({ remove: jest.fn() });
    (Keyboard.removeAllListeners as jest.Mock) = jest.fn().mockResolvedValue(undefined);

    fixture.detectChanges();
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('Component Initialization', () => {
    it('should create the component', () => {
      expect(component).toBeTruthy();
    });

    it('should initialize with keyboard hidden state', () => {
      expect(component['keyboardVisible']).toBe(false);
      expect(component['keyboardHeight']).toBe(0);
    });

    it('should have Router injected', () => {
      expect(component['router']).toBe(router);
    });

    it('should have Platform injected', () => {
      expect(component['platform']).toBe(platform);
    });
  });

  describe('ngOnInit', () => {
    it('should call listenMobileKeyboardEvents', async () => {
      const spy = jest.spyOn(component as any, 'listenMobileKeyboardEvents');

      await component.ngOnInit();

      expect(spy).toHaveBeenCalled();
    });

    it('should not add keyboard listeners when not on capacitor platform', async () => {
      platform.is.mockReturnValue(false);

      await component.ngOnInit();

      expect(Keyboard.addListener).not.toHaveBeenCalled();
    });

    it('should add keyboard listeners when on capacitor platform', async () => {
      platform.is.mockReturnValue(true);

      await component.ngOnInit();

      expect(Keyboard.addListener).toHaveBeenCalledWith('keyboardWillShow', expect.any(Function));
      expect(Keyboard.addListener).toHaveBeenCalledWith('keyboardWillHide', expect.any(Function));
    });
  });

  describe('Keyboard Events', () => {
    beforeEach(() => {
      platform.is.mockReturnValue(true);
    });

    it('should set keyboardVisible to true and update height when keyboard shows', async () => {
      let keyboardWillShowCallback: any;

      (Keyboard.addListener as jest.Mock).mockImplementation((event: string, callback: any) => {
        if (event === 'keyboardWillShow') {
          keyboardWillShowCallback = callback;
        }
        return Promise.resolve({ remove: jest.fn() });
      });

      await component.ngOnInit();

      // Simulate keyboard show event
      keyboardWillShowCallback({ keyboardHeight: 300 });

      expect(component['keyboardVisible']).toBe(true);
      expect(component['keyboardHeight']).toBe(300);
    });

    it('should set keyboardVisible to false and reset height when keyboard hides', async () => {
      let keyboardWillHideCallback: any;

      (Keyboard.addListener as jest.Mock).mockImplementation((event: string, callback: any) => {
        if (event === 'keyboardWillHide') {
          keyboardWillHideCallback = callback;
        }
        return Promise.resolve({ remove: jest.fn() });
      });

      await component.ngOnInit();

      // First show keyboard
      component['keyboardVisible'] = true;
      component['keyboardHeight'] = 300;

      // Then simulate keyboard hide event
      keyboardWillHideCallback();

      expect(component['keyboardVisible']).toBe(false);
      expect(component['keyboardHeight']).toBe(0);
    });

    it('should handle different keyboard heights', async () => {
      let keyboardWillShowCallback: any;

      (Keyboard.addListener as jest.Mock).mockImplementation((event: string, callback: any) => {
        if (event === 'keyboardWillShow') {
          keyboardWillShowCallback = callback;
        }
        return Promise.resolve({ remove: jest.fn() });
      });

      await component.ngOnInit();

      // Test with different heights
      keyboardWillShowCallback({ keyboardHeight: 250 });
      expect(component['keyboardHeight']).toBe(250);

      keyboardWillShowCallback({ keyboardHeight: 400 });
      expect(component['keyboardHeight']).toBe(400);
    });
  });

  describe('redirectToDashboard', () => {
    it('should navigate to dashboard', async () => {
      await component.redirectToDashboard();

      expect(router.navigate).toHaveBeenCalledWith(['/']);
    });

    it('should navigate to root path', async () => {
      await component.redirectToDashboard();

      expect(router.navigate).toHaveBeenCalledTimes(1);
      expect(router.navigate).toHaveBeenCalledWith(['/']);
    });
  });

  describe('ngOnDestroy', () => {
    it('should remove all keyboard listeners when on capacitor platform', async () => {
      platform.is.mockReturnValue(true);

      await component.ngOnDestroy();

      expect(Keyboard.removeAllListeners).toHaveBeenCalled();
    });

    it('should not remove keyboard listeners when not on capacitor platform', async () => {
      platform.is.mockReturnValue(false);

      await component.ngOnDestroy();

      expect(Keyboard.removeAllListeners).not.toHaveBeenCalled();
    });
  });

  describe('Platform Detection', () => {
    it('should check if running on capacitor platform during init', async () => {
      await component.ngOnInit();

      expect(platform.is).toHaveBeenCalledWith('capacitor');
    });

    it('should check if running on capacitor platform during destroy', async () => {
      await component.ngOnDestroy();

      expect(platform.is).toHaveBeenCalledWith('capacitor');
    });
  });

  describe('Keyboard State Management', () => {
    it('should maintain keyboard state through show/hide cycles', async () => {
      platform.is.mockReturnValue(true);

      let showCallback: any;
      let hideCallback: any;

      (Keyboard.addListener as jest.Mock).mockImplementation((event: string, callback: any) => {
        if (event === 'keyboardWillShow') showCallback = callback;
        if (event === 'keyboardWillHide') hideCallback = callback;
        return Promise.resolve({ remove: jest.fn() });
      });

      await component.ngOnInit();

      // Initial state
      expect(component['keyboardVisible']).toBe(false);
      expect(component['keyboardHeight']).toBe(0);

      // Show keyboard
      showCallback({ keyboardHeight: 300 });
      expect(component['keyboardVisible']).toBe(true);
      expect(component['keyboardHeight']).toBe(300);

      // Hide keyboard
      hideCallback();
      expect(component['keyboardVisible']).toBe(false);
      expect(component['keyboardHeight']).toBe(0);

      // Show keyboard again with different height
      showCallback({ keyboardHeight: 350 });
      expect(component['keyboardVisible']).toBe(true);
      expect(component['keyboardHeight']).toBe(350);
    });
  });
});
