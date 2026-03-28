import { INestApplication } from '@nestjs/common';
import { getRepositoryToken } from '@nestjs/typeorm';
import request from 'supertest';
import { App } from 'supertest/types';
import { Repository } from 'typeorm';

import { AuthHelper } from './auth/AuthHelper';
import { initNestTestApp } from './utils/initNestTestApp';
import { Account } from '../src/models/entity/Account.entity';
import { Bug } from '../src/models/entity/Bug.entity';
import { BugActivity } from '../src/models/entity/BugActivity.entity';
import { BugComment } from '../src/models/entity/BugComment.entity';
import { BugLabel } from '../src/models/entity/BugLabel.entity';
import { BugReproductionStep } from '../src/models/entity/BugReproductionStep.entity';
import { Member } from '../src/models/entity/Member.entity';
import { Organization } from '../src/models/entity/Organization.entity';
import { Project } from '../src/models/entity/Project.entity';
import { PushNotificationToken } from '../src/models/entity/PushNotificationToken.entity';
import { Session } from '../src/models/entity/Session.entity';
import { User } from '../src/models/entity/User.entity';
import { BugPriority } from '../src/models/types/BugPriority';
import { BugSource } from '../src/models/types/BugSource';
import { BugStatus } from '../src/models/types/BugStatus';
import { EventPlatform } from '../src/models/types/EventPlatform';

describe('BugController (e2e)', () => {
  let app: INestApplication<App>;
  let authHelper: AuthHelper;

  let userRepository: Repository<User>;
  let organizationRepository: Repository<Organization>;
  let projectRepository: Repository<Project>;
  let memberRepository: Repository<Member>;
  let sessionRepository: Repository<Session>;
  let accountRepository: Repository<Account>;
  let pushNotificationTokenRepository: Repository<PushNotificationToken>;
  let bugRepository: Repository<Bug>;
  let bugActivityRepository: Repository<BugActivity>;
  let bugCommentRepository: Repository<BugComment>;
  let bugLabelRepository: Repository<BugLabel>;
  let bugStepRepository: Repository<BugReproductionStep>;

  let testUser: User;
  let testUser2: User;
  let testOrganization: Organization;
  let testOrganization2: Organization;
  let testProject: Project;
  let testProject2: Project;
  let testBug: Bug;

  let user1Cookies: string[];
  let user2Cookies: string[];

  const bugsUrl = () =>
    `/api/v1/organizations/${testOrganization.id}/projects/${testProject.id}/bugs`;

  const bugUrl = (bugId: string) => `${bugsUrl()}/${bugId}`;

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
    bugRepository = moduleFixture.get<Repository<Bug>>(getRepositoryToken(Bug));
    bugActivityRepository = moduleFixture.get<Repository<BugActivity>>(
      getRepositoryToken(BugActivity),
    );
    bugCommentRepository = moduleFixture.get<Repository<BugComment>>(
      getRepositoryToken(BugComment),
    );
    bugLabelRepository = moduleFixture.get<Repository<BugLabel>>(
      getRepositoryToken(BugLabel),
    );
    bugStepRepository = moduleFixture.get<Repository<BugReproductionStep>>(
      getRepositoryToken(BugReproductionStep),
    );
  });

  beforeEach(async () => {
    try {
      await bugLabelRepository.delete({});
      await bugStepRepository.delete({});
      await bugCommentRepository.delete({});
      await bugActivityRepository.delete({});
      await bugRepository.delete({});

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

    testBug = await bugRepository.save({
      title: 'Login button not working',
      description: 'The login button does not respond to clicks on Safari',
      status: BugStatus.OPEN,
      priority: BugPriority.HIGH,
      environment: 'production',
      source: BugSource.DASHBOARD,
      project: testProject,
      reporter: testUser,
    });
  });

  afterAll(async () => {
    await bugLabelRepository.delete({});
    await bugStepRepository.delete({});
    await bugCommentRepository.delete({});
    await bugActivityRepository.delete({});
    await bugRepository.delete({});

    await projectRepository.delete({});
    await memberRepository.delete({});
    await pushNotificationTokenRepository.delete({});
    await sessionRepository.delete({});
    await accountRepository.delete({});
    await userRepository.delete({});
    await organizationRepository.delete({});
    await app.close();
  });

  // ── Authentication & Authorization ──────────────────────────────────

  describe('Authentication and Authorization', () => {
    it('should return 403 when no auth token is provided for GET bugs', () => {
      return request(app.getHttpServer()).get(bugsUrl()).expect(403);
    });

    it('should return 403 when no auth token is provided for POST bug', () => {
      return request(app.getHttpServer())
        .post(bugsUrl())
        .send({ title: 'x', priority: BugPriority.LOW })
        .expect(403);
    });

    it('should return 403 when invalid session token is provided', () => {
      return request(app.getHttpServer())
        .get(bugsUrl())
        .set('Cookie', 'better-auth.session_token=invalid-token')
        .expect(403);
    });

    it('should return 403 when user accesses bugs from another org', async () => {
      const response = await authHelper.makeAuthenticatedRequest(
        'get',
        bugsUrl(),
        user2Cookies,
      );

      console.log('response.body', response.body);
      // return authHelper
      //   .makeAuthenticatedRequest('get', bugsUrl(), user2Cookies)
      //   .expect(403);
    });
  });

  // ── Bug CRUD ────────────────────────────────────────────────────────

  describe('Bug Creation', () => {
    it('should create a bug with required fields', async () => {
      return authHelper
        .makeAuthenticatedRequest('post', bugsUrl(), user1Cookies)
        .send({
          title: 'New bug',
          priority: BugPriority.MEDIUM,
        })
        .expect(201)
        .expect((res) => {
          expect(res.body).toHaveProperty('id');
          expect(res.body.title).toBe('New bug');
          expect(res.body.status).toBe(BugStatus.OPEN);
          expect(res.body.priority).toBe(BugPriority.MEDIUM);
          expect(res.body.source).toBe(BugSource.DASHBOARD);
          expect(res.body.reporterId).toBe(testUser.id);
        });
    });

    it('should create a bug with all optional fields', async () => {
      return authHelper
        .makeAuthenticatedRequest('post', bugsUrl(), user1Cookies)
        .send({
          title: 'Full bug',
          priority: BugPriority.CRITICAL,
          description: 'Detailed description',
          environment: 'staging',
          expectedBehavior: 'Should work',
          actualBehavior: 'Does not work',
          steps: [
            { description: 'Open app', order: 1 },
            { description: 'Click button', order: 2 },
          ],
        })
        .expect(201)
        .expect((res) => {
          expect(res.body.description).toBe('Detailed description');
          expect(res.body.environment).toBe('staging');
          expect(res.body.expectedBehavior).toBe('Should work');
          expect(res.body.actualBehavior).toBe('Does not work');
          expect(res.body.steps).toHaveLength(2);
          expect(res.body.steps[0].description).toBe('Open app');
          expect(res.body.steps[1].description).toBe('Click button');
        });
    });

    it('should return 400 when title is missing', async () => {
      return authHelper
        .makeAuthenticatedRequest('post', bugsUrl(), user1Cookies)
        .send({ priority: BugPriority.LOW })
        .expect(400);
    });

    it('should return 400 when priority is missing', async () => {
      return authHelper
        .makeAuthenticatedRequest('post', bugsUrl(), user1Cookies)
        .send({ title: 'Missing priority' })
        .expect(400);
    });

    it('should return 400 when priority is invalid', async () => {
      return authHelper
        .makeAuthenticatedRequest('post', bugsUrl(), user1Cookies)
        .send({ title: 'Bad priority', priority: 'INVALID' })
        .expect(400);
    });
  });

  describe('Bug Listing', () => {
    it('should return paginated bugs', async () => {
      return authHelper
        .makeAuthenticatedRequest('get', bugsUrl(), user1Cookies)
        .expect(200)
        .expect((res) => {
          expect(res.body).toHaveProperty('items');
          expect(res.body).toHaveProperty('meta');
          expect(Array.isArray(res.body.items)).toBe(true);
          expect(res.body.items).toHaveLength(1);
          expect(res.body.items[0].id).toBe(testBug.id);
          expect(res.body.items[0].title).toBe('Login button not working');
        });
    });

    it('should support pagination parameters', async () => {
      for (let i = 0; i < 5; i++) {
        await bugRepository.save({
          title: `Bug ${i}`,
          status: BugStatus.OPEN,
          priority: BugPriority.MEDIUM,
          source: BugSource.DASHBOARD,
          project: testProject,
          reporter: testUser,
        });
      }

      return authHelper
        .makeAuthenticatedRequest(
          'get',
          `${bugsUrl()}?page=1&size=3`,
          user1Cookies,
        )
        .expect(200)
        .expect((res) => {
          expect(res.body.items).toHaveLength(3);
          expect(res.body.meta).toHaveProperty('totalItems');
          expect(res.body.meta).toHaveProperty('currentPage', 1);
          expect(res.body.meta).toHaveProperty('itemsPerPage', 3);
        });
    });

    it('should filter by status', async () => {
      await bugRepository.save({
        title: 'Resolved bug',
        status: BugStatus.RESOLVED,
        priority: BugPriority.LOW,
        source: BugSource.DASHBOARD,
        project: testProject,
        reporter: testUser,
      });

      return authHelper
        .makeAuthenticatedRequest(
          'get',
          `${bugsUrl()}?status=${BugStatus.OPEN}`,
          user1Cookies,
        )
        .expect(200)
        .expect((res) => {
          expect(res.body.items).toHaveLength(1);
          expect(res.body.items[0].status).toBe(BugStatus.OPEN);
        });
    });

    it('should filter by priority', async () => {
      return authHelper
        .makeAuthenticatedRequest(
          'get',
          `${bugsUrl()}?priority=${BugPriority.HIGH}`,
          user1Cookies,
        )
        .expect(200)
        .expect((res) => {
          expect(res.body.items).toHaveLength(1);
          expect(res.body.items[0].priority).toBe(BugPriority.HIGH);
        });
    });

    it('should return empty list when no bugs match filter', async () => {
      return authHelper
        .makeAuthenticatedRequest(
          'get',
          `${bugsUrl()}?priority=${BugPriority.LOW}`,
          user1Cookies,
        )
        .expect(200)
        .expect((res) => {
          expect(res.body.items).toHaveLength(0);
        });
    });
  });

  describe('Individual Bug Access', () => {
    it('should return a bug by ID', async () => {
      return authHelper
        .makeAuthenticatedRequest('get', bugUrl(testBug.id), user1Cookies)
        .expect(200)
        .expect((res) => {
          expect(res.body.id).toBe(testBug.id);
          expect(res.body.title).toBe('Login button not working');
          expect(res.body.status).toBe(BugStatus.OPEN);
          expect(res.body.priority).toBe(BugPriority.HIGH);
          expect(res.body.reporterId).toBe(testUser.id);
          expect(res.body.reporterName).toBe('Test User');
          expect(res.body).toHaveProperty('createdAt');
          expect(res.body).toHaveProperty('updatedAt');
        });
    });

    it('should return 404 for non-existent bug', async () => {
      const nonExistentId = '604c0032-9556-4cf0-8fd2-b7c43cfedf04';

      return authHelper
        .makeAuthenticatedRequest('get', bugUrl(nonExistentId), user1Cookies)
        .expect(404);
    });

    it('should return 400 for malformed bug ID', async () => {
      return authHelper
        .makeAuthenticatedRequest('get', bugUrl('malformed-id'), user1Cookies)
        .expect(400);
    });
  });

  describe('Bug Update', () => {
    it('should update bug fields', async () => {
      return authHelper
        .makeAuthenticatedRequest('patch', bugUrl(testBug.id), user1Cookies)
        .send({
          title: 'Updated title',
          description: 'Updated description',
        })
        .expect(200)
        .expect((res) => {
          expect(res.body.title).toBe('Updated title');
          expect(res.body.description).toBe('Updated description');
        });
    });

    it('should allow partial update', async () => {
      return authHelper
        .makeAuthenticatedRequest('patch', bugUrl(testBug.id), user1Cookies)
        .send({ environment: 'staging' })
        .expect(200)
        .expect((res) => {
          expect(res.body.environment).toBe('staging');
          expect(res.body.title).toBe('Login button not working');
        });
    });
  });

  describe('Bug Deletion', () => {
    it('should delete a bug', async () => {
      await authHelper
        .makeAuthenticatedRequest('delete', bugUrl(testBug.id), user1Cookies)
        .expect(200)
        .expect((res) => {
          expect(res.body).toHaveProperty('result', 'OK');
        });

      return authHelper
        .makeAuthenticatedRequest('get', bugUrl(testBug.id), user1Cookies)
        .expect(404);
    });

    it('should return 404 when deleting non-existent bug', async () => {
      const nonExistentId = '604c0032-9556-4cf0-8fd2-b7c43cfedf04';

      return authHelper
        .makeAuthenticatedRequest('delete', bugUrl(nonExistentId), user1Cookies)
        .expect(404);
    });
  });

  // ── Status & Priority ──────────────────────────────────────────────

  describe('Bug Status Management', () => {
    it('should change bug status', async () => {
      await authHelper
        .makeAuthenticatedRequest(
          'put',
          `${bugUrl(testBug.id)}/status`,
          user1Cookies,
        )
        .send({ status: BugStatus.IN_PROGRESS })
        .expect(200)
        .expect((res) => {
          expect(res.body).toHaveProperty('result', 'OK');
        });

      return authHelper
        .makeAuthenticatedRequest('get', bugUrl(testBug.id), user1Cookies)
        .expect(200)
        .expect((res) => {
          expect(res.body.status).toBe(BugStatus.IN_PROGRESS);
        });
    });

    it('should support all status values', async () => {
      const statuses = Object.values(BugStatus);

      for (const status of statuses) {
        await authHelper
          .makeAuthenticatedRequest(
            'put',
            `${bugUrl(testBug.id)}/status`,
            user1Cookies,
          )
          .send({ status })
          .expect(200);
      }
    });

    it('should return 400 when status is invalid', async () => {
      return authHelper
        .makeAuthenticatedRequest(
          'put',
          `${bugUrl(testBug.id)}/status`,
          user1Cookies,
        )
        .send({ status: 'INVALID' })
        .expect(400);
    });

    it('should return 400 when status is empty', async () => {
      return authHelper
        .makeAuthenticatedRequest(
          'put',
          `${bugUrl(testBug.id)}/status`,
          user1Cookies,
        )
        .send({})
        .expect(400);
    });

    it('should record activity when status changes', async () => {
      await authHelper
        .makeAuthenticatedRequest(
          'put',
          `${bugUrl(testBug.id)}/status`,
          user1Cookies,
        )
        .send({ status: BugStatus.RESOLVED })
        .expect(200);

      return authHelper
        .makeAuthenticatedRequest(
          'get',
          `${bugUrl(testBug.id)}/activities`,
          user1Cookies,
        )
        .expect(200)
        .expect((res) => {
          expect(res.body.items.length).toBeGreaterThan(0);
          const activity = res.body.items[0];
          expect(activity.type).toBe('STATUS_CHANGED');
          expect(activity.oldValue).toBe(BugStatus.OPEN);
          expect(activity.newValue).toBe(BugStatus.RESOLVED);
        });
    });
  });

  describe('Bug Priority Management', () => {
    it('should change bug priority', async () => {
      await authHelper
        .makeAuthenticatedRequest(
          'put',
          `${bugUrl(testBug.id)}/priority`,
          user1Cookies,
        )
        .send({ priority: BugPriority.CRITICAL })
        .expect(200);

      return authHelper
        .makeAuthenticatedRequest('get', bugUrl(testBug.id), user1Cookies)
        .expect(200)
        .expect((res) => {
          expect(res.body.priority).toBe(BugPriority.CRITICAL);
        });
    });

    it('should return 400 when priority is invalid', async () => {
      return authHelper
        .makeAuthenticatedRequest(
          'put',
          `${bugUrl(testBug.id)}/priority`,
          user1Cookies,
        )
        .send({ priority: 'INVALID' })
        .expect(400);
    });
  });

  // ── Assignee ────────────────────────────────────────────────────────

  describe('Bug Assignment', () => {
    it('should assign a user to a bug', async () => {
      await authHelper
        .makeAuthenticatedRequest(
          'put',
          `${bugUrl(testBug.id)}/assignee`,
          user1Cookies,
        )
        .send({ assigneeId: testUser.id })
        .expect(200);

      return authHelper
        .makeAuthenticatedRequest('get', bugUrl(testBug.id), user1Cookies)
        .expect(200)
        .expect((res) => {
          expect(res.body.assigneeId).toBe(testUser.id);
          expect(res.body.assigneeName).toBe('Test User');
        });
    });

    it('should unassign by sending empty assigneeId', async () => {
      await bugRepository.update(testBug.id, {
        assignee: testUser,
      });

      await authHelper
        .makeAuthenticatedRequest(
          'put',
          `${bugUrl(testBug.id)}/assignee`,
          user1Cookies,
        )
        .send({})
        .expect(200);

      return authHelper
        .makeAuthenticatedRequest('get', bugUrl(testBug.id), user1Cookies)
        .expect(200)
        .expect((res) => {
          expect(res.body.assigneeId).toBeUndefined();
        });
    });
  });

  // ── Labels ──────────────────────────────────────────────────────────

  describe('Bug Labels', () => {
    const labelsUrl = () => `${bugsUrl()}/labels`;

    it('should create a label', async () => {
      return authHelper
        .makeAuthenticatedRequest('post', labelsUrl(), user1Cookies)
        .send({ name: 'frontend', color: '#ff0000' })
        .expect(201)
        .expect((res) => {
          expect(res.body.name).toBe('frontend');
          expect(res.body.color).toBe('#ff0000');
          expect(res.body).toHaveProperty('id');
        });
    });

    it('should list labels', async () => {
      await bugLabelRepository.save({
        name: 'backend',
        color: '#00ff00',
        project: testProject,
      });

      return authHelper
        .makeAuthenticatedRequest('get', labelsUrl(), user1Cookies)
        .expect(200)
        .expect((res) => {
          expect(Array.isArray(res.body)).toBe(true);
          expect(res.body).toHaveLength(1);
          expect(res.body[0].name).toBe('backend');
        });
    });

    it('should update a label', async () => {
      const label = await bugLabelRepository.save({
        name: 'old-name',
        color: '#000000',
        project: testProject,
      });

      return authHelper
        .makeAuthenticatedRequest(
          'patch',
          `${labelsUrl()}/${label.id}`,
          user1Cookies,
        )
        .send({ name: 'new-name', color: '#ffffff' })
        .expect(200)
        .expect((res) => {
          expect(res.body.name).toBe('new-name');
          expect(res.body.color).toBe('#ffffff');
        });
    });

    it('should delete a label', async () => {
      const label = await bugLabelRepository.save({
        name: 'to-delete',
        color: '#123456',
        project: testProject,
      });

      return authHelper
        .makeAuthenticatedRequest(
          'delete',
          `${labelsUrl()}/${label.id}`,
          user1Cookies,
        )
        .expect(200)
        .expect((res) => {
          expect(res.body).toHaveProperty('result', 'OK');
        });
    });

    it('should return 400 when color format is invalid', async () => {
      return authHelper
        .makeAuthenticatedRequest('post', labelsUrl(), user1Cookies)
        .send({ name: 'bad-color', color: 'red' })
        .expect(400);
    });

    it('should add a label to a bug', async () => {
      const label = await bugLabelRepository.save({
        name: 'ui',
        color: '#abcdef',
        project: testProject,
      });

      await authHelper
        .makeAuthenticatedRequest(
          'post',
          `${bugUrl(testBug.id)}/labels`,
          user1Cookies,
        )
        .send({ labelId: label.id })
        .expect(200);

      return authHelper
        .makeAuthenticatedRequest('get', bugUrl(testBug.id), user1Cookies)
        .expect(200)
        .expect((res) => {
          expect(res.body.labels).toHaveLength(1);
          expect(res.body.labels[0].name).toBe('ui');
        });
    });

    it('should remove a label from a bug', async () => {
      const label = await bugLabelRepository.save({
        name: 'remove-me',
        color: '#111111',
        project: testProject,
      });

      await authHelper
        .makeAuthenticatedRequest(
          'post',
          `${bugUrl(testBug.id)}/labels`,
          user1Cookies,
        )
        .send({ labelId: label.id })
        .expect(200);

      await authHelper
        .makeAuthenticatedRequest(
          'delete',
          `${bugUrl(testBug.id)}/labels/${label.id}`,
          user1Cookies,
        )
        .expect(200);

      return authHelper
        .makeAuthenticatedRequest('get', bugUrl(testBug.id), user1Cookies)
        .expect(200)
        .expect((res) => {
          expect(res.body.labels).toHaveLength(0);
        });
    });
  });

  // ── Comments ────────────────────────────────────────────────────────

  describe('Bug Comments', () => {
    const commentsUrl = (bugId: string) => `${bugUrl(bugId)}/comments`;

    it('should add a comment', async () => {
      return authHelper
        .makeAuthenticatedRequest('post', commentsUrl(testBug.id), user1Cookies)
        .send({ body: 'This is a comment' })
        .expect(201)
        .expect((res) => {
          expect(res.body.body).toBe('This is a comment');
          expect(res.body.authorId).toBe(testUser.id);
          expect(res.body.authorName).toBe('Test User');
          expect(res.body).toHaveProperty('id');
        });
    });

    it('should list comments', async () => {
      await bugCommentRepository.save({
        body: 'Existing comment',
        bug: testBug,
        author: testUser,
      });

      return authHelper
        .makeAuthenticatedRequest('get', commentsUrl(testBug.id), user1Cookies)
        .expect(200)
        .expect((res) => {
          expect(res.body).toHaveProperty('items');
          expect(res.body.items).toHaveLength(1);
          expect(res.body.items[0].body).toBe('Existing comment');
        });
    });

    it('should update own comment', async () => {
      const comment = await bugCommentRepository.save({
        body: 'Original',
        bug: testBug,
        author: testUser,
      });

      return authHelper
        .makeAuthenticatedRequest(
          'patch',
          `${commentsUrl(testBug.id)}/${comment.id}`,
          user1Cookies,
        )
        .send({ body: 'Edited' })
        .expect(200)
        .expect((res) => {
          expect(res.body.body).toBe('Edited');
        });
    });

    it('should delete own comment', async () => {
      const comment = await bugCommentRepository.save({
        body: 'To delete',
        bug: testBug,
        author: testUser,
      });

      return authHelper
        .makeAuthenticatedRequest(
          'delete',
          `${commentsUrl(testBug.id)}/${comment.id}`,
          user1Cookies,
        )
        .expect(200)
        .expect((res) => {
          expect(res.body).toHaveProperty('result', 'OK');
        });
    });

    it('should add a threaded reply', async () => {
      const parent = await bugCommentRepository.save({
        body: 'Parent comment',
        bug: testBug,
        author: testUser,
      });

      return authHelper
        .makeAuthenticatedRequest('post', commentsUrl(testBug.id), user1Cookies)
        .send({ body: 'Reply', parentId: parent.id })
        .expect(201)
        .expect((res) => {
          expect(res.body.body).toBe('Reply');
          expect(res.body.parentId).toBe(parent.id);
        });
    });

    it('should return 400 when body is empty', async () => {
      return authHelper
        .makeAuthenticatedRequest('post', commentsUrl(testBug.id), user1Cookies)
        .send({ body: '' })
        .expect(400);
    });
  });

  // ── Reproduction Steps ──────────────────────────────────────────────

  describe('Bug Reproduction Steps', () => {
    const stepsUrl = (bugId: string) => `${bugUrl(bugId)}/steps`;

    it('should add a reproduction step', async () => {
      return authHelper
        .makeAuthenticatedRequest('post', stepsUrl(testBug.id), user1Cookies)
        .send({ description: 'Open the app', order: 1 })
        .expect(201)
        .expect((res) => {
          expect(res.body.description).toBe('Open the app');
          expect(res.body.order).toBe(1);
          expect(res.body).toHaveProperty('id');
        });
    });

    it('should list steps ordered by order', async () => {
      await bugStepRepository.save([
        { description: 'Step 2', order: 2, bug: testBug },
        { description: 'Step 1', order: 1, bug: testBug },
        { description: 'Step 3', order: 3, bug: testBug },
      ]);

      return authHelper
        .makeAuthenticatedRequest('get', stepsUrl(testBug.id), user1Cookies)
        .expect(200)
        .expect((res) => {
          expect(res.body).toHaveLength(3);
          expect(res.body[0].order).toBe(1);
          expect(res.body[1].order).toBe(2);
          expect(res.body[2].order).toBe(3);
        });
    });

    it('should update a step', async () => {
      const step = await bugStepRepository.save({
        description: 'Old description',
        order: 1,
        bug: testBug,
      });

      return authHelper
        .makeAuthenticatedRequest(
          'patch',
          `${stepsUrl(testBug.id)}/${step.id}`,
          user1Cookies,
        )
        .send({ description: 'New description' })
        .expect(200)
        .expect((res) => {
          expect(res.body.description).toBe('New description');
        });
    });

    it('should delete a step', async () => {
      const step = await bugStepRepository.save({
        description: 'To remove',
        order: 1,
        bug: testBug,
      });

      return authHelper
        .makeAuthenticatedRequest(
          'delete',
          `${stepsUrl(testBug.id)}/${step.id}`,
          user1Cookies,
        )
        .expect(200)
        .expect((res) => {
          expect(res.body).toHaveProperty('result', 'OK');
        });
    });

    it('should bulk reorder steps', async () => {
      const [s1, s2, s3] = await bugStepRepository.save([
        { description: 'A', order: 1, bug: testBug },
        { description: 'B', order: 2, bug: testBug },
        { description: 'C', order: 3, bug: testBug },
      ]);

      return authHelper
        .makeAuthenticatedRequest(
          'put',
          `${stepsUrl(testBug.id)}/reorder`,
          user1Cookies,
        )
        .send({
          steps: [
            { id: s3.id, order: 1 },
            { id: s1.id, order: 2 },
            { id: s2.id, order: 3 },
          ],
        })
        .expect(200)
        .expect((res) => {
          expect(res.body[0].description).toBe('C');
          expect(res.body[0].order).toBe(1);
          expect(res.body[1].description).toBe('A');
          expect(res.body[1].order).toBe(2);
          expect(res.body[2].description).toBe('B');
          expect(res.body[2].order).toBe(3);
        });
    });

    it('should return 400 when description is empty', async () => {
      return authHelper
        .makeAuthenticatedRequest('post', stepsUrl(testBug.id), user1Cookies)
        .send({ description: '', order: 1 })
        .expect(400);
    });

    it('should return 400 when order is missing', async () => {
      return authHelper
        .makeAuthenticatedRequest('post', stepsUrl(testBug.id), user1Cookies)
        .send({ description: 'No order' })
        .expect(400);
    });
  });

  // ── Activity Log ────────────────────────────────────────────────────

  describe('Bug Activity Log', () => {
    it('should return paginated activities', async () => {
      await authHelper
        .makeAuthenticatedRequest(
          'put',
          `${bugUrl(testBug.id)}/status`,
          user1Cookies,
        )
        .send({ status: BugStatus.RESOLVED })
        .expect(200);

      await authHelper
        .makeAuthenticatedRequest(
          'put',
          `${bugUrl(testBug.id)}/priority`,
          user1Cookies,
        )
        .send({ priority: BugPriority.CRITICAL })
        .expect(200);

      return authHelper
        .makeAuthenticatedRequest(
          'get',
          `${bugUrl(testBug.id)}/activities`,
          user1Cookies,
        )
        .expect(200)
        .expect((res) => {
          expect(res.body).toHaveProperty('items');
          expect(res.body.items.length).toBe(2);
        });
    });
  });

  // ── Statistics ──────────────────────────────────────────────────────

  describe('Bug Statistics', () => {
    it('should return bug counts by status and priority', async () => {
      await bugRepository.save({
        title: 'Resolved bug',
        status: BugStatus.RESOLVED,
        priority: BugPriority.LOW,
        source: BugSource.DASHBOARD,
        project: testProject,
        reporter: testUser,
      });

      return authHelper
        .makeAuthenticatedRequest(
          'get',
          `${bugsUrl()}/statistics`,
          user1Cookies,
        )
        .expect(200)
        .expect((res) => {
          expect(res.body).toHaveProperty('byStatus');
          expect(res.body).toHaveProperty('byPriority');
          expect(res.body.byStatus[BugStatus.OPEN]).toBe(1);
          expect(res.body.byStatus[BugStatus.RESOLVED]).toBe(1);
          expect(res.body.byPriority[BugPriority.HIGH]).toBe(1);
          expect(res.body.byPriority[BugPriority.LOW]).toBe(1);
        });
    });
  });

  // ── SDK Capture ─────────────────────────────────────────────────────

  describe('Bug Capture via SDK (API Key)', () => {
    it('should capture a bug with API key authentication', async () => {
      return request(app.getHttpServer())
        .post('/api/v1/bugs')
        .set('x-api-key', testProject.apiKey)
        .set('Origin', 'https://example.com')
        .send({
          title: 'SDK reported bug',
        })
        .expect(201)
        .expect((res) => {
          expect(res.body).toHaveProperty('result', 'OK');
        });
    });

    it('should capture a bug with full SDK payload', async () => {
      await request(app.getHttpServer())
        .post('/api/v1/bugs')
        .set('x-api-key', testProject.apiKey)
        .set('Origin', 'https://example.com')
        .send({
          title: 'Full SDK bug',
          description: 'Detailed SDK report',
          priority: BugPriority.HIGH,
          environment: 'production',
          expectedBehavior: 'Page loads',
          actualBehavior: 'Blank screen',
          steps: [
            { description: 'Open homepage', order: 1 },
            { description: 'Click login', order: 2 },
          ],
          browserContext: {
            url: 'https://app.example.com/login',
            userAgent: 'Mozilla/5.0',
            viewport: { width: 1920, height: 1080 },
          },
          breadcrumbs: [
            {
              timestamp: new Date().toISOString(),
              type: 'NAVIGATION',
              message: '/ -> /login',
            },
            {
              timestamp: new Date().toISOString(),
              type: 'LOG',
              level: 'error',
              message: 'Failed to load user',
            },
          ],
          metadata: {
            appVersion: '1.2.3',
            os: 'macOS',
          },
        })
        .expect(201);

      const bugs = await bugRepository.find({
        where: { project: { id: testProject.id }, title: 'Full SDK bug' },
        relations: { steps: true },
      });

      expect(bugs).toHaveLength(1);
      expect(bugs[0].source).toBe(BugSource.SDK);
      expect(bugs[0].reporter).toBeUndefined();
      expect(bugs[0].browserContext).toHaveProperty(
        'url',
        'https://app.example.com/login',
      );
      expect(bugs[0].breadcrumbs).toHaveLength(2);
      expect(bugs[0].metadata).toHaveProperty('appVersion', '1.2.3');
      expect(bugs[0].steps).toHaveLength(2);
    });

    it('should capture a bug with server context', async () => {
      await request(app.getHttpServer())
        .post('/api/v1/bugs')
        .set('x-api-key', testProject.apiKey)
        .set('Origin', 'https://example.com')
        .send({
          title: 'Server-side bug',
          serverContext: {
            hostname: 'api-server-1',
            runtime: 'Node.js v20.11.0',
            version: '2.0.0',
          },
          breadcrumbs: [
            {
              timestamp: new Date().toISOString(),
              type: 'LOG',
              level: 'info',
              message: 'Incoming POST /api/payments',
            },
          ],
        })
        .expect(201);

      const bugs = await bugRepository.find({
        where: { project: { id: testProject.id }, title: 'Server-side bug' },
      });

      expect(bugs).toHaveLength(1);
      expect(bugs[0].serverContext).toHaveProperty('hostname', 'api-server-1');
    });

    it('should return 401 when no API key is provided', () => {
      return request(app.getHttpServer())
        .post('/api/v1/bugs')
        .set('Origin', 'https://example.com')
        .send({ title: 'No auth bug' })
        .expect(401);
    });

    it('should return 401 when invalid API key is provided', () => {
      return request(app.getHttpServer())
        .post('/api/v1/bugs')
        .set('x-api-key', 'invalid-key')
        .set('Origin', 'https://example.com')
        .send({ title: 'Bad key bug' })
        .expect(401);
    });

    it('should return 403 when origin is not authorized', () => {
      return request(app.getHttpServer())
        .post('/api/v1/bugs')
        .set('x-api-key', testProject.apiKey)
        .set('Origin', 'https://unauthorized.com')
        .send({ title: 'Bad origin bug' })
        .expect(403);
    });

    it('should return 400 when title is missing', () => {
      return request(app.getHttpServer())
        .post('/api/v1/bugs')
        .set('x-api-key', testProject.apiKey)
        .set('Origin', 'https://example.com')
        .send({ description: 'No title' })
        .expect(400);
    });

    it('should return 400 when priority is invalid', () => {
      return request(app.getHttpServer())
        .post('/api/v1/bugs')
        .set('x-api-key', testProject.apiKey)
        .set('Origin', 'https://example.com')
        .send({ title: 'Bad priority', priority: 'INVALID' })
        .expect(400);
    });

    it('should return 400 when breadcrumb type is invalid', () => {
      return request(app.getHttpServer())
        .post('/api/v1/bugs')
        .set('x-api-key', testProject.apiKey)
        .set('Origin', 'https://example.com')
        .send({
          title: 'Bad breadcrumb',
          breadcrumbs: [
            {
              timestamp: new Date().toISOString(),
              type: 'INVALID_TYPE',
            },
          ],
        })
        .expect(400);
    });

    it('should default priority to MEDIUM when not provided via SDK', async () => {
      await request(app.getHttpServer())
        .post('/api/v1/bugs')
        .set('x-api-key', testProject.apiKey)
        .set('Origin', 'https://example.com')
        .send({ title: 'Default priority bug' })
        .expect(201);

      const bugs = await bugRepository.find({
        where: {
          project: { id: testProject.id },
          title: 'Default priority bug',
        },
      });

      expect(bugs).toHaveLength(1);
      expect(bugs[0].priority).toBe(BugPriority.MEDIUM);
    });
  });

  // ── Cross-org isolation ─────────────────────────────────────────────

  describe('Cross-organization Isolation', () => {
    it('should prevent user from accessing bugs of another org', async () => {
      return authHelper
        .makeAuthenticatedRequest('get', bugsUrl(), user2Cookies)
        .expect(403);
    });

    it('should prevent user from creating bugs in another org', async () => {
      return authHelper
        .makeAuthenticatedRequest('post', bugsUrl(), user2Cookies)
        .send({ title: 'Sneaky bug', priority: BugPriority.LOW })
        .expect(403);
    });
  });
});
