import { HasRoleDirective } from './has-role.directive';
import { AuthService } from './auth.service';
import { Role } from './user.interface';
import { ComponentFixture, TestBed, fakeAsync, tick } from '@angular/core/testing';
import { Component } from '@angular/core';
import { of, Observable } from 'rxjs';

describe('HasRoleDirective', () => {
  @Component({
    selector: 'test-non-standalone-host',
    template: `<div *ifHasRole="expectedRoles">Protected Content</div>`,
    imports: [HasRoleDirective],
  })
  class TestNonStandaloneHostComponent {
    expectedRoles: `${Role}` | `${Role}`[] = [];
  }

  let fixture: ComponentFixture<TestNonStandaloneHostComponent>;
  let authServiceMock: { user: jest.Mock };

  function setup(userRole: Role | null) {
    const user = userRole ? { id: '1', email: 'test@example.com', role: userRole } : null;
    authServiceMock = {
      user: jest.fn().mockReturnValue(of(user)),
    };

    TestBed.configureTestingModule({
      imports: [TestNonStandaloneHostComponent],
      providers: [{ provide: AuthService, useValue: authServiceMock }],
    });
    fixture = TestBed.createComponent(TestNonStandaloneHostComponent);
  }

  afterEach(() => {
    if (fixture) fixture.destroy();
    jest.clearAllMocks();
  });

  it('should display content for authorized role', fakeAsync(() => {
    setup(Role.admin);
    fixture.componentInstance.expectedRoles = Role.admin;
    fixture.detectChanges();
    tick();
    fixture.detectChanges();
    const divElement: HTMLElement = fixture.nativeElement.querySelector('div');
    expect(divElement).toBeTruthy();
    expect(divElement.textContent).toContain('Protected Content');
  }));

  it('should not display content for unauthorized role', fakeAsync(() => {
    setup(Role.client);
    fixture.componentInstance.expectedRoles = Role.admin;
    fixture.detectChanges();
    tick();
    fixture.detectChanges();
    const divElement: HTMLElement = fixture.nativeElement.querySelector('div');
    expect(divElement).toBeNull();
  }));

  it('should display content for one of multiple authorized roles', fakeAsync(() => {
    setup(Role.vendor);
    fixture.componentInstance.expectedRoles = [Role.admin, Role.vendor];
    fixture.detectChanges();
    tick();
    fixture.detectChanges();
    const divElement: HTMLElement = fixture.nativeElement.querySelector('div');
    expect(divElement).toBeTruthy();
    expect(divElement.textContent).toContain('Protected Content');
  }));

  it('should not display content when user is unauthenticated', fakeAsync(() => {
    setup(null);
    fixture.componentInstance.expectedRoles = Role.admin;
    fixture.detectChanges();
    tick();
    fixture.detectChanges();
    const divElement: HTMLElement = fixture.nativeElement.querySelector('div');
    expect(divElement).toBeNull();
  }));
});
