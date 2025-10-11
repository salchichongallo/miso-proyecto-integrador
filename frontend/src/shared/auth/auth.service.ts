import { Hub } from 'aws-amplify/utils';
import { Injectable } from '@angular/core';
import { BehaviorSubject, map } from 'rxjs';
import { signIn, signOut, fetchAuthSession } from 'aws-amplify/auth';

import { configureAmplifyAuth } from './configure-amplify-auth';

export interface User {
  id: string;
  email: string;
  role: string;
}

@Injectable({ providedIn: 'root' })
export class AuthService {
  private readonly userSubject = new BehaviorSubject<User | null>(null);

  private readonly accessTokenSubject = new BehaviorSubject<string | null>(null);

  async init() {
    configureAmplifyAuth();
    await this.checkAuthState();
    return this.listenAuthChanges();
  }

  private async checkAuthState() {
    try {
      const session = await fetchAuthSession();
      this.accessTokenSubject.next(session.tokens?.accessToken?.toString() || null);

      const payload = JSON.parse(atob(session.tokens!.idToken!.toString().split('.')[1]));
      const user: User = {
        id: payload.sub,
        email: payload.email,
        role: payload['custom:role'],
      };
      this.userSubject.next(user);
    } catch {
      this.clearAuthState();
    }
  }

  private clearAuthState() {
    this.userSubject.next(null);
    this.accessTokenSubject.next(null);
  }

  private listenAuthChanges() {
    return Hub.listen('auth', ({ payload }) => {
      const { event } = payload;
      if (event === 'signedIn') {
        this.checkAuthState();
      } else if (event === 'signedOut') {
        this.clearAuthState();
      }
    });
  }

  async login(email: string, password: string) {
    try {
      const { nextStep } = await signIn({ username: email, password });
      if (nextStep.signInStep !== 'DONE') {
        throw new Error('Sign-in not completed.');
      }
      await this.checkAuthState();
    } catch (error) {
      console.error('Error during login:', error);
      throw error;
    }
  }

  async logout() {
    try {
      await signOut();
      this.clearAuthState();
    } catch (error) {
      console.error('Error during logout:', error);
      throw error;
    }
  }

  isAuthenticated() {
    return this.userSubject.asObservable().pipe(map((user) => !!user));
  }

  user() {
    return this.userSubject.asObservable();
  }

  accessToken() {
    return this.accessTokenSubject.value;
  }
}
