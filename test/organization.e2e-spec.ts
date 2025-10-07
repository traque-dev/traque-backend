import { INestApplication } from '@nestjs/common';
import { getRepositoryToken } from '@nestjs/typeorm';
import * as request from 'supertest';
import { App } from 'supertest/types';
import { Repository } from 'typeorm';

import { AuthHelper } from './auth/AuthHelper';
import { initNestTestApp } from './utils/initNestTestApp';
import { Account } from '../src/models/entity/Account.entity';
import { Member } from '../src/models/entity/Member.entity';
import { Organization } from '../src/models/entity/Organization.entity';
import { PushNotificationToken } from '../src/models/entity/PushNotificationToken.entity';
import { Session } from '../src/models/entity/Session.entity';
import { User } from '../src/models/entity/User.entity';

describe('OrganizationController (e2e)', () => {
  let app: INestApplication<App>;
  let authHelper: AuthHelper;

  let userRepository: Repository<User>;
  let organizationRepository: Repository<Organization>;
  let memberRepository: Repository<Member>;
  let sessionRepository: Repository<Session>;
  let accountRepository: Repository<Account>;
  let pushNotificationTokenRepository: Repository<PushNotificationToken>;

  let testUser: User;
  let testUser2: User;
  let testOrganization: Organization;
  let testOrganization2: Organization;
  let user1Cookies: string[];
  let user2Cookies: string[];

  beforeAll(async () => {
    const { app: testApp, moduleFixture } = await initNestTestApp();

    app = testApp;
    authHelper = new AuthHelper(app);

    userRepository = moduleFixture.get<Repository<User>>(
      getRepositoryToken(User),
    );
    organizationRepository = moduleFixture.get<Repository<Organization>>(
      getRepositoryToken(Organization),
    );
    memberRepository = moduleFixture.get<Repository<Member>>(
      getRepositoryToken(Member),
    );
    sessionRepository = moduleFixture.get<Repository<Session>>(
      getRepositoryToken(Session),
    );
    accountRepository = moduleFixture.get<Repository<Account>>(
      getRepositoryToken(Account),
    );
    pushNotificationTokenRepository = moduleFixture.get<
      Repository<PushNotificationToken>
    >(getRepositoryToken(PushNotificationToken));
  });

  beforeEach(async () => {
    // Clear all data in correct order to respect foreign key constraints
    try {
      await memberRepository.delete({});
      await pushNotificationTokenRepository.delete({});
      await sessionRepository.delete({});
      await accountRepository.delete({});
      await userRepository.delete({});
      await organizationRepository.delete({});
    } catch (error) {
      console.log('Delete failed:', error.message);
    }

    // Create and authenticate users through Better Auth
    user1Cookies = await authHelper.createAuthenticatedUser({
      name: 'Test User',
      email: 'test@example.com',
      password: 'TestPassword123!',
    });

    user2Cookies = await authHelper.createAuthenticatedUser({
      name: 'Test User 2',
      email: 'test2@example.com',
      password: 'TestPassword123!',
    });

    // Get the created users from database
    const foundUser = await userRepository.findOne({
      where: { email: 'test@example.com' },
    });

    const foundUser2 = await userRepository.findOne({
      where: { email: 'test2@example.com' },
    });

    if (!foundUser || !foundUser2) {
      throw new Error('Failed to create test users');
    }

    testUser = foundUser;
    testUser2 = foundUser2;

    // Create test organizations
    const org1 = organizationRepository.create({
      name: 'Test Organization',
      slug: 'test-org',
      logo: '',
      metadata: '{"key": "value"}',
    });
    testOrganization = await organizationRepository.save(org1);

    const org2 = organizationRepository.create({
      name: 'Test Organization 2',
      slug: 'test-org-2',
      logo: '',
      metadata: '',
    });
    testOrganization2 = await organizationRepository.save(org2);

    // Make testUser a member of testOrganization
    await memberRepository.save({
      user: testUser,
      organization: testOrganization,
      role: 'member',
    });

    // Make testUser2 a member of testOrganization2
    await memberRepository.save({
      user: testUser2,
      organization: testOrganization2,
      role: 'member',
    });
  });

  afterAll(async () => {
    await memberRepository.delete({});
    await pushNotificationTokenRepository.delete({});
    await sessionRepository.delete({});
    await accountRepository.delete({});
    await userRepository.delete({});
    await organizationRepository.delete({});

    await app.close();
  });

  describe('Authentication and Authorization', () => {
    it('should return 403 when no authentication token is provided for GET /v1/organizations', () => {
      return request(app.getHttpServer())
        .get('/api/v1/organizations')
        .expect(403);
    });

    it('should return 403 when no authentication token is provided for GET /v1/organizations/:id', () => {
      return request(app.getHttpServer())
        .get(`/api/v1/organizations/${testOrganization.id}`)
        .expect(403);
    });

    it('should return 403 when invalid session token is provided for GET /v1/organizations', () => {
      return request(app.getHttpServer())
        .get('/api/v1/organizations')
        .set('Cookie', 'better-auth.session_token=invalid-token')
        .expect(403);
    });

    it('should return 403 when invalid session token is provided for GET /v1/organizations/:id', () => {
      return request(app.getHttpServer())
        .get(`/api/v1/organizations/${testOrganization.id}`)
        .set('Cookie', 'better-auth.session_token=invalid-token')
        .expect(403);
    });

    it('should return 403 when expired session token is provided', async () => {
      // Create an expired session manually for this specific test
      const expiredSession = await sessionRepository.save({
        user: testUser,
        expiresAt: new Date(Date.now() - 24 * 60 * 60 * 1000), // 24 hours ago
        ipAddress: '127.0.0.1',
        userAgent: 'test-agent',
        token: 'expired-session-token',
      });

      return request(app.getHttpServer())
        .get('/api/v1/organizations')
        .set('Cookie', `better-auth.session_token=${expiredSession.token}`)
        .expect(403);
    });
  });

  describe('Organization Access Control', () => {
    it('should return 403 when user tries to access organization they are not a member of', async () => {
      // Use testUser2 who is not a member of testOrganization

      return authHelper
        .makeAuthenticatedRequest(
          'get',
          `/api/v1/organizations/${testOrganization.id}`,
          user2Cookies,
        )
        .expect(403)
        .expect((res) => {
          expect(res.body.error.message).toBe(
            "You don't have an access to this organization or this organization doesn't exist",
          );
        });
    });

    it('should return 403 when organization does not exist', async () => {
      const nonExistentOrgId = '604c0032-9556-4cf0-8fd2-b7c43cfedf04';

      return authHelper
        .makeAuthenticatedRequest(
          'get',
          `/api/v1/organizations/${nonExistentOrgId}`,
          user1Cookies,
        )
        .expect(403)
        .expect((res) => {
          expect(res.body.error.message).toBe(
            "You don't have an access to this organization or this organization doesn't exist",
          );
        });
    });

    it('should return 400 when user tries to access organization with malformed ID', async () => {
      return authHelper
        .makeAuthenticatedRequest(
          'get',
          '/api/v1/organizations/malformed-id',
          user1Cookies,
        )
        .expect(400);
    });

    it('should return 400 when user tries to access organization with very long ID', async () => {
      const longId = 'a'.repeat(1000);
      return authHelper
        .makeAuthenticatedRequest(
          'get',
          `/api/v1/organizations/${longId}`,
          user1Cookies,
        )
        .expect(400);
    });

    it('should return 400 when user tries to access organization with special characters in ID', async () => {
      return authHelper
        .makeAuthenticatedRequest(
          'get',
          '/api/v1/organizations/org-id-with-special-chars!@#$%^&*()',
          user1Cookies,
        )
        .expect(400);
    });
  });

  describe('Valid Organization Access', () => {
    it('should allow user to access their organization when they are a member', async () => {
      return authHelper
        .makeAuthenticatedRequest(
          'get',
          `/api/v1/organizations/${testOrganization.id}`,
          user1Cookies,
        )
        .expect(200)
        .expect((res) => {
          expect(res.body).toHaveProperty('id', testOrganization.id);
          expect(res.body).toHaveProperty('name', 'Test Organization');
          expect(res.body).toHaveProperty('slug', 'test-org');
          expect(res.body).toHaveProperty('logo', '');
          expect(res.body).toHaveProperty('metadata', '{"key": "value"}');
        });
    });

    it('should allow user to access organization with empty fields', async () => {
      return authHelper
        .makeAuthenticatedRequest(
          'get',
          `/api/v1/organizations/${testOrganization2.id}`,
          user2Cookies,
        )
        .expect(200)
        .expect((res) => {
          expect(res.body).toHaveProperty('id', testOrganization2.id);
          expect(res.body).toHaveProperty('name', 'Test Organization 2');
          expect(res.body).toHaveProperty('slug', 'test-org-2');
          expect(res.body).toHaveProperty('logo', '');
          expect(res.body).toHaveProperty('metadata', '');
        });
    });
  });

  describe('Multiple Users and Organizations', () => {
    it('should prevent cross-access between users', async () => {
      // User 1 should not be able to access User 2's organization
      await authHelper
        .makeAuthenticatedRequest(
          'get',
          `/api/v1/organizations/${testOrganization2.id}`,
          user1Cookies,
        )
        .expect(403);

      // User 2 should not be able to access User 1's organization
      await authHelper
        .makeAuthenticatedRequest(
          'get',
          `/api/v1/organizations/${testOrganization.id}`,
          user2Cookies,
        )
        .expect(403);
    });

    it('should handle user with multiple organization memberships', async () => {
      // Add testUser to testOrganization2 as well
      await memberRepository.save({
        user: testUser,
        organization: testOrganization2,
        role: 'member',
      });

      // User should now be able to access both organizations
      await authHelper
        .makeAuthenticatedRequest(
          'get',
          `/api/v1/organizations/${testOrganization.id}`,
          user1Cookies,
        )
        .expect(200);

      await authHelper
        .makeAuthenticatedRequest(
          'get',
          `/api/v1/organizations/${testOrganization2.id}`,
          user1Cookies,
        )
        .expect(200);
    });
  });

  describe('Edge Cases', () => {
    it('should handle empty organization ID', () => {
      return request(app.getHttpServer())
        .get('/api/v1/organizations/')
        .expect(403);
    });

    it('should handle non-existent routes', () => {
      return request(app.getHttpServer())
        .get('/api/v1/organizations/nonexistent/route')
        .expect(404);
    });
  });
});
