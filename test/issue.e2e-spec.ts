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
import { IssueSeverity } from '../src/models/types/IssueSeverity';
import { IssueStatus } from '../src/models/types/IssueStatus';

describe('IssueController (e2e)', () => {
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
  let testIssue2: Issue;

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

    // Create test issues
    testIssue = await issueRepository.save({
      name: 'Critical Database Connection Error',
      status: IssueStatus.OPEN,
      severity: IssueSeverity.CRITICAL,
      firstSeen: new Date('2024-01-01T10:00:00Z'),
      lastSeen: new Date('2024-01-02T15:30:00Z'),
      eventCount: 15,
      project: testProject,
    });

    testIssue2 = await issueRepository.save({
      name: 'Minor UI Rendering Issue',
      status: IssueStatus.RESOLVED,
      severity: IssueSeverity.LOW,
      firstSeen: new Date('2024-01-03T08:00:00Z'),
      lastSeen: new Date('2024-01-03T09:15:00Z'),
      eventCount: 3,
      project: testProject,
    });

    // Create test exception linked to issue
    await exceptionRepository.save({
      environment: EventEnvironment.PRODUCTION,
      platform: EventPlatform.REACT,
      name: 'DatabaseConnectionError',
      message: 'Unable to connect to database',
      details: 'Connection timeout after 30 seconds',
      suggestion: 'Check database server status and network connectivity',
      issue: testIssue,
      project: testProject,
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
    it('should return 403 when no authentication token is provided for GET issues', () => {
      return request(app.getHttpServer())
        .get(
          `/api/v1/organizations/${testOrganization.id}/projects/${testProject.id}/issues`,
        )
        .expect(403);
    });

    it('should return 403 when no authentication token is provided for GET issue by ID', () => {
      return request(app.getHttpServer())
        .get(
          `/api/v1/organizations/${testOrganization.id}/projects/${testProject.id}/issues/${testIssue.id}`,
        )
        .expect(403);
    });

    it('should return 403 when no authentication token is provided for PUT issue status', () => {
      return request(app.getHttpServer())
        .put(
          `/api/v1/organizations/${testOrganization.id}/projects/${testProject.id}/issues/${testIssue.id}/status`,
        )
        .send({ status: IssueStatus.RESOLVED })
        .expect(403);
    });

    it('should return 403 when no authentication token is provided for PUT issue severity', () => {
      return request(app.getHttpServer())
        .put(
          `/api/v1/organizations/${testOrganization.id}/projects/${testProject.id}/issues/${testIssue.id}/severity`,
        )
        .send({ severity: IssueSeverity.HIGH })
        .expect(403);
    });

    it('should return 403 when invalid session token is provided', () => {
      return request(app.getHttpServer())
        .get(
          `/api/v1/organizations/${testOrganization.id}/projects/${testProject.id}/issues`,
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
          `/api/v1/organizations/${testOrganization.id}/projects/${testProject.id}/issues`,
        )
        .set('Cookie', `better-auth.session_token=${expiredSession.token}`)
        .expect(403);
    });
  });

  describe('Project Access Control', () => {
    it('should return 403 when user tries to access issues from organization they are not a member of', async () => {
      return authHelper
        .makeAuthenticatedRequest(
          'get',
          `/api/v1/organizations/${testOrganization.id}/projects/${testProject.id}/issues`,
          user2Cookies,
        )
        .expect(403)
        .expect((res) => {
          expect(res.body.error.message).toBe(
            "You don't have an access to this organization or this organization doesn't exist",
          );
        });
    });

    it('should return 403 when user tries to access issues from project they are not a member of', async () => {
      return authHelper
        .makeAuthenticatedRequest(
          'get',
          `/api/v1/organizations/${testOrganization2.id}/projects/${testProject2.id}/issues`,
          user1Cookies,
        )
        .expect(403)
        .expect((res) => {
          expect(res.body.error.message).toBe(
            "You don't have an access to this organization or this organization doesn't exist",
          );
        });
    });

    it('should return 403 when trying to access issues from non-existent project', async () => {
      const nonExistentProjectId = '604c0032-9556-4cf0-8fd2-b7c43cfedf04';

      return authHelper
        .makeAuthenticatedRequest(
          'get',
          `/api/v1/organizations/${testOrganization.id}/projects/${nonExistentProjectId}/issues`,
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
          `/api/v1/organizations/malformed-id/projects/${testProject.id}/issues`,
          user1Cookies,
        )
        .expect(400);
    });

    it('should return 400 when project ID is malformed', async () => {
      return authHelper
        .makeAuthenticatedRequest(
          'get',
          `/api/v1/organizations/${testOrganization.id}/projects/malformed-id/issues`,
          user1Cookies,
        )
        .expect(400);
    });
  });

  describe('Issue Listing', () => {
    it('should return paginated issues for authenticated user in their project', async () => {
      return authHelper
        .makeAuthenticatedRequest(
          'get',
          `/api/v1/organizations/${testOrganization.id}/projects/${testProject.id}/issues`,
          user1Cookies,
        )
        .expect(200)
        .expect((res) => {
          expect(res.body).toHaveProperty('items');
          expect(res.body).toHaveProperty('meta');
          expect(Array.isArray(res.body.items)).toBe(true);
          expect(res.body.items).toHaveLength(2);

          const issue = (res.body.items as { id: string }[]).find(
            (i: { id: string }) => i.id === testIssue.id,
          );
          expect(issue).toHaveProperty('id', testIssue.id);
          expect(issue).toHaveProperty(
            'name',
            'Critical Database Connection Error',
          );
          expect(issue).toHaveProperty('status', IssueStatus.OPEN);
          expect(issue).toHaveProperty('severity', IssueSeverity.CRITICAL);
          expect(issue).toHaveProperty('eventCount', '15');
          expect(issue).toHaveProperty('firstSeen');
          expect(issue).toHaveProperty('lastSeen');
          expect(issue).toHaveProperty('createdAt');
          expect(issue).toHaveProperty('updatedAt');
        });
    });

    it('should return empty data when project has no issues', async () => {
      // Clear issues
      await httpContextRepository.delete({});
      await exceptionRepository.delete({});
      await issueRepository.delete({});

      return authHelper
        .makeAuthenticatedRequest(
          'get',
          `/api/v1/organizations/${testOrganization.id}/projects/${testProject.id}/issues`,
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
      // Create additional issues
      for (let i = 0; i < 5; i++) {
        await issueRepository.save({
          name: `Test Issue ${i}`,
          status: IssueStatus.OPEN,
          severity: IssueSeverity.MEDIUM,
          firstSeen: new Date(),
          lastSeen: new Date(),
          eventCount: i + 1,
          project: testProject,
        });
      }

      return authHelper
        .makeAuthenticatedRequest(
          'get',
          `/api/v1/organizations/${testOrganization.id}/projects/${testProject.id}/issues?page=1&size=3`,
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
      // Create additional issue with later timestamp
      const newerIssue = await issueRepository.save({
        name: 'Newer Issue',
        status: IssueStatus.OPEN,
        severity: IssueSeverity.HIGH,
        firstSeen: new Date(),
        lastSeen: new Date(),
        eventCount: 1,
        project: testProject,
        createdAt: new Date(Date.now() + 1000),
      });

      return authHelper
        .makeAuthenticatedRequest(
          'get',
          `/api/v1/organizations/${testOrganization.id}/projects/${testProject.id}/issues`,
          user1Cookies,
        )
        .expect(200)
        .expect((res) => {
          expect(res.body.items).toHaveLength(3);
          expect(res.body.items[0].id).toBe(newerIssue.id);
        });
    });

    it('should support custom sorting parameters', async () => {
      return authHelper
        .makeAuthenticatedRequest(
          'get',
          `/api/v1/organizations/${testOrganization.id}/projects/${testProject.id}/issues?sort=name:ASC`,
          user1Cookies,
        )
        .expect(200)
        .expect((res) => {
          expect(res.body.items).toHaveLength(2);
          expect(res.body.items[0].name).toBe(
            'Critical Database Connection Error',
          );
          expect(res.body.items[1].name).toBe('Minor UI Rendering Issue');
        });
    });

    it('should support sorting by eventCount', async () => {
      return authHelper
        .makeAuthenticatedRequest(
          'get',
          `/api/v1/organizations/${testOrganization.id}/projects/${testProject.id}/issues?sort=eventCount:DESC`,
          user1Cookies,
        )
        .expect(200)
        .expect((res) => {
          expect(res.body.items).toHaveLength(2);
          expect(res.body.items[0].eventCount).toBe('15');
          expect(res.body.items[1].eventCount).toBe('3');
        });
    });

    it('should support sorting by severity', async () => {
      return authHelper
        .makeAuthenticatedRequest(
          'get',
          `/api/v1/organizations/${testOrganization.id}/projects/${testProject.id}/issues?sort=severity:DESC`,
          user1Cookies,
        )
        .expect(200)
        .expect((res) => {
          expect(res.body.items).toHaveLength(2);
          expect(res.body.items[0].severity).toBe(IssueSeverity.CRITICAL);
          expect(res.body.items[1].severity).toBe(IssueSeverity.LOW);
        });
    });

    it('should support filtering by status', async () => {
      return authHelper
        .makeAuthenticatedRequest(
          'get',
          `/api/v1/organizations/${testOrganization.id}/projects/${testProject.id}/issues?status=${IssueStatus.OPEN}`,
          user1Cookies,
        )
        .expect(200)
        .expect((res) => {
          expect(res.body.items).toHaveLength(1);
          expect(res.body.items[0].status).toBe(IssueStatus.OPEN);
        });
    });

    it('should support filtering by severity', async () => {
      return authHelper
        .makeAuthenticatedRequest(
          'get',
          `/api/v1/organizations/${testOrganization.id}/projects/${testProject.id}/issues?severity=${IssueSeverity.CRITICAL}`,
          user1Cookies,
        )
        .expect(200)
        .expect((res) => {
          expect(res.body.items).toHaveLength(1);
          expect(res.body.items[0].severity).toBe(IssueSeverity.CRITICAL);
        });
    });

    it('should support multiple filters simultaneously', async () => {
      return authHelper
        .makeAuthenticatedRequest(
          'get',
          `/api/v1/organizations/${testOrganization.id}/projects/${testProject.id}/issues?status=${IssueStatus.OPEN}&severity=${IssueSeverity.CRITICAL}`,
          user1Cookies,
        )
        .expect(200)
        .expect((res) => {
          expect(res.body.items).toHaveLength(1);
          expect(res.body.items[0].status).toBe(IssueStatus.OPEN);
          expect(res.body.items[0].severity).toBe(IssueSeverity.CRITICAL);
        });
    });
  });

  describe('Individual Issue Access', () => {
    it('should allow user to access specific issue in their project', async () => {
      return authHelper
        .makeAuthenticatedRequest(
          'get',
          `/api/v1/organizations/${testOrganization.id}/projects/${testProject.id}/issues/${testIssue.id}`,
          user1Cookies,
        )
        .expect(200)
        .expect((res) => {
          expect(res.body).toHaveProperty('id', testIssue.id);
          expect(res.body).toHaveProperty(
            'name',
            'Critical Database Connection Error',
          );
          expect(res.body).toHaveProperty('status', IssueStatus.OPEN);
          expect(res.body).toHaveProperty('severity', IssueSeverity.CRITICAL);
          expect(res.body).toHaveProperty('eventCount', '15');
          expect(res.body).toHaveProperty('firstSeen');
          expect(res.body).toHaveProperty('lastSeen');
          expect(res.body).toHaveProperty('createdAt');
          expect(res.body).toHaveProperty('updatedAt');
        });
    });

    it('should return 403 when trying to access issue from project user is not member of', async () => {
      return authHelper
        .makeAuthenticatedRequest(
          'get',
          `/api/v1/organizations/${testOrganization.id}/projects/${testProject.id}/issues/${testIssue.id}`,
          user2Cookies,
        )
        .expect(403);
    });

    it('should return 403 when trying to access non-existent issue', async () => {
      const nonExistentIssueId = '604c0032-9556-4cf0-8fd2-b7c43cfedf04';

      return authHelper
        .makeAuthenticatedRequest(
          'get',
          `/api/v1/organizations/${testOrganization.id}/projects/${testProject.id}/issues/${nonExistentIssueId}`,
          user1Cookies,
        )
        .expect(404)
        .expect((res) => {
          expect(res.body.error.message).toBe("Issue doesn't exist");
        });
    });

    it('should return 400 when issue ID is malformed', async () => {
      return authHelper
        .makeAuthenticatedRequest(
          'get',
          `/api/v1/organizations/${testOrganization.id}/projects/${testProject.id}/issues/malformed-id`,
          user1Cookies,
        )
        .expect(400);
    });
  });

  describe('Issue Status Management', () => {
    it('should allow user to change issue status from OPEN to RESOLVED', async () => {
      return authHelper
        .makeAuthenticatedRequest(
          'put',
          `/api/v1/organizations/${testOrganization.id}/projects/${testProject.id}/issues/${testIssue.id}/status`,
          user1Cookies,
        )
        .send({ status: IssueStatus.RESOLVED })
        .expect(200)
        .expect((res) => {
          expect(res.body).toHaveProperty('result', 'OK');
        });
    });

    it('should allow user to change issue status from RESOLVED to OPEN', async () => {
      return authHelper
        .makeAuthenticatedRequest(
          'put',
          `/api/v1/organizations/${testOrganization.id}/projects/${testProject.id}/issues/${testIssue2.id}/status`,
          user1Cookies,
        )
        .send({ status: IssueStatus.OPEN })
        .expect(200)
        .expect((res) => {
          expect(res.body).toHaveProperty('result', 'OK');
        });
    });

    it('should allow user to change issue status to IGNORED', async () => {
      return authHelper
        .makeAuthenticatedRequest(
          'put',
          `/api/v1/organizations/${testOrganization.id}/projects/${testProject.id}/issues/${testIssue.id}/status`,
          user1Cookies,
        )
        .send({ status: IssueStatus.IGNORED })
        .expect(200)
        .expect((res) => {
          expect(res.body).toHaveProperty('result', 'OK');
        });
    });

    it('should return 400 when status is missing', async () => {
      return authHelper
        .makeAuthenticatedRequest(
          'put',
          `/api/v1/organizations/${testOrganization.id}/projects/${testProject.id}/issues/${testIssue.id}/status`,
          user1Cookies,
        )
        .send({})
        .expect(400);
    });

    it('should return 400 when status is invalid', async () => {
      return authHelper
        .makeAuthenticatedRequest(
          'put',
          `/api/v1/organizations/${testOrganization.id}/projects/${testProject.id}/issues/${testIssue.id}/status`,
          user1Cookies,
        )
        .send({ status: 'INVALID_STATUS' })
        .expect(400);
    });

    it('should return 400 when status is empty', async () => {
      return authHelper
        .makeAuthenticatedRequest(
          'put',
          `/api/v1/organizations/${testOrganization.id}/projects/${testProject.id}/issues/${testIssue.id}/status`,
          user1Cookies,
        )
        .send({ status: '' })
        .expect(400);
    });

    it('should return 403 when user tries to change status of issue from project they are not member of', async () => {
      return authHelper
        .makeAuthenticatedRequest(
          'put',
          `/api/v1/organizations/${testOrganization.id}/projects/${testProject.id}/issues/${testIssue.id}/status`,
          user2Cookies,
        )
        .send({ status: IssueStatus.RESOLVED })
        .expect(403);
    });

    it('should return 404 when trying to change status of non-existent issue', async () => {
      const nonExistentIssueId = '604c0032-9556-4cf0-8fd2-b7c43cfedf04';

      return authHelper
        .makeAuthenticatedRequest(
          'put',
          `/api/v1/organizations/${testOrganization.id}/projects/${testProject.id}/issues/${nonExistentIssueId}/status`,
          user1Cookies,
        )
        .send({ status: IssueStatus.RESOLVED })
        .expect(404);
    });

    it('should persist status change', async () => {
      // Change status
      await authHelper
        .makeAuthenticatedRequest(
          'put',
          `/api/v1/organizations/${testOrganization.id}/projects/${testProject.id}/issues/${testIssue.id}/status`,
          user1Cookies,
        )
        .send({ status: IssueStatus.RESOLVED })
        .expect(200);

      // Verify the change persisted
      return authHelper
        .makeAuthenticatedRequest(
          'get',
          `/api/v1/organizations/${testOrganization.id}/projects/${testProject.id}/issues/${testIssue.id}`,
          user1Cookies,
        )
        .expect(200)
        .expect((res) => {
          expect(res.body.status).toBe(IssueStatus.RESOLVED);
        });
    });
  });

  describe('Issue Severity Management', () => {
    it('should allow user to change issue severity from CRITICAL to HIGH', async () => {
      return authHelper
        .makeAuthenticatedRequest(
          'put',
          `/api/v1/organizations/${testOrganization.id}/projects/${testProject.id}/issues/${testIssue.id}/severity`,
          user1Cookies,
        )
        .send({ severity: IssueSeverity.HIGH })
        .expect(200)
        .expect((res) => {
          expect(res.body).toHaveProperty('result', 'OK');
        });
    });

    it('should allow user to change issue severity from LOW to MEDIUM', async () => {
      return authHelper
        .makeAuthenticatedRequest(
          'put',
          `/api/v1/organizations/${testOrganization.id}/projects/${testProject.id}/issues/${testIssue2.id}/severity`,
          user1Cookies,
        )
        .send({ severity: IssueSeverity.MEDIUM })
        .expect(200)
        .expect((res) => {
          expect(res.body).toHaveProperty('result', 'OK');
        });
    });

    it('should support all severity levels', async () => {
      const severities = Object.values(IssueSeverity);

      for (const severity of severities) {
        await authHelper
          .makeAuthenticatedRequest(
            'put',
            `/api/v1/organizations/${testOrganization.id}/projects/${testProject.id}/issues/${testIssue.id}/severity`,
            user1Cookies,
          )
          .send({ severity })
          .expect(200);
      }
    });

    it('should return 400 when severity is missing', async () => {
      return authHelper
        .makeAuthenticatedRequest(
          'put',
          `/api/v1/organizations/${testOrganization.id}/projects/${testProject.id}/issues/${testIssue.id}/severity`,
          user1Cookies,
        )
        .send({})
        .expect(400);
    });

    it('should return 400 when severity is invalid', async () => {
      return authHelper
        .makeAuthenticatedRequest(
          'put',
          `/api/v1/organizations/${testOrganization.id}/projects/${testProject.id}/issues/${testIssue.id}/severity`,
          user1Cookies,
        )
        .send({ severity: 'INVALID_SEVERITY' })
        .expect(400);
    });

    it('should return 400 when severity is empty', async () => {
      return authHelper
        .makeAuthenticatedRequest(
          'put',
          `/api/v1/organizations/${testOrganization.id}/projects/${testProject.id}/issues/${testIssue.id}/severity`,
          user1Cookies,
        )
        .send({ severity: '' })
        .expect(400);
    });

    it('should return 403 when user tries to change severity of issue from project they are not member of', async () => {
      return authHelper
        .makeAuthenticatedRequest(
          'put',
          `/api/v1/organizations/${testOrganization.id}/projects/${testProject.id}/issues/${testIssue.id}/severity`,
          user2Cookies,
        )
        .send({ severity: IssueSeverity.HIGH })
        .expect(403);
    });

    it('should return 404 when trying to change severity of non-existent issue', async () => {
      const nonExistentIssueId = '604c0032-9556-4cf0-8fd2-b7c43cfedf04';

      return authHelper
        .makeAuthenticatedRequest(
          'put',
          `/api/v1/organizations/${testOrganization.id}/projects/${testProject.id}/issues/${nonExistentIssueId}/severity`,
          user1Cookies,
        )
        .send({ severity: IssueSeverity.HIGH })
        .expect(404);
    });

    it('should persist severity change', async () => {
      // Change severity
      await authHelper
        .makeAuthenticatedRequest(
          'put',
          `/api/v1/organizations/${testOrganization.id}/projects/${testProject.id}/issues/${testIssue.id}/severity`,
          user1Cookies,
        )
        .send({ severity: IssueSeverity.MEDIUM })
        .expect(200);

      // Verify the change persisted
      return authHelper
        .makeAuthenticatedRequest(
          'get',
          `/api/v1/organizations/${testOrganization.id}/projects/${testProject.id}/issues/${testIssue.id}`,
          user1Cookies,
        )
        .expect(200)
        .expect((res) => {
          expect(res.body.severity).toBe(IssueSeverity.MEDIUM);
        });
    });
  });

  describe('Issue Status and Severity Values', () => {
    it('should support all valid issue statuses', async () => {
      const statuses = Object.values(IssueStatus);

      for (let i = 0; i < statuses.length; i++) {
        const status = statuses[i];
        await issueRepository.save({
          name: `${status} Issue`,
          status: status,
          severity: IssueSeverity.MEDIUM,
          firstSeen: new Date(),
          lastSeen: new Date(),
          eventCount: 1,
          project: testProject,
        });
      }

      return authHelper
        .makeAuthenticatedRequest(
          'get',
          `/api/v1/organizations/${testOrganization.id}/projects/${testProject.id}/issues`,
          user1Cookies,
        )
        .expect(200)
        .expect((res) => {
          expect(res.body.items.length).toBeGreaterThanOrEqual(statuses.length);

          const data = res.body.items as Issue[];
          const foundStatuses = data.map((issue) => issue.status);
          statuses.forEach((status) => {
            expect(foundStatuses).toContain(status);
          });
        });
    });

    it('should support all valid issue severities', async () => {
      const severities = Object.values(IssueSeverity);

      for (let i = 0; i < severities.length; i++) {
        const severity = severities[i];
        await issueRepository.save({
          name: `${severity} Severity Issue`,
          status: IssueStatus.OPEN,
          severity: severity,
          firstSeen: new Date(),
          lastSeen: new Date(),
          eventCount: 1,
          project: testProject,
        });
      }

      return authHelper
        .makeAuthenticatedRequest(
          'get',
          `/api/v1/organizations/${testOrganization.id}/projects/${testProject.id}/issues`,
          user1Cookies,
        )
        .expect(200)
        .expect((res) => {
          expect(res.body.items.length).toBeGreaterThanOrEqual(
            severities.length,
          );

          const data = res.body.items as Issue[];
          const foundSeverities = data.map((issue) => issue.severity);
          severities.forEach((severity) => {
            expect(foundSeverities).toContain(severity);
          });
        });
    });
  });

  describe('Multiple Users and Organizations', () => {
    it('should prevent cross-access between users issues', async () => {
      // Create an issue in testOrganization2
      const issue2 = await issueRepository.save({
        name: 'User 2 Issue',
        status: IssueStatus.OPEN,
        severity: IssueSeverity.HIGH,
        firstSeen: new Date(),
        lastSeen: new Date(),
        eventCount: 1,
        project: testProject2,
      });

      // User 1 should not be able to access User 2's issue
      await authHelper
        .makeAuthenticatedRequest(
          'get',
          `/api/v1/organizations/${testOrganization2.id}/projects/${testProject2.id}/issues/${issue2.id}`,
          user1Cookies,
        )
        .expect(403);

      // User 2 should not be able to access User 1's issue
      await authHelper
        .makeAuthenticatedRequest(
          'get',
          `/api/v1/organizations/${testOrganization.id}/projects/${testProject.id}/issues/${testIssue.id}`,
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

      // Create an issue in testOrganization2
      const issue2 = await issueRepository.save({
        name: 'Multi-Org Issue',
        status: IssueStatus.OPEN,
        severity: IssueSeverity.MEDIUM,
        firstSeen: new Date(),
        lastSeen: new Date(),
        eventCount: 1,
        project: testProject2,
      });

      // User should now be able to access issues from both organizations
      await authHelper
        .makeAuthenticatedRequest(
          'get',
          `/api/v1/organizations/${testOrganization.id}/projects/${testProject.id}/issues`,
          user1Cookies,
        )
        .expect(200)
        .expect((res) => {
          expect(res.body.items.length).toBeGreaterThan(0);
        });

      await authHelper
        .makeAuthenticatedRequest(
          'get',
          `/api/v1/organizations/${testOrganization2.id}/projects/${testProject2.id}/issues/${issue2.id}`,
          user1Cookies,
        )
        .expect(200)
        .expect((res) => {
          expect(res.body.id).toBe(issue2.id);
        });
    });
  });

  describe('Edge Cases', () => {
    it('should handle very long issue names', async () => {
      const longName = 'A'.repeat(1000);
      const longIssue = await issueRepository.save({
        name: longName,
        status: IssueStatus.OPEN,
        severity: IssueSeverity.HIGH,
        firstSeen: new Date(),
        lastSeen: new Date(),
        eventCount: 1,
        project: testProject,
      });

      return authHelper
        .makeAuthenticatedRequest(
          'get',
          `/api/v1/organizations/${testOrganization.id}/projects/${testProject.id}/issues/${longIssue.id}`,
          user1Cookies,
        )
        .expect(200)
        .expect((res) => {
          expect(res.body.name).toBe(longName);
        });
    });

    it('should handle special characters in issue names', async () => {
      const specialIssue = await issueRepository.save({
        name: 'Issue with émojis 🐛 and spéçial chars & <html>',
        status: IssueStatus.OPEN,
        severity: IssueSeverity.MEDIUM,
        firstSeen: new Date(),
        lastSeen: new Date(),
        eventCount: 1,
        project: testProject,
      });

      return authHelper
        .makeAuthenticatedRequest(
          'get',
          `/api/v1/organizations/${testOrganization.id}/projects/${testProject.id}/issues/${specialIssue.id}`,
          user1Cookies,
        )
        .expect(200)
        .expect((res) => {
          expect(res.body.name).toBe(
            'Issue with émojis 🐛 and spéçial chars & <html>',
          );
        });
    });

    it('should handle malformed JSON in issue updates', () => {
      return request(app.getHttpServer())
        .put(
          `/api/v1/organizations/${testOrganization.id}/projects/${testProject.id}/issues/${testIssue.id}/status`,
        )
        .set('Cookie', user1Cookies[0])
        .send('{ invalid json }')
        .set('Content-Type', 'application/json')
        .expect(400);
    });

    it('should handle empty issue endpoints', () => {
      return request(app.getHttpServer())
        .get('/api/v1/organizations//projects//issues')
        .expect(404);
    });

    it('should handle large page size requests gracefully', async () => {
      return authHelper
        .makeAuthenticatedRequest(
          'get',
          `/api/v1/organizations/${testOrganization.id}/projects/${testProject.id}/issues?size=10000`,
          user1Cookies,
        )
        .expect(200)
        .expect((res) => {
          expect(res.body.items).toHaveLength(2); // Only two issues exist
        });
    });

    it('should handle issues with very high event counts', async () => {
      const highEventIssue = await issueRepository.save({
        name: 'High Traffic Issue',
        status: IssueStatus.OPEN,
        severity: IssueSeverity.CRITICAL,
        firstSeen: new Date(),
        lastSeen: new Date(),
        eventCount: 999999999,
        project: testProject,
      });

      return authHelper
        .makeAuthenticatedRequest(
          'get',
          `/api/v1/organizations/${testOrganization.id}/projects/${testProject.id}/issues/${highEventIssue.id}`,
          user1Cookies,
        )
        .expect(200)
        .expect((res) => {
          expect(res.body.eventCount).toBe('999999999');
        });
    });

    it('should handle issues with old timestamps', async () => {
      const oldIssue = await issueRepository.save({
        name: 'Old Issue',
        status: IssueStatus.RESOLVED,
        severity: IssueSeverity.LOW,
        firstSeen: new Date('2020-01-01T00:00:00Z'),
        lastSeen: new Date('2020-01-02T00:00:00Z'),
        eventCount: 1,
        project: testProject,
      });

      return authHelper
        .makeAuthenticatedRequest(
          'get',
          `/api/v1/organizations/${testOrganization.id}/projects/${testProject.id}/issues/${oldIssue.id}`,
          user1Cookies,
        )
        .expect(200)
        .expect((res) => {
          expect(res.body.firstSeen).toContain('2020-01-01');
          expect(res.body.lastSeen).toContain('2020-01-02');
        });
    });
  });
});
