import { INestApplication } from '@nestjs/common';
import { getRepositoryToken } from '@nestjs/typeorm';
import * as request from 'supertest';
import { App } from 'supertest/types';
import { Repository } from 'typeorm';

import { AuthHelper } from './auth/AuthHelper';
import { initNestTestApp } from './utils/initNestTestApp';
import { Account } from '../src/models/entity/Account.entity';
import { EventNotificationTrigger } from '../src/models/entity/EventNotificationTrigger.entity';
import { Member } from '../src/models/entity/Member.entity';
import { Organization } from '../src/models/entity/Organization.entity';
import { Project } from '../src/models/entity/Project.entity';
import { PushNotificationToken } from '../src/models/entity/PushNotificationToken.entity';
import { Session } from '../src/models/entity/Session.entity';
import { User } from '../src/models/entity/User.entity';
import { EventPlatform } from '../src/models/types/EventPlatform';

describe('EventNotificationTriggerController (e2e)', () => {
  let app: INestApplication<App>;
  let authHelper: AuthHelper;

  let userRepository: Repository<User>;
  let organizationRepository: Repository<Organization>;
  let projectRepository: Repository<Project>;
  let memberRepository: Repository<Member>;
  let sessionRepository: Repository<Session>;
  let accountRepository: Repository<Account>;
  let pushNotificationTokenRepository: Repository<PushNotificationToken>;
  let eventNotificationTriggerRepository: Repository<EventNotificationTrigger>;

  let testUser: User;
  let testUser2: User;
  let testOrganization: Organization;
  let testOrganization2: Organization;
  let testProject: Project;
  let testProject2: Project;

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
    projectRepository = moduleFixture.get<Repository<Project>>(
      getRepositoryToken(Project),
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
    eventNotificationTriggerRepository = moduleFixture.get<
      Repository<EventNotificationTrigger>
    >(getRepositoryToken(EventNotificationTrigger));
  });

  beforeEach(async () => {
    // Clear all data in correct order to respect foreign key constraints
    try {
      await eventNotificationTriggerRepository.delete({});
      await projectRepository.delete({});
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

    // Create test projects
    const project1 = projectRepository.create({
      name: 'Test Project',
      description: 'Test project description',
      platform: EventPlatform.REACT,
      slug: 'test-project',
      apiKey: 'test-api-key-123',
      organization: testOrganization,
      authorizedUrls: ['https://example.com', 'https://test.com'],
    });
    testProject = await projectRepository.save(project1);

    const project2 = projectRepository.create({
      name: 'Test Project 2',
      description: 'Test project 2 description',
      platform: EventPlatform.NODE_JS,
      slug: 'test-project-2',
      apiKey: 'test-api-key-456',
      organization: testOrganization2,
      authorizedUrls: ['https://example2.com'],
    });
    testProject2 = await projectRepository.save(project2);
  });

  afterAll(async () => {
    await eventNotificationTriggerRepository.delete({});
    await projectRepository.delete({});
    await memberRepository.delete({});
    await pushNotificationTokenRepository.delete({});
    await sessionRepository.delete({});
    await accountRepository.delete({});
    await userRepository.delete({});
    await organizationRepository.delete({});
    await app.close();
  });

  describe('Authentication and Authorization', () => {
    it('should return 403 when no authentication token is provided for GET triggers', () => {
      return request(app.getHttpServer())
        .get(
          `/api/v1/organizations/${testOrganization.id}/projects/${testProject.id}/events/notification-triggers`,
        )
        .expect(403);
    });

    it('should return 403 when no authentication token is provided for POST trigger', () => {
      return request(app.getHttpServer())
        .post(
          `/api/v1/organizations/${testOrganization.id}/projects/${testProject.id}/events/notification-triggers`,
        )
        .send({ onEvent: 'user.signup', mobilePush: true })
        .expect(403);
    });

    it('should return 403 when invalid session token is provided', () => {
      return request(app.getHttpServer())
        .get(
          `/api/v1/organizations/${testOrganization.id}/projects/${testProject.id}/events/notification-triggers`,
        )
        .set('Cookie', 'better-auth.session_token=invalid-token')
        .expect(403);
    });

    it('should return 403 when expired session token is provided', async () => {
      const expiredSession = await sessionRepository.save({
        user: testUser,
        expiresAt: new Date(Date.now() - 24 * 60 * 60 * 1000),
        ipAddress: '127.0.0.1',
        userAgent: 'test-agent',
        token: 'expired-session-token',
      });

      return request(app.getHttpServer())
        .get(
          `/api/v1/organizations/${testOrganization.id}/projects/${testProject.id}/events/notification-triggers`,
        )
        .set('Cookie', `better-auth.session_token=${expiredSession.token}`)
        .expect(403);
    });
  });

  describe('Project Access Control', () => {
    it('should return 403 when user tries to access triggers from organization they are not a member of', async () => {
      return authHelper
        .makeAuthenticatedRequest(
          'get',
          `/api/v1/organizations/${testOrganization.id}/projects/${testProject.id}/events/notification-triggers`,
          user2Cookies,
        )
        .expect(403)
        .expect((res) => {
          expect(res.body.error.message).toBe(
            "You don't have an access to this organization or this organization doesn't exist",
          );
        });
    });

    it('should return 403 when trying to access triggers from non-existent project', async () => {
      const nonExistentProjectId = '604c0032-9556-4cf0-8fd2-b7c43cfedf04';

      return authHelper
        .makeAuthenticatedRequest(
          'get',
          `/api/v1/organizations/${testOrganization.id}/projects/${nonExistentProjectId}/events/notification-triggers`,
          user1Cookies,
        )
        .expect(403)
        .expect((res) => {
          expect(res.body.error.message).toBe(
            "You don't have an access to this project or project doesn't exist",
          );
        });
    });

    it('should return 400 when organization ID is malformed', async () => {
      return authHelper
        .makeAuthenticatedRequest(
          'get',
          `/api/v1/organizations/malformed-id/projects/${testProject.id}/events/notification-triggers`,
          user1Cookies,
        )
        .expect(400);
    });

    it('should return 400 when project ID is malformed', async () => {
      return authHelper
        .makeAuthenticatedRequest(
          'get',
          `/api/v1/organizations/${testOrganization.id}/projects/malformed-id/events/notification-triggers`,
          user1Cookies,
        )
        .expect(400);
    });
  });

  describe('Triggers CRUD', () => {
    it('should return empty array when there are no triggers', async () => {
      return authHelper
        .makeAuthenticatedRequest(
          'get',
          `/api/v1/organizations/${testOrganization.id}/projects/${testProject.id}/events/notification-triggers`,
          user1Cookies,
        )
        .expect(200)
        .expect((res) => {
          expect(Array.isArray(res.body)).toBe(true);
          expect(res.body).toHaveLength(0);
        });
    });

    it('should create a trigger with minimal required fields and default booleans', async () => {
      const createRes = await authHelper
        .makeAuthenticatedRequest(
          'post',
          `/api/v1/organizations/${testOrganization.id}/projects/${testProject.id}/events/notification-triggers`,
          user1Cookies,
        )
        .send({ onEvent: 'user.signup' })
        .expect(201);

      expect(createRes.body).toHaveProperty('id');
      expect(createRes.body).toHaveProperty('onEvent', 'user.signup');
      expect(createRes.body.mobilePush).toBe(false);
      expect(createRes.body.discord).toBe(false);
      expect(createRes.body.email).toBe(false);

      // List should contain the new trigger
      await authHelper
        .makeAuthenticatedRequest(
          'get',
          `/api/v1/organizations/${testOrganization.id}/projects/${testProject.id}/events/notification-triggers`,
          user1Cookies,
        )
        .expect(200)
        .expect((res) => {
          expect(res.body).toHaveLength(1);
          expect(res.body[0].onEvent).toBe('user.signup');
        });
    });

    it('should create a trigger with all boolean channels enabled', async () => {
      const payload = {
        onEvent: 'order.created',
        mobilePush: true,
        discord: true,
        email: true,
      };

      const resCreate = await authHelper
        .makeAuthenticatedRequest(
          'post',
          `/api/v1/organizations/${testOrganization.id}/projects/${testProject.id}/events/notification-triggers`,
          user1Cookies,
        )
        .send(payload)
        .expect(201);

      expect(resCreate.body.onEvent).toBe('order.created');
      expect(resCreate.body.mobilePush).toBe(true);
      expect(resCreate.body.discord).toBe(true);
      expect(resCreate.body.email).toBe(true);
    });

    it('should get trigger by id', async () => {
      const create = await authHelper
        .makeAuthenticatedRequest(
          'post',
          `/api/v1/organizations/${testOrganization.id}/projects/${testProject.id}/events/notification-triggers`,
          user1Cookies,
        )
        .send({ onEvent: 'profile.updated' })
        .expect(201);

      const id = create.body.id as string;

      return authHelper
        .makeAuthenticatedRequest(
          'get',
          `/api/v1/organizations/${testOrganization.id}/projects/${testProject.id}/events/notification-triggers/${id}`,
          user1Cookies,
        )
        .expect(200)
        .expect((res) => {
          expect(res.body).toHaveProperty('id', id);
          expect(res.body).toHaveProperty('onEvent', 'profile.updated');
        });
    });

    it('should update trigger fields', async () => {
      const create = await authHelper
        .makeAuthenticatedRequest(
          'post',
          `/api/v1/organizations/${testOrganization.id}/projects/${testProject.id}/events/notification-triggers`,
          user1Cookies,
        )
        .send({ onEvent: 'file.uploaded', mobilePush: true })
        .expect(201);

      const id = create.body.id as string;

      const updatePayload = {
        onEvent: 'file.processed',
        mobilePush: false,
        discord: true,
        email: true,
      };

      const updateRes = await authHelper
        .makeAuthenticatedRequest(
          'put',
          `/api/v1/organizations/${testOrganization.id}/projects/${testProject.id}/events/notification-triggers/${id}`,
          user1Cookies,
        )
        .send(updatePayload)
        .expect(200);

      // Expect same id to be preserved after update
      expect(updateRes.body.id).toBe(id);
      expect(updateRes.body.onEvent).toBe('file.processed');
      expect(updateRes.body.mobilePush).toBe(false);
      expect(updateRes.body.discord).toBe(true);
      expect(updateRes.body.email).toBe(true);

      // Verify persisted
      await authHelper
        .makeAuthenticatedRequest(
          'get',
          `/api/v1/organizations/${testOrganization.id}/projects/${testProject.id}/events/notification-triggers/${id}`,
          user1Cookies,
        )
        .expect(200)
        .expect((res) => {
          expect(res.body.onEvent).toBe('file.processed');
          expect(res.body.mobilePush).toBe(false);
          expect(res.body.discord).toBe(true);
          expect(res.body.email).toBe(true);
        });
    });

    it('should delete trigger', async () => {
      const create = await authHelper
        .makeAuthenticatedRequest(
          'post',
          `/api/v1/organizations/${testOrganization.id}/projects/${testProject.id}/events/notification-triggers`,
          user1Cookies,
        )
        .send({ onEvent: 'user.deleted' })
        .expect(201);

      const id = create.body.id as string;

      await authHelper
        .makeAuthenticatedRequest(
          'delete',
          `/api/v1/organizations/${testOrganization.id}/projects/${testProject.id}/events/notification-triggers/${id}`,
          user1Cookies,
        )
        .expect(200)
        .expect((res) => {
          expect(res.body).toHaveProperty('result', 'OK');
        });

      // Ensure it no longer exists
      return authHelper
        .makeAuthenticatedRequest(
          'get',
          `/api/v1/organizations/${testOrganization.id}/projects/${testProject.id}/events/notification-triggers/${id}`,
          user1Cookies,
        )
        .expect(404)
        .expect((res) => {
          expect(res.body.error.message).toBe(
            'Event notification trigger not found',
          );
        });
    });
  });

  describe('Validation', () => {
    it('should return 400 when onEvent is missing on create', async () => {
      return authHelper
        .makeAuthenticatedRequest(
          'post',
          `/api/v1/organizations/${testOrganization.id}/projects/${testProject.id}/events/notification-triggers`,
          user1Cookies,
        )
        .send({})
        .expect(400);
    });

    it('should return 400 when onEvent is empty string', async () => {
      return authHelper
        .makeAuthenticatedRequest(
          'post',
          `/api/v1/organizations/${testOrganization.id}/projects/${testProject.id}/events/notification-triggers`,
          user1Cookies,
        )
        .send({ onEvent: '' })
        .expect(400);
    });

    it('should return 400 when boolean fields are invalid types', async () => {
      return authHelper
        .makeAuthenticatedRequest(
          'post',
          `/api/v1/organizations/${testOrganization.id}/projects/${testProject.id}/events/notification-triggers`,
          user1Cookies,
        )
        .send({
          onEvent: 'invalid.types',
          mobilePush: 'yes',
          discord: 'no',
          email: '1',
        })
        .expect(400);
    });

    it('should return 400 for malformed JSON in create', async () => {
      return request(app.getHttpServer())
        .post(
          `/api/v1/organizations/${testOrganization.id}/projects/${testProject.id}/events/notification-triggers`,
        )
        .set('Cookie', user1Cookies[0])
        .send('{ invalid json }')
        .set('Content-Type', 'application/json')
        .expect(400);
    });

    it('should return 400 for malformed JSON in update', async () => {
      const create = await authHelper
        .makeAuthenticatedRequest(
          'post',
          `/api/v1/organizations/${testOrganization.id}/projects/${testProject.id}/events/notification-triggers`,
          user1Cookies,
        )
        .send({ onEvent: 'json.test' })
        .expect(201);

      const id = create.body.id as string;

      return request(app.getHttpServer())
        .put(
          `/api/v1/organizations/${testOrganization.id}/projects/${testProject.id}/events/notification-triggers/${id}`,
        )
        .set('Cookie', user1Cookies[0])
        .send('{ invalid json }')
        .set('Content-Type', 'application/json')
        .expect(400);
    });

    it('should return 400 when trigger ID is malformed on GET/PUT/DELETE', async () => {
      await authHelper
        .makeAuthenticatedRequest(
          'get',
          `/api/v1/organizations/${testOrganization.id}/projects/${testProject.id}/events/notification-triggers/malformed-id`,
          user1Cookies,
        )
        .expect(400);

      await authHelper
        .makeAuthenticatedRequest(
          'put',
          `/api/v1/organizations/${testOrganization.id}/projects/${testProject.id}/events/notification-triggers/malformed-id`,
          user1Cookies,
        )
        .send({ onEvent: 'x' })
        .expect(400);

      await authHelper
        .makeAuthenticatedRequest(
          'delete',
          `/api/v1/organizations/${testOrganization.id}/projects/${testProject.id}/events/notification-triggers/malformed-id`,
          user1Cookies,
        )
        .expect(400);
    });
  });

  describe('Cross-Project and Ownership', () => {
    it('should prevent user from accessing triggers in another project/org', async () => {
      const createOther = await authHelper
        .makeAuthenticatedRequest(
          'post',
          `/api/v1/organizations/${testOrganization2.id}/projects/${testProject2.id}/events/notification-triggers`,
          user2Cookies,
        )
        .send({ onEvent: 'other.created' })
        .expect(201);

      const otherId = createOther.body.id as string;

      // User1 cannot access list in org2/project2
      await authHelper
        .makeAuthenticatedRequest(
          'get',
          `/api/v1/organizations/${testOrganization2.id}/projects/${testProject2.id}/events/notification-triggers`,
          user1Cookies,
        )
        .expect(403);

      // User1 cannot access the item by id in org2/project2
      await authHelper
        .makeAuthenticatedRequest(
          'get',
          `/api/v1/organizations/${testOrganization2.id}/projects/${testProject2.id}/events/notification-triggers/${otherId}`,
          user1Cookies,
        )
        .expect(403);
    });

    it('should handle user with memberships in multiple organizations', async () => {
      // Add testUser to testOrganization2 as well
      await memberRepository.save({
        user: testUser,
        organization: testOrganization2,
        role: 'member',
      });

      // Create a trigger in org2/project2
      const created = await authHelper
        .makeAuthenticatedRequest(
          'post',
          `/api/v1/organizations/${testOrganization2.id}/projects/${testProject2.id}/events/notification-triggers`,
          user2Cookies,
        )
        .send({ onEvent: 'multi.org' })
        .expect(201);

      const id = created.body.id as string;

      // Now user1 can access due to membership
      await authHelper
        .makeAuthenticatedRequest(
          'get',
          `/api/v1/organizations/${testOrganization2.id}/projects/${testProject2.id}/events/notification-triggers/${id}`,
          user1Cookies,
        )
        .expect(200)
        .expect((res) => {
          expect(res.body.id).toBe(id);
        });
    });
  });

  describe('Not Found', () => {
    it('should return 404 when trigger by id does not exist', async () => {
      const nonExistentId = '604c0032-9556-4cf0-8fd2-b7c43cfedf04';

      return authHelper
        .makeAuthenticatedRequest(
          'get',
          `/api/v1/organizations/${testOrganization.id}/projects/${testProject.id}/events/notification-triggers/${nonExistentId}`,
          user1Cookies,
        )
        .expect(404)
        .expect((res) => {
          expect(res.body.error.message).toBe(
            'Event notification trigger not found',
          );
        });
    });

    it('should return 404 when updating non-existent trigger', async () => {
      const nonExistentId = '604c0032-9556-4cf0-8fd2-b7c43cfedf04';

      return authHelper
        .makeAuthenticatedRequest(
          'put',
          `/api/v1/organizations/${testOrganization.id}/projects/${testProject.id}/events/notification-triggers/${nonExistentId}`,
          user1Cookies,
        )
        .send({ onEvent: 'nonexistent.update' })
        .expect(404)
        .expect((res) => {
          expect(res.body.error.message).toBe(
            'Event notification trigger not found',
          );
        });
    });

    it('should return 404 when deleting non-existent trigger', async () => {
      const nonExistentId = '604c0032-9556-4cf0-8fd2-b7c43cfedf04';

      return authHelper
        .makeAuthenticatedRequest(
          'delete',
          `/api/v1/organizations/${testOrganization.id}/projects/${testProject.id}/events/notification-triggers/${nonExistentId}`,
          user1Cookies,
        )
        .expect(404)
        .expect((res) => {
          expect(res.body.error.message).toBe(
            'Event notification trigger not found',
          );
        });
    });
  });
});
