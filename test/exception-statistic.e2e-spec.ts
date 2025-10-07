import { INestApplication } from '@nestjs/common';
import { getRepositoryToken } from '@nestjs/typeorm';
import * as request from 'supertest';
import { App } from 'supertest/types';
import { Repository } from 'typeorm';

import { AuthHelper } from './auth/AuthHelper';
import { initNestTestApp } from './utils/initNestTestApp';
import { Account } from '../src/models/entity/Account.entity';
import { Exception } from '../src/models/entity/Exception.entity';
import { Issue } from '../src/models/entity/Issue.entity';
import { Member } from '../src/models/entity/Member.entity';
import { Organization } from '../src/models/entity/Organization.entity';
import { Project } from '../src/models/entity/Project.entity';
import { PushNotificationToken } from '../src/models/entity/PushNotificationToken.entity';
import { Session } from '../src/models/entity/Session.entity';
import { User } from '../src/models/entity/User.entity';
import { EventEnvironment } from '../src/models/types/EventEnvironment';
import { EventPlatform } from '../src/models/types/EventPlatform';
import { IssueSeverity } from '../src/models/types/IssueSeverity';
import { IssueStatus } from '../src/models/types/IssueStatus';

describe('ExceptionStatisticController (e2e)', () => {
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

  let testUser: User;
  let testUser2: User;
  let testOrganization: Organization;
  let testOrganization2: Organization;
  let testProject: Project;
  let testProject2: Project;
  let testIssue: Issue;
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
  });

  beforeEach(async () => {
    try {
      await exceptionRepository.delete({});
      await issueRepository.delete({});
      await projectRepository.delete({});
      await memberRepository.delete({});
      await pushNotificationTokenRepository.delete({});
      await sessionRepository.delete({});
      await accountRepository.delete({});
      await userRepository.delete({});
      await organizationRepository.delete({});
    } catch (error) {
      console.error('Error deleting test data', error);
    }

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

    const org1 = organizationRepository.create({
      name: 'Test Organization',
      slug: 'test-org',
      logo: '',
      metadata: '{}',
    });
    testOrganization = await organizationRepository.save(org1);

    const org2 = organizationRepository.create({
      name: 'Test Organization 2',
      slug: 'test-org-2',
      logo: '',
      metadata: '',
    });
    testOrganization2 = await organizationRepository.save(org2);

    await memberRepository.save({
      user: testUser,
      organization: testOrganization,
      role: 'member',
    });
    await memberRepository.save({
      user: testUser2,
      organization: testOrganization2,
      role: 'member',
    });

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

    testIssue = await issueRepository.save({
      name: 'Test Issue',
      status: IssueStatus.OPEN,
      severity: IssueSeverity.HIGH,
      firstSeen: new Date(),
      lastSeen: new Date(),
      eventCount: 1,
      project: testProject,
    });
  });

  afterAll(async () => {
    await exceptionRepository.delete({});
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
    it('should return 403 when no authentication token is provided for GET daily statistics', () => {
      const from = '2025-01-01';
      const to = '2025-01-07';
      return request(app.getHttpServer())
        .get(
          `/api/v1/organizations/${testOrganization.id}/projects/${testProject.id}/exceptions/statistics/daily?from=${from}&to=${to}`,
        )
        .expect(403);
    });

    it('should return 403 when invalid session token is provided', () => {
      const from = '2025-01-01';
      const to = '2025-01-07';
      return request(app.getHttpServer())
        .get(
          `/api/v1/organizations/${testOrganization.id}/projects/${testProject.id}/exceptions/statistics/daily?from=${from}&to=${to}`,
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
      const from = '2025-01-01';
      const to = '2025-01-07';
      return request(app.getHttpServer())
        .get(
          `/api/v1/organizations/${testOrganization.id}/projects/${testProject.id}/exceptions/statistics/daily?from=${from}&to=${to}`,
        )
        .set('Cookie', `better-auth.session_token=${expiredSession.token}`)
        .expect(403);
    });
  });

  describe('Project Access Control', () => {
    it('should return 403 when user tries to access statistics from organization they are not a member of', async () => {
      const from = '2025-01-01';
      const to = '2025-01-07';
      return authHelper
        .makeAuthenticatedRequest(
          'get',
          `/api/v1/organizations/${testOrganization.id}/projects/${testProject.id}/exceptions/statistics/daily?from=${from}&to=${to}`,
          user2Cookies,
        )
        .expect(403);
    });

    it('should return 403 when user tries to access statistics from project they are not a member of', async () => {
      const from = '2025-01-01';
      const to = '2025-01-07';
      return authHelper
        .makeAuthenticatedRequest(
          'get',
          `/api/v1/organizations/${testOrganization2.id}/projects/${testProject2.id}/exceptions/statistics/daily?from=${from}&to=${to}`,
          user1Cookies,
        )
        .expect(403);
    });

    it('should return 400 when organization ID is malformed', async () => {
      const from = '2025-01-01';
      const to = '2025-01-07';
      return authHelper
        .makeAuthenticatedRequest(
          'get',
          `/api/v1/organizations/malformed-id/projects/${testProject.id}/exceptions/statistics/daily?from=${from}&to=${to}`,
          user1Cookies,
        )
        .expect(400);
    });

    it('should return 400 when project ID is malformed', async () => {
      const from = '2025-01-01';
      const to = '2025-01-07';
      return authHelper
        .makeAuthenticatedRequest(
          'get',
          `/api/v1/organizations/${testOrganization.id}/projects/malformed-id/exceptions/statistics/daily?from=${from}&to=${to}`,
          user1Cookies,
        )
        .expect(400);
    });
  });

  describe('Validation', () => {
    it('should return 400 when from is missing', async () => {
      const to = '2025-01-07';
      return authHelper
        .makeAuthenticatedRequest(
          'get',
          `/api/v1/organizations/${testOrganization.id}/projects/${testProject.id}/exceptions/statistics/daily?to=${to}`,
          user1Cookies,
        )
        .expect(400);
    });

    it('should return 400 when to is missing', async () => {
      const from = '2025-01-01';
      return authHelper
        .makeAuthenticatedRequest(
          'get',
          `/api/v1/organizations/${testOrganization.id}/projects/${testProject.id}/exceptions/statistics/daily?from=${from}`,
          user1Cookies,
        )
        .expect(400);
    });

    it('should return 400 when dates are invalid', async () => {
      return authHelper
        .makeAuthenticatedRequest(
          'get',
          `/api/v1/organizations/${testOrganization.id}/projects/${testProject.id}/exceptions/statistics/daily?from=invalid&to=also-invalid`,
          user1Cookies,
        )
        .expect(400);
    });
  });

  describe('Daily statistics', () => {
    it('should return zero-filled series across date range', async () => {
      // Seed exceptions on 1st and 3rd of the range
      await exceptionRepository.save({
        environment: EventEnvironment.PRODUCTION,
        platform: EventPlatform.REACT,
        name: 'Error 1',
        message: 'Err msg 1',
        issue: testIssue,
        project: testProject,
        createdAt: new Date('2025-01-01T10:00:00.000Z'),
      });

      await exceptionRepository.save({
        environment: EventEnvironment.PRODUCTION,
        platform: EventPlatform.REACT,
        name: 'Error 2',
        message: 'Err msg 2',
        issue: testIssue,
        project: testProject,
        createdAt: new Date('2025-01-03T12:34:56.000Z'),
      });

      const from = '2025-01-01';
      const to = '2025-01-04';

      return authHelper
        .makeAuthenticatedRequest(
          'get',
          `/api/v1/organizations/${testOrganization.id}/projects/${testProject.id}/exceptions/statistics/daily?from=${from}&to=${to}`,
          user1Cookies,
        )
        .expect(200)
        .expect((res) => {
          expect(Array.isArray(res.body)).toBe(true);
          expect(res.body).toHaveLength(4);
          expect(res.body[0]).toEqual({ date: '2025-01-01', count: 1 });
          expect(res.body[1]).toEqual({ date: '2025-01-02', count: 0 });
          expect(res.body[2]).toEqual({ date: '2025-01-03', count: 1 });
          expect(res.body[3]).toEqual({ date: '2025-01-04', count: 0 });
        });
    });

    it('should ignore exceptions outside requested range', async () => {
      // Outside range (Dec 31 and Jan 05)
      await exceptionRepository.save({
        environment: EventEnvironment.DEVELOPMENT,
        name: 'Before range',
        message: 'before',
        issue: testIssue,
        project: testProject,
        createdAt: new Date('2024-12-31T23:50:00.000Z'),
      });

      await exceptionRepository.save({
        environment: EventEnvironment.DEVELOPMENT,
        name: 'After range',
        message: 'after',
        issue: testIssue,
        project: testProject,
        createdAt: new Date('2025-01-05T00:10:00.000Z'),
      });

      // Inside range (Jan 02)
      await exceptionRepository.save({
        environment: EventEnvironment.DEVELOPMENT,
        name: 'Inside',
        message: 'inside',
        issue: testIssue,
        project: testProject,
        createdAt: new Date('2025-01-02T08:00:00.000Z'),
      });

      const from = '2025-01-01';
      const to = '2025-01-03';

      return authHelper
        .makeAuthenticatedRequest(
          'get',
          `/api/v1/organizations/${testOrganization.id}/projects/${testProject.id}/exceptions/statistics/daily?from=${from}&to=${to}`,
          user1Cookies,
        )
        .expect(200)
        .expect((res) => {
          expect(res.body).toEqual([
            { date: '2025-01-01', count: 1 },
            { date: '2025-01-02', count: 1 },
            { date: '2025-01-03', count: 0 },
          ]);
        });
    });

    it('should not leak statistics from another project', async () => {
      // Same dates but in another project/org
      await exceptionRepository.save({
        environment: EventEnvironment.PRODUCTION,
        name: 'Other project',
        message: 'x',
        issue: await issueRepository.save({
          name: 'Other Issue',
          status: IssueStatus.OPEN,
          severity: IssueSeverity.LOW,
          firstSeen: new Date(),
          lastSeen: new Date(),
          eventCount: 1,
          project: testProject2,
        }),
        project: testProject2,
        createdAt: new Date('2025-01-02T11:00:00.000Z'),
      });

      const from = '2025-01-01';
      const to = '2025-01-03';
      return authHelper
        .makeAuthenticatedRequest(
          'get',
          `/api/v1/organizations/${testOrganization.id}/projects/${testProject.id}/exceptions/statistics/daily?from=${from}&to=${to}`,
          user1Cookies,
        )
        .expect(200)
        .expect((res) => {
          expect(res.body).toEqual([
            { date: '2025-01-01', count: 0 },
            { date: '2025-01-02', count: 0 },
            { date: '2025-01-03', count: 0 },
          ]);
        });
    });
  });
});
