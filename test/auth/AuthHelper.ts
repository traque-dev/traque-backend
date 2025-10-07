import { INestApplication } from '@nestjs/common';
import * as request from 'supertest';
import { App } from 'supertest/types';

export class AuthHelper {
  constructor(private readonly app: INestApplication<App>) {}

  /**
   * Signs up a user through Better Auth API and returns session cookies
   */
  async signUpUser(userData: {
    email: string;
    password: string;
    name: string;
  }): Promise<string[]> {
    const response = await request(this.app.getHttpServer())
      .post('/api/auth/sign-up/email')
      .send(userData)
      .expect(200);

    const cookies = response.get('Set-Cookie');

    if (!cookies) {
      throw new Error('No cookies returned from sign up');
    }

    return cookies;
  }

  /**
   * Signs in a user through Better Auth API and returns session cookies
   */
  async signInUser(credentials: {
    email: string;
    password: string;
  }): Promise<string[]> {
    const response = await request(this.app.getHttpServer())
      .post('/api/auth/sign-in/email')
      .send(credentials)
      .expect(200);

    const cookies = response.get('Set-Cookie');
    if (!cookies) {
      throw new Error('No cookies returned from sign in');
    }

    return cookies;
  }

  /**
   * Creates a test user and returns session cookies for authentication
   */
  async createAuthenticatedUser(userData: {
    email: string;
    password: string;
    name: string;
  }): Promise<string[]> {
    return await this.signUpUser(userData);
  }

  /**
   * Extracts session token from Better Auth cookies
   */
  extractSessionToken(cookies: string[]): string | null {
    for (const cookie of cookies) {
      if (cookie.includes('better-auth.session_token=')) {
        const match = cookie.match(/better-auth\.session_token=([^;]+)/);
        return match ? match[1] : null;
      }
    }
    return null;
  }

  /**
   * Makes an authenticated request with Better Auth session cookies
   */
  makeAuthenticatedRequest(
    method: 'get' | 'post' | 'put' | 'delete',
    url: string,
    cookies: string[],
  ) {
    const req = request(this.app.getHttpServer())[method](url);

    // Set all cookies from the response
    cookies.forEach((cookie) => {
      req.set('Cookie', cookie);
    });

    return req;
  }
}
