import { Directive, inject, Input, OnDestroy, TemplateRef, ViewContainerRef } from '@angular/core';
import { Role } from './user.interface';
import { AuthService } from './auth.service';

type RoleLiteral = `${Role}`;

@Directive({ selector: '[ifHasRole]' })
export class HasRoleDirective implements OnDestroy {
  private currentRole?: RoleLiteral;
  private expectedRoles: RoleLiteral[] = [];

  private readonly templateRef = inject(TemplateRef);
  private readonly authService = inject(AuthService);
  private readonly viewContainer = inject(ViewContainerRef);

  private subscription = this.authService.user().subscribe((user) => {
    this.currentRole = user?.role;
    this.updateView();
  });

  @Input()
  set ifHasRole(roles: RoleLiteral | RoleLiteral[]) {
    this.expectedRoles = Array.isArray(roles) ? roles : [roles];
    this.updateView();
  }

  private updateView() {
    this.viewContainer.clear();
    if (this.currentRole && this.expectedRoles.includes(this.currentRole)) {
      this.viewContainer.createEmbeddedView(this.templateRef);
    }
  }

  ngOnDestroy() {
    this.subscription.unsubscribe();
  }
}
