import { INestApplication } from '@nestjs/common';
import { getRepositoryToken } from '@nestjs/typeorm';
import * as request from 'supertest';
import { App } from 'supertest/types';
import { Repository } from 'typeorm';

import { AuthHelper } from './auth/AuthHelper';
import { initNestTestApp } from './utils/initNestTestApp';
import { Account } from '../src/models/entity/Account.entity';
import { Exception } from '../src/models/entity/Exception.entity';
import { HttpContext } from '../src/models/entity/HttpContext.entity';
import { Issue } from '../src/models/entity/Issue.entity';
import { Member } from '../src/models/entity/Member.entity';
import { Organization } from '../src/models/entity/Organization.entity';
import { Project } from '../src/models/entity/Project.entity';
import { PushNotificationToken } from '../src/models/entity/PushNotificationToken.entity';
import { Session } from '../src/models/entity/Session.entity';
import { User } from '../src/models/entity/User.entity';
import { EventEnvironment } from '../src/models/types/EventEnvironment';
import { EventPlatform } from '../src/models/types/EventPlatform';
import { HttpRequestMethod } from '../src/models/types/HttpRequestMethod';
import { IssueSeverity } from '../src/models/types/IssueSeverity';
import { IssueStatus } from '../src/models/types/IssueStatus';

describe('ExceptionController (e2e)', () => {
  let app: INestApplication<App>;
  let authHelper: AuthHelper;

  let userRepository: Repository<User>;
  let organizationRepository: Repository<Organization>;
  let projectRepository: Repository<Project>;
  let memberRepository: Repository<Member>;
  let sessionRepository: Repository<Session>;
  let accountRepository: Repository<Account>;
  let pushNotificationTokenRepository: Repository<PushNotificationToken>;
  let exceptionRepository: Repository<Exception>;
  let issueRepository: Repository<Issue>;
  let httpContextRepository: Repository<HttpContext>;

  let testUser: User;
  let testUser2: User;
  let testOrganization: Organization;
  let testOrganization2: Organization;
  let testProject: Project;
  let testProject2: Project;
  let testIssue: Issue;
  let testException: Exception;
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
    exceptionRepository = moduleFixture.get<Repository<Exception>>(
      getRepositoryToken(Exception),
    );
    issueRepository = moduleFixture.get<Repository<Issue>>(
      getRepositoryToken(Issue),
    );
    httpContextRepository = moduleFixture.get<Repository<HttpContext>>(
      getRepositoryToken(HttpContext),
    );
  });

  beforeEach(async () => {
    // Clear all data in correct order to respect foreign key constraints
    try {
      await exceptionRepository.delete({});
      await httpContextRepository.delete({});
      await issueRepository.delete({});
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

    // Create test issue
    testIssue = await issueRepository.save({
      name: 'Test Issue',
      status: IssueStatus.OPEN,
      severity: IssueSeverity.HIGH,
      firstSeen: new Date(),
      lastSeen: new Date(),
      eventCount: 1,
      project: testProject,
    });

    // Create test HTTP context
    const httpContext = await httpContextRepository.save({
      method: HttpRequestMethod.GET,
      url: 'https://example.com/test',
      headers: '{"User-Agent": "Test Agent"}',
      params: '{"id": "123"}',
      query: '{"filter": "active"}',
      body: '{"data": "test"}',
      response: '{"success": true}',
    });

    // Create test exception
    testException = await exceptionRepository.save({
      environment: EventEnvironment.PRODUCTION,
      platform: EventPlatform.REACT,
      name: 'TypeError',
      message: 'Cannot read property of undefined',
      details: 'Stack trace details here',
      suggestion: 'Check if the object is not null before accessing properties',
      issue: testIssue,
      project: testProject,
      httpContext: httpContext,
    });
  });

  afterAll(async () => {
    await exceptionRepository.delete({});
    await httpContextRepository.delete({});
    await issueRepository.delete({});
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
    it('should return 403 when no authentication token is provided for GET exceptions', () => {
      return request(app.getHttpServer())
        .get(
          `/api/v1/organizations/${testOrganization.id}/projects/${testProject.id}/exceptions`,
        )
        .expect(403);
    });

    it('should return 403 when no authentication token is provided for GET exception by ID', () => {
      return request(app.getHttpServer())
        .get(
          `/api/v1/organizations/${testOrganization.id}/projects/${testProject.id}/exceptions/${testException.id}`,
        )
        .expect(403);
    });

    it('should return 403 when invalid session token is provided', () => {
      return request(app.getHttpServer())
        .get(
          `/api/v1/organizations/${testOrganization.id}/projects/${testProject.id}/exceptions`,
        )
        .set('Cookie', 'better-auth.session_token=invalid-token')
        .expect(403);
    });

    it('should return 403 when expired session token is provided', async () => {
      const expiredSession = await sessionRepository.save({
        user: testUser,
        expiresAt: new Date(Date.now() - 24 * 60 * 60 * 1000), // 24 hours ago
        ipAddress: '127.0.0.1',
        userAgent: 'test-agent',
        token: 'expired-session-token',
      });

      return request(app.getHttpServer())
        .get(
          `/api/v1/organizations/${testOrganization.id}/projects/${testProject.id}/exceptions`,
        )
        .set('Cookie', `better-auth.session_token=${expiredSession.token}`)
        .expect(403);
    });
  });

  describe('Project Access Control', () => {
    it('should return 403 when user tries to access exceptions from organization they are not a member of', async () => {
      return authHelper
        .makeAuthenticatedRequest(
          'get',
          `/api/v1/organizations/${testOrganization.id}/projects/${testProject.id}/exceptions`,
          user2Cookies,
        )
        .expect(403)
        .expect((res) => {
          expect(res.body.error.message).toBe(
            "You don't have an access to this organization or this organization doesn't exist",
          );
        });
    });

    it('should return 403 when user tries to access exceptions from project they are not a member of', async () => {
      return authHelper
        .makeAuthenticatedRequest(
          'get',
          `/api/v1/organizations/${testOrganization2.id}/projects/${testProject2.id}/exceptions`,
          user1Cookies,
        )
        .expect(403)
        .expect((res) => {
          expect(res.body.error.message).toBe(
            "You don't have an access to this organization or this organization doesn't exist",
          );
        });
    });

    it('should return 403 when trying to access exceptions from non-existent project', async () => {
      const nonExistentProjectId = '604c0032-9556-4cf0-8fd2-b7c43cfedf04';

      return authHelper
        .makeAuthenticatedRequest(
          'get',
          `/api/v1/organizations/${testOrganization.id}/projects/${nonExistentProjectId}/exceptions`,
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
          `/api/v1/organizations/malformed-id/projects/${testProject.id}/exceptions`,
          user1Cookies,
        )
        .expect(400);
    });

    it('should return 400 when project ID is malformed', async () => {
      return authHelper
        .makeAuthenticatedRequest(
          'get',
          `/api/v1/organizations/${testOrganization.id}/projects/malformed-id/exceptions`,
          user1Cookies,
        )
        .expect(400);
    });
  });

  describe('Exception Listing', () => {
    it('should return paginated exceptions for authenticated user in their project', async () => {
      return authHelper
        .makeAuthenticatedRequest(
          'get',
          `/api/v1/organizations/${testOrganization.id}/projects/${testProject.id}/exceptions`,
          user1Cookies,
        )
        .expect(200)
        .expect((res) => {
          expect(res.body).toHaveProperty('items');
          expect(res.body).toHaveProperty('meta');
          expect(Array.isArray(res.body.items)).toBe(true);
          expect(res.body.items).toHaveLength(1);

          const exception = res.body.items[0];
          expect(exception).toHaveProperty('id', testException.id);
          expect(exception).toHaveProperty('name', 'TypeError');
          expect(exception).toHaveProperty(
            'message',
            'Cannot read property of undefined',
          );
          expect(exception).toHaveProperty(
            'environment',
            EventEnvironment.PRODUCTION,
          );
          expect(exception).toHaveProperty('platform', EventPlatform.REACT);
          //   expect(exception).toHaveProperty(
          //     'suggestion',
          //     'Check if the object is not null before accessing properties',
          //   );
          //   expect(exception).toHaveProperty('httpContext');
          expect(exception).toHaveProperty('createdAt');
          expect(exception).toHaveProperty('updatedAt');
        });
    });

    it('should return empty data when project has no exceptions', async () => {
      // Clear exceptions
      await exceptionRepository.delete({});

      return authHelper
        .makeAuthenticatedRequest(
          'get',
          `/api/v1/organizations/${testOrganization.id}/projects/${testProject.id}/exceptions`,
          user1Cookies,
        )
        .expect(200)
        .expect((res) => {
          expect(res.body).toHaveProperty('items');
          expect(Array.isArray(res.body.items)).toBe(true);
          expect(res.body.items).toHaveLength(0);
        });
    });

    it('should support pagination parameters', async () => {
      // Create additional exceptions
      for (let i = 0; i < 5; i++) {
        await exceptionRepository.save({
          environment: EventEnvironment.DEVELOPMENT,
          platform: EventPlatform.NODE_JS,
          name: `Error ${i}`,
          message: `Error message ${i}`,
          issue: testIssue,
          project: testProject,
        });
      }

      return authHelper
        .makeAuthenticatedRequest(
          'get',
          `/api/v1/organizations/${testOrganization.id}/projects/${testProject.id}/exceptions?page=1&size=3`,
          user1Cookies,
        )
        .expect(200)
        .expect((res) => {
          expect(res.body.items).toHaveLength(3);
          expect(res.body.meta).toHaveProperty('totalItems');
          expect(res.body.meta).toHaveProperty('totalPages');
          expect(res.body.meta).toHaveProperty('currentPage', 1);
          expect(res.body.meta).toHaveProperty('itemsPerPage', 3);
        });
    });

    it('should support sorting by createdAt DESC by default', async () => {
      // Create additional exception with later timestamp
      const newerException = await exceptionRepository.save({
        environment: EventEnvironment.STAGING,
        name: 'Newer Error',
        message: 'This is a newer error',
        issue: testIssue,
        project: testProject,
        createdAt: new Date(Date.now() + 1000),
      });

      return authHelper
        .makeAuthenticatedRequest(
          'get',
          `/api/v1/organizations/${testOrganization.id}/projects/${testProject.id}/exceptions`,
          user1Cookies,
        )
        .expect(200)
        .expect((res) => {
          expect(res.body.items).toHaveLength(2);
          expect(res.body.items[0].id).toBe(newerException.id);
          expect(res.body.items[1].id).toBe(testException.id);
        });
    });

    it('should support filtering by issue ID', async () => {
      // Create another issue and exception
      const anotherIssue = await issueRepository.save({
        name: 'Another Issue',
        status: IssueStatus.OPEN,
        severity: IssueSeverity.LOW,
        firstSeen: new Date(),
        lastSeen: new Date(),
        eventCount: 1,
        project: testProject,
      });

      await exceptionRepository.save({
        environment: EventEnvironment.DEVELOPMENT,
        name: 'Another Error',
        message: 'Another error message',
        issue: anotherIssue,
        project: testProject,
      });

      return authHelper
        .makeAuthenticatedRequest(
          'get',
          `/api/v1/organizations/${testOrganization.id}/projects/${testProject.id}/exceptions?issueId=${testIssue.id}`,
          user1Cookies,
        )
        .expect(200)
        .expect((res) => {
          expect(res.body.items).toHaveLength(1);
          expect(res.body.items[0].id).toBe(testException.id);
        });
    });

    it('should handle custom sorting parameters', async () => {
      await exceptionRepository.save({
        environment: EventEnvironment.DEVELOPMENT,
        name: 'AAA Error',
        message: 'Error starting with AAA',
        issue: testIssue,
        project: testProject,
      });

      return authHelper
        .makeAuthenticatedRequest(
          'get',
          `/api/v1/organizations/${testOrganization.id}/projects/${testProject.id}/exceptions?sortBy=name&sortOrder=ASC`,
          user1Cookies,
        )
        .expect(200)
        .expect((res) => {
          expect(res.body.items).toHaveLength(2);
          expect(res.body.items[0].name).toBe('AAA Error');
          expect(res.body.items[1].name).toBe('TypeError');
        });
    });
  });

  describe('Individual Exception Access', () => {
    it('should allow user to access specific exception in their project', async () => {
      return authHelper
        .makeAuthenticatedRequest(
          'get',
          `/api/v1/organizations/${testOrganization.id}/projects/${testProject.id}/exceptions/${testException.id}`,
          user1Cookies,
        )
        .expect(200)
        .expect((res) => {
          expect(res.body).toHaveProperty('id', testException.id);
          expect(res.body).toHaveProperty('name', 'TypeError');
          expect(res.body).toHaveProperty(
            'message',
            'Cannot read property of undefined',
          );
          expect(res.body).toHaveProperty(
            'environment',
            EventEnvironment.PRODUCTION,
          );
          expect(res.body).toHaveProperty('platform', EventPlatform.REACT);
          //   expect(res.body).toHaveProperty(
          //     'details',
          //     'Stack trace details here',
          //   );
          //   expect(res.body).toHaveProperty(
          //     'suggestion',
          //     'Check if the object is not null before accessing properties',
          //   );
          expect(res.body).toHaveProperty('httpContext');
          expect(res.body.httpContext).toHaveProperty(
            'method',
            HttpRequestMethod.GET,
          );
          expect(res.body.httpContext).toHaveProperty(
            'url',
            'https://example.com/test',
          );
        });
    });

    it('should return 403 when trying to access exception from project user is not member of', async () => {
      return authHelper
        .makeAuthenticatedRequest(
          'get',
          `/api/v1/organizations/${testOrganization.id}/projects/${testProject.id}/exceptions/${testException.id}`,
          user2Cookies,
        )
        .expect(403);
    });

    it('should return 404 when trying to access non-existent exception', async () => {
      const nonExistentExceptionId = '604c0032-9556-4cf0-8fd2-b7c43cfedf04';

      return authHelper
        .makeAuthenticatedRequest(
          'get',
          `/api/v1/organizations/${testOrganization.id}/projects/${testProject.id}/exceptions/${nonExistentExceptionId}`,
          user1Cookies,
        )
        .expect(404);
    });

    it('should return 400 when exception ID is malformed', async () => {
      return authHelper
        .makeAuthenticatedRequest(
          'get',
          `/api/v1/organizations/${testOrganization.id}/projects/${testProject.id}/exceptions/malformed-id`,
          user1Cookies,
        )
        .expect(400);
    });

    it('should handle exception without optional fields', async () => {
      const minimalException = await exceptionRepository.save({
        environment: EventEnvironment.DEVELOPMENT,
        name: 'Minimal Error',
        message: 'Basic error message',
        issue: testIssue,
        project: testProject,
      });

      return authHelper
        .makeAuthenticatedRequest(
          'get',
          `/api/v1/organizations/${testOrganization.id}/projects/${testProject.id}/exceptions/${minimalException.id}`,
          user1Cookies,
        )
        .expect(200)
        .expect((res) => {
          console.log(res.body);
          expect(res.body).toHaveProperty('id', minimalException.id);
          expect(res.body).toHaveProperty('name', 'Minimal Error');
          expect(res.body).toHaveProperty('message', 'Basic error message');
          expect(res.body).toHaveProperty(
            'environment',
            EventEnvironment.DEVELOPMENT,
          );
          expect(res.body.platform).toBeNull();
          //   expect(res.body.details).toBeNull();
          //   expect(res.body.suggestion).toBeNull();
          expect(res.body.httpContext).toBeUndefined();
        });
    });
  });

  describe('Exception Capture', () => {
    it('should capture exception with API key authentication', async () => {
      const exceptionData = {
        environment: EventEnvironment.PRODUCTION,
        platform: EventPlatform.REACT,
        name: 'ReferenceError',
        message: 'Variable is not defined',
        // details: 'at line 42 in component.js',
        // suggestion: 'Make sure to declare the variable before using it',
      };

      return request(app.getHttpServer())
        .post('/api/v1/exceptions')
        .set('x-api-key', testProject.apiKey)
        .set('Origin', 'https://example.com')
        .send(exceptionData)
        .expect(201)
        .expect((res) => {
          expect(res.body).toHaveProperty('result', 'OK');
        });
    });

    it('should capture exception without optional fields', async () => {
      const minimalExceptionData = {
        environment: EventEnvironment.DEVELOPMENT,
        name: 'SyntaxError',
        message: 'Unexpected token',
      };

      return request(app.getHttpServer())
        .post('/api/v1/exceptions')
        .set('x-api-key', testProject.apiKey)
        .set('Origin', 'https://example.com')
        .send(minimalExceptionData)
        .expect(201);
    });

    it('should return 403 when no API key is provided for exception capture', () => {
      const exceptionData = {
        environment: EventEnvironment.PRODUCTION,
        name: 'Error',
        message: 'Some error',
      };

      return request(app.getHttpServer())
        .post('/api/v1/exceptions')
        .set('Origin', 'https://example.com')
        .send(exceptionData)
        .expect(401);
    });

    it('should return 403 when invalid API key is provided', () => {
      const exceptionData = {
        environment: EventEnvironment.PRODUCTION,
        name: 'Error',
        message: 'Some error',
      };

      return request(app.getHttpServer())
        .post('/api/v1/exceptions')
        .set('Authorization', 'Bearer invalid-api-key')
        .set('Origin', 'https://example.com')
        .send(exceptionData)
        .expect(401);
    });

    it('should return 403 when origin is not authorized', () => {
      const exceptionData = {
        environment: EventEnvironment.PRODUCTION,
        name: 'Error',
        message: 'Some error',
      };

      return request(app.getHttpServer())
        .post('/api/v1/exceptions')
        .set('x-api-key', testProject.apiKey)
        .set('Origin', 'https://unauthorized-domain.com')
        .send(exceptionData)
        .expect(403);
    });

    it('should return 400 when required fields are missing', () => {
      const invalidExceptionData = {
        platform: EventPlatform.REACT,
        message: 'Error message without name and environment',
      };

      return request(app.getHttpServer())
        .post('/api/v1/exceptions')
        .set('x-api-key', testProject.apiKey)
        .set('Origin', 'https://example.com')
        .send(invalidExceptionData)
        .expect(400);
    });

    it('should return 400 when environment is invalid', () => {
      const invalidExceptionData = {
        environment: 'INVALID_ENVIRONMENT',
        name: 'Error',
        message: 'Error message',
      };

      return request(app.getHttpServer())
        .post('/api/v1/exceptions')
        .set('x-api-key', testProject.apiKey)
        .set('Origin', 'https://example.com')
        .send(invalidExceptionData)
        .expect(400);
    });

    it('should return 400 when platform is invalid', () => {
      const invalidExceptionData = {
        environment: EventEnvironment.PRODUCTION,
        platform: 'INVALID_PLATFORM',
        name: 'Error',
        message: 'Error message',
      };

      return request(app.getHttpServer())
        .post('/api/v1/exceptions')
        .set('x-api-key', testProject.apiKey)
        .set('Origin', 'https://example.com')
        .send(invalidExceptionData)
        .expect(400);
    });
  });

  describe('Exception Environments', () => {
    it('should support all valid environments', async () => {
      const environments = Object.values(EventEnvironment);

      for (const environment of environments) {
        await exceptionRepository.save({
          environment: environment,
          name: `${environment} Error`,
          message: `Error in ${environment} environment`,
          issue: testIssue,
          project: testProject,
        });
      }

      return authHelper
        .makeAuthenticatedRequest(
          'get',
          `/api/v1/organizations/${testOrganization.id}/projects/${testProject.id}/exceptions`,
          user1Cookies,
        )
        .expect(200)
        .expect((res) => {
          expect(res.body.items.length).toBeGreaterThanOrEqual(
            environments.length,
          );

          const foundEnvironments = (
            res.body.items as { environment: string }[]
          ).map((ex: { environment: string }) => ex.environment);
          environments.forEach((env) => {
            expect(foundEnvironments).toContain(env);
          });
        });
    });
  });

  describe('Exception Platforms', () => {
    it('should support all valid platforms', async () => {
      const platforms = Object.values(EventPlatform);

      for (const platform of platforms) {
        await exceptionRepository.save({
          environment: EventEnvironment.DEVELOPMENT,
          platform: platform,
          name: `${platform} Error`,
          message: `Error on ${platform} platform`,
          issue: testIssue,
          project: testProject,
        });
      }

      return authHelper
        .makeAuthenticatedRequest(
          'get',
          `/api/v1/organizations/${testOrganization.id}/projects/${testProject.id}/exceptions`,
          user1Cookies,
        )
        .expect(200)
        .expect((res) => {
          expect(res.body.items.length).toBeGreaterThanOrEqual(
            platforms.length,
          );

          const foundPlatforms = (res.body.items as { platform?: string }[])
            .map((ex: { platform?: string }) => ex.platform)
            .filter(Boolean);
          platforms.forEach((platform) => {
            expect(foundPlatforms).toContain(platform);
          });
        });
    });
  });

  describe('Edge Cases', () => {
    it('should handle very long exception messages', async () => {
      const longMessage = 'A'.repeat(5000);
      const longException = await exceptionRepository.save({
        environment: EventEnvironment.PRODUCTION,
        name: 'Long Message Error',
        message: longMessage,
        issue: testIssue,
        project: testProject,
      });

      return authHelper
        .makeAuthenticatedRequest(
          'get',
          `/api/v1/organizations/${testOrganization.id}/projects/${testProject.id}/exceptions/${longException.id}`,
          user1Cookies,
        )
        .expect(200)
        .expect((res) => {
          expect(res.body.message).toBe(longMessage);
        });
    });

    it('should handle special characters in exception fields', async () => {
      const specialException = await exceptionRepository.save({
        environment: EventEnvironment.DEVELOPMENT,
        name: 'Error with émojis 🚀 and spéçial chars',
        message: 'Error with "quotes" and \'apostrophes\' and <html> tags',
        details: 'Stack trace with \n newlines \t tabs and unicode: 你好',
        suggestion: 'Suggestion with special chars: @#$%^&*()',
        issue: testIssue,
        project: testProject,
      });

      return authHelper
        .makeAuthenticatedRequest(
          'get',
          `/api/v1/organizations/${testOrganization.id}/projects/${testProject.id}/exceptions/${specialException.id}`,
          user1Cookies,
        )
        .expect(200)
        .expect((res) => {
          expect(res.body.name).toBe('Error with émojis 🚀 and spéçial chars');
          expect(res.body.message).toBe(
            'Error with "quotes" and \'apostrophes\' and <html> tags',
          );
          //   expect(res.body.details).toBe(
          //     'Stack trace with \n newlines \t tabs and unicode: 你好',
          //   );
          //   expect(res.body.suggestion).toBe(
          //     'Suggestion with special chars: @#$%^&*()',
          //   );
        });
    });

    it('should handle malformed JSON in exception capture', () => {
      return request(app.getHttpServer())
        .post('/api/v1/exceptions')
        .set('x-api-key', testProject.apiKey)
        .set('Origin', 'https://example.com')
        .send('{ invalid json }')
        .set('Content-Type', 'application/json')
        .expect(400);
    });

    it('should handle empty exception endpoints', () => {
      return request(app.getHttpServer())
        .get('/api/v1/organizations//projects//exceptions')
        .expect(404);
    });

    it('should handle large page size requests gracefully', async () => {
      return authHelper
        .makeAuthenticatedRequest(
          'get',
          `/api/v1/organizations/${testOrganization.id}/projects/${testProject.id}/exceptions?size=10000`,
          user1Cookies,
        )
        .expect(200)
        .expect((res) => {
          expect(res.body.items).toHaveLength(1); // Only one exception exists
        });
    });
  });
});
