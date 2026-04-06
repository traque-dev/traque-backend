import { INestApplication } from '@nestjs/common';
import { getRepositoryToken } from '@nestjs/typeorm';
import request from 'supertest';
import { App } from 'supertest/types';
import { Repository } from 'typeorm';

import { AuthHelper } from './auth/AuthHelper';
import { initNestTestApp } from './utils/initNestTestApp';
import { Account } from '../src/models/entity/Account.entity';
import { Feedback } from '../src/models/entity/Feedback.entity';
import { FeedbackActivity } from '../src/models/entity/FeedbackActivity.entity';
import { FeedbackComment } from '../src/models/entity/FeedbackComment.entity';
import { Member } from '../src/models/entity/Member.entity';
import { Organization } from '../src/models/entity/Organization.entity';
import { Project } from '../src/models/entity/Project.entity';
import { Session } from '../src/models/entity/Session.entity';
import { User } from '../src/models/entity/User.entity';
import { EventPlatform } from '../src/models/types/EventPlatform';
import { FeedbackPriority } from '../src/models/types/FeedbackPriority';
import { FeedbackSource } from '../src/models/types/FeedbackSource';
import { FeedbackStatus } from '../src/models/types/FeedbackStatus';
import { FeedbackType } from '../src/models/types/FeedbackType';

describe('FeedbackController (e2e)', () => {
  let app: INestApplication<App>;
  let authHelper: AuthHelper;

  let userRepository: Repository<User>;
  let organizationRepository: Repository<Organization>;
  let projectRepository: Repository<Project>;
  let memberRepository: Repository<Member>;
  let sessionRepository: Repository<Session>;
  let accountRepository: Repository<Account>;
  let feedbackRepository: Repository<Feedback>;
  let feedbackActivityRepository: Repository<FeedbackActivity>;
  let feedbackCommentRepository: Repository<FeedbackComment>;

  let testUser: User;
  let testUser2: User;
  let testOrganization: Organization;
  let testOrganization2: Organization;
  let testProject: Project;
  let testProject2: Project;
  let testFeedback: Feedback;

  let user1Cookies: string[];
  let user2Cookies: string[];

  const feedbackListUrl = () =>
    `/api/v1/organizations/${testOrganization.id}/projects/${testProject.id}/feedback`;

  const feedbackUrl = (feedbackId: string) =>
    `${feedbackListUrl()}/${feedbackId}`;

  const publicFeedbackUrl = (projectId: string) =>
    `/api/v1/projects/${projectId}/feedback`;

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
    feedbackRepository = moduleFixture.get<Repository<Feedback>>(
      getRepositoryToken(Feedback),
    );
    feedbackActivityRepository = moduleFixture.get<
      Repository<FeedbackActivity>
    >(getRepositoryToken(FeedbackActivity));
    feedbackCommentRepository = moduleFixture.get<Repository<FeedbackComment>>(
      getRepositoryToken(FeedbackComment),
    );
  });

  beforeEach(async () => {
    try {
      await feedbackCommentRepository.delete({});
      await feedbackActivityRepository.delete({});
      await feedbackRepository.delete({});
      await projectRepository.delete({});
      await memberRepository.delete({});
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
      authorizedUrls: ['https://example.com'],
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

    testFeedback = await feedbackRepository.save({
      title: 'Add dark mode support',
      description: 'Would love a dark mode option in settings',
      type: FeedbackType.FEATURE_REQUEST,
      status: FeedbackStatus.NEW,
      priority: FeedbackPriority.MEDIUM,
      source: FeedbackSource.DASHBOARD,
      project: testProject,
      reporter: testUser,
    });
  });

  afterAll(async () => {
    await feedbackCommentRepository.delete({});
    await feedbackActivityRepository.delete({});
    await feedbackRepository.delete({});
    await projectRepository.delete({});
    await memberRepository.delete({});
    await sessionRepository.delete({});
    await accountRepository.delete({});
    await userRepository.delete({});
    await organizationRepository.delete({});
    await app.close();
  });

  // ── Authentication & Authorization ──────────────────────────────────

  describe('Authentication and Authorization', () => {
    it('should return 403 when no auth token is provided for GET feedback', () => {
      return request(app.getHttpServer()).get(feedbackListUrl()).expect(403);
    });

    it('should return 403 when no auth token is provided for POST feedback', () => {
      return request(app.getHttpServer())
        .post(feedbackListUrl())
        .send({
          title: 'x',
          type: FeedbackType.IDEA,
          priority: FeedbackPriority.LOW,
        })
        .expect(403);
    });
  });

  // ── Feedback CRUD ────────────────────────────────────────────────────

  describe('Feedback Creation', () => {
    it('should create feedback with required fields', async () => {
      return authHelper
        .makeAuthenticatedRequest('post', feedbackListUrl(), user1Cookies)
        .send({
          title: 'New idea',
          type: FeedbackType.IDEA,
          priority: FeedbackPriority.LOW,
        })
        .expect(201)
        .expect((res) => {
          expect(res.body).toHaveProperty('id');
          expect(res.body.title).toBe('New idea');
          expect(res.body.type).toBe(FeedbackType.IDEA);
          expect(res.body.status).toBe(FeedbackStatus.NEW);
          expect(res.body.priority).toBe(FeedbackPriority.LOW);
          expect(res.body.source).toBe(FeedbackSource.DASHBOARD);
          expect(res.body.reporterId).toBe(testUser.id);
        });
    });

    it('should create feedback with optional description', async () => {
      return authHelper
        .makeAuthenticatedRequest('post', feedbackListUrl(), user1Cookies)
        .send({
          title: 'Idea with details',
          description: 'Here is more context',
          type: FeedbackType.IMPROVEMENT,
          priority: FeedbackPriority.HIGH,
        })
        .expect(201)
        .expect((res) => {
          expect(res.body.description).toBe('Here is more context');
        });
    });

    it('should return 400 when title is missing', async () => {
      return authHelper
        .makeAuthenticatedRequest('post', feedbackListUrl(), user1Cookies)
        .send({ type: FeedbackType.GENERAL, priority: FeedbackPriority.LOW })
        .expect(400);
    });

    it('should return 400 when type is missing', async () => {
      return authHelper
        .makeAuthenticatedRequest('post', feedbackListUrl(), user1Cookies)
        .send({ title: 'No type', priority: FeedbackPriority.LOW })
        .expect(400);
    });

    it('should return 400 when type is invalid', async () => {
      return authHelper
        .makeAuthenticatedRequest('post', feedbackListUrl(), user1Cookies)
        .send({
          title: 'Bad type',
          type: 'INVALID',
          priority: FeedbackPriority.LOW,
        })
        .expect(400);
    });

    it('should return 400 when priority is missing', async () => {
      return authHelper
        .makeAuthenticatedRequest('post', feedbackListUrl(), user1Cookies)
        .send({ title: 'No priority', type: FeedbackType.IDEA })
        .expect(400);
    });
  });

  describe('Feedback Listing', () => {
    it('should return paginated feedback', async () => {
      return authHelper
        .makeAuthenticatedRequest('get', feedbackListUrl(), user1Cookies)
        .expect(200)
        .expect((res) => {
          expect(res.body).toHaveProperty('items');
          expect(res.body).toHaveProperty('meta');
          expect(Array.isArray(res.body.items)).toBe(true);
          expect(res.body.items).toHaveLength(1);
          expect(res.body.items[0].id).toBe(testFeedback.id);
          expect(res.body.items[0].title).toBe('Add dark mode support');
        });
    });

    it('should support pagination parameters', async () => {
      for (let i = 0; i < 5; i++) {
        await feedbackRepository.save({
          title: `Feedback ${i}`,
          type: FeedbackType.GENERAL,
          status: FeedbackStatus.NEW,
          priority: FeedbackPriority.LOW,
          source: FeedbackSource.DASHBOARD,
          project: testProject,
          reporter: testUser,
        });
      }

      return authHelper
        .makeAuthenticatedRequest(
          'get',
          `${feedbackListUrl()}?page=1&size=3`,
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
      await feedbackRepository.save({
        title: 'Planned feature',
        type: FeedbackType.FEATURE_REQUEST,
        status: FeedbackStatus.PLANNED,
        priority: FeedbackPriority.HIGH,
        source: FeedbackSource.DASHBOARD,
        project: testProject,
        reporter: testUser,
      });

      return authHelper
        .makeAuthenticatedRequest(
          'get',
          `${feedbackListUrl()}?status=${FeedbackStatus.NEW}`,
          user1Cookies,
        )
        .expect(200)
        .expect((res) => {
          expect(res.body.items).toHaveLength(1);
          expect(res.body.items[0].status).toBe(FeedbackStatus.NEW);
        });
    });

    it('should filter by type', async () => {
      await feedbackRepository.save({
        title: 'General thought',
        type: FeedbackType.GENERAL,
        status: FeedbackStatus.NEW,
        priority: FeedbackPriority.LOW,
        source: FeedbackSource.DASHBOARD,
        project: testProject,
        reporter: testUser,
      });

      return authHelper
        .makeAuthenticatedRequest(
          'get',
          `${feedbackListUrl()}?type=${FeedbackType.FEATURE_REQUEST}`,
          user1Cookies,
        )
        .expect(200)
        .expect((res) => {
          expect(res.body.items).toHaveLength(1);
          expect(res.body.items[0].type).toBe(FeedbackType.FEATURE_REQUEST);
        });
    });

    it('should filter by source', async () => {
      await feedbackRepository.save({
        title: 'Public idea',
        type: FeedbackType.IDEA,
        status: FeedbackStatus.NEW,
        priority: FeedbackPriority.MEDIUM,
        source: FeedbackSource.PUBLIC,
        submitterName: 'Jane Doe',
        submitterEmail: 'jane@example.com',
        project: testProject,
      });

      return authHelper
        .makeAuthenticatedRequest(
          'get',
          `${feedbackListUrl()}?source=${FeedbackSource.PUBLIC}`,
          user1Cookies,
        )
        .expect(200)
        .expect((res) => {
          expect(res.body.items).toHaveLength(1);
          expect(res.body.items[0].source).toBe(FeedbackSource.PUBLIC);
        });
    });
  });

  describe('Individual Feedback Access', () => {
    it('should return feedback by ID', async () => {
      return authHelper
        .makeAuthenticatedRequest(
          'get',
          feedbackUrl(testFeedback.id),
          user1Cookies,
        )
        .expect(200)
        .expect((res) => {
          expect(res.body.id).toBe(testFeedback.id);
          expect(res.body.title).toBe('Add dark mode support');
          expect(res.body.type).toBe(FeedbackType.FEATURE_REQUEST);
          expect(res.body.status).toBe(FeedbackStatus.NEW);
          expect(res.body.reporterId).toBe(testUser.id);
          expect(res.body.reporterName).toBe('Test User');
          expect(res.body).toHaveProperty('createdAt');
          expect(res.body).toHaveProperty('updatedAt');
        });
    });

    it('should return 404 for non-existent feedback', async () => {
      const nonExistentId = '604c0032-9556-4cf0-8fd2-b7c43cfedf04';

      return authHelper
        .makeAuthenticatedRequest(
          'get',
          feedbackUrl(nonExistentId),
          user1Cookies,
        )
        .expect(404);
    });

    it('should return 400 for malformed feedback ID', async () => {
      return authHelper
        .makeAuthenticatedRequest(
          'get',
          feedbackUrl('malformed-id'),
          user1Cookies,
        )
        .expect(400);
    });
  });

  describe('Feedback Update', () => {
    it('should update feedback fields', async () => {
      return authHelper
        .makeAuthenticatedRequest(
          'patch',
          feedbackUrl(testFeedback.id),
          user1Cookies,
        )
        .send({ title: 'Updated title', description: 'Updated desc' })
        .expect(200)
        .expect((res) => {
          expect(res.body.title).toBe('Updated title');
          expect(res.body.description).toBe('Updated desc');
        });
    });

    it('should allow partial update', async () => {
      return authHelper
        .makeAuthenticatedRequest(
          'patch',
          feedbackUrl(testFeedback.id),
          user1Cookies,
        )
        .send({ description: 'Only description updated' })
        .expect(200)
        .expect((res) => {
          expect(res.body.description).toBe('Only description updated');
          expect(res.body.title).toBe('Add dark mode support');
        });
    });
  });

  describe('Feedback Deletion', () => {
    it('should delete feedback', async () => {
      await authHelper
        .makeAuthenticatedRequest(
          'delete',
          feedbackUrl(testFeedback.id),
          user1Cookies,
        )
        .expect(200)
        .expect((res) => {
          expect(res.body).toHaveProperty('result', 'OK');
        });

      return authHelper
        .makeAuthenticatedRequest(
          'get',
          feedbackUrl(testFeedback.id),
          user1Cookies,
        )
        .expect(404);
    });

    it('should return 404 when deleting non-existent feedback', async () => {
      const nonExistentId = '604c0032-9556-4cf0-8fd2-b7c43cfedf04';

      return authHelper
        .makeAuthenticatedRequest(
          'delete',
          feedbackUrl(nonExistentId),
          user1Cookies,
        )
        .expect(404);
    });
  });

  // ── Status & Priority ──────────────────────────────────────────────

  describe('Feedback Status Management', () => {
    it('should change feedback status', async () => {
      await authHelper
        .makeAuthenticatedRequest(
          'put',
          `${feedbackUrl(testFeedback.id)}/status`,
          user1Cookies,
        )
        .send({ status: FeedbackStatus.UNDER_REVIEW })
        .expect(200)
        .expect((res) => {
          expect(res.body).toHaveProperty('result', 'OK');
        });

      return authHelper
        .makeAuthenticatedRequest(
          'get',
          feedbackUrl(testFeedback.id),
          user1Cookies,
        )
        .expect(200)
        .expect((res) => {
          expect(res.body.status).toBe(FeedbackStatus.UNDER_REVIEW);
        });
    });

    it('should support all status values', async () => {
      for (const status of Object.values(FeedbackStatus)) {
        await authHelper
          .makeAuthenticatedRequest(
            'put',
            `${feedbackUrl(testFeedback.id)}/status`,
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
          `${feedbackUrl(testFeedback.id)}/status`,
          user1Cookies,
        )
        .send({ status: 'INVALID' })
        .expect(400);
    });

    it('should record activity when status changes', async () => {
      await authHelper
        .makeAuthenticatedRequest(
          'put',
          `${feedbackUrl(testFeedback.id)}/status`,
          user1Cookies,
        )
        .send({ status: FeedbackStatus.PLANNED })
        .expect(200);

      return authHelper
        .makeAuthenticatedRequest(
          'get',
          `${feedbackUrl(testFeedback.id)}/activities`,
          user1Cookies,
        )
        .expect(200)
        .expect((res) => {
          expect(res.body.items.length).toBeGreaterThan(0);
          const activity = res.body.items[0];
          expect(activity.type).toBe('STATUS_CHANGED');
          expect(activity.oldValue).toBe(FeedbackStatus.NEW);
          expect(activity.newValue).toBe(FeedbackStatus.PLANNED);
        });
    });
  });

  describe('Feedback Priority Management', () => {
    it('should change feedback priority', async () => {
      await authHelper
        .makeAuthenticatedRequest(
          'put',
          `${feedbackUrl(testFeedback.id)}/priority`,
          user1Cookies,
        )
        .send({ priority: FeedbackPriority.HIGH })
        .expect(200);

      return authHelper
        .makeAuthenticatedRequest(
          'get',
          feedbackUrl(testFeedback.id),
          user1Cookies,
        )
        .expect(200)
        .expect((res) => {
          expect(res.body.priority).toBe(FeedbackPriority.HIGH);
        });
    });

    it('should return 400 when priority is invalid', async () => {
      return authHelper
        .makeAuthenticatedRequest(
          'put',
          `${feedbackUrl(testFeedback.id)}/priority`,
          user1Cookies,
        )
        .send({ priority: 'INVALID' })
        .expect(400);
    });
  });

  // ── Assignee ────────────────────────────────────────────────────────

  describe('Feedback Assignment', () => {
    it('should assign a user to feedback', async () => {
      await authHelper
        .makeAuthenticatedRequest(
          'put',
          `${feedbackUrl(testFeedback.id)}/assignee`,
          user1Cookies,
        )
        .send({ assigneeId: testUser.id })
        .expect(200);

      return authHelper
        .makeAuthenticatedRequest(
          'get',
          feedbackUrl(testFeedback.id),
          user1Cookies,
        )
        .expect(200)
        .expect((res) => {
          expect(res.body.assigneeId).toBe(testUser.id);
          expect(res.body.assigneeName).toBe('Test User');
        });
    });

    it('should unassign by sending empty assigneeId', async () => {
      await feedbackRepository.update(testFeedback.id, {
        assignee: testUser,
      });

      await authHelper
        .makeAuthenticatedRequest(
          'put',
          `${feedbackUrl(testFeedback.id)}/assignee`,
          user1Cookies,
        )
        .send({})
        .expect(200);

      return authHelper
        .makeAuthenticatedRequest(
          'get',
          feedbackUrl(testFeedback.id),
          user1Cookies,
        )
        .expect(200)
        .expect((res) => {
          expect(res.body.assigneeId).toBeUndefined();
        });
    });
  });

  // ── Comments ────────────────────────────────────────────────────────

  describe('Feedback Comments', () => {
    const commentsUrl = (fId: string) => `${feedbackUrl(fId)}/comments`;

    it('should add a comment', async () => {
      return authHelper
        .makeAuthenticatedRequest(
          'post',
          commentsUrl(testFeedback.id),
          user1Cookies,
        )
        .send({ body: 'Great idea!' })
        .expect(201)
        .expect((res) => {
          expect(res.body.body).toBe('Great idea!');
          expect(res.body.authorId).toBe(testUser.id);
          expect(res.body.authorName).toBe('Test User');
          expect(res.body).toHaveProperty('id');
        });
    });

    it('should list comments', async () => {
      await feedbackCommentRepository.save({
        body: 'Existing comment',
        feedback: testFeedback,
        author: testUser,
      });

      return authHelper
        .makeAuthenticatedRequest(
          'get',
          commentsUrl(testFeedback.id),
          user1Cookies,
        )
        .expect(200)
        .expect((res) => {
          expect(res.body).toHaveProperty('items');
          expect(res.body.items).toHaveLength(1);
          expect(res.body.items[0].body).toBe('Existing comment');
        });
    });

    it('should update own comment', async () => {
      const comment = await feedbackCommentRepository.save({
        body: 'Original',
        feedback: testFeedback,
        author: testUser,
      });

      return authHelper
        .makeAuthenticatedRequest(
          'patch',
          `${commentsUrl(testFeedback.id)}/${comment.id}`,
          user1Cookies,
        )
        .send({ body: 'Edited' })
        .expect(200)
        .expect((res) => {
          expect(res.body.body).toBe('Edited');
        });
    });

    it('should delete own comment', async () => {
      const comment = await feedbackCommentRepository.save({
        body: 'To delete',
        feedback: testFeedback,
        author: testUser,
      });

      return authHelper
        .makeAuthenticatedRequest(
          'delete',
          `${commentsUrl(testFeedback.id)}/${comment.id}`,
          user1Cookies,
        )
        .expect(200)
        .expect((res) => {
          expect(res.body).toHaveProperty('result', 'OK');
        });
    });

    it('should add a threaded reply', async () => {
      const parent = await feedbackCommentRepository.save({
        body: 'Parent comment',
        feedback: testFeedback,
        author: testUser,
      });

      return authHelper
        .makeAuthenticatedRequest(
          'post',
          commentsUrl(testFeedback.id),
          user1Cookies,
        )
        .send({ body: 'Reply', parentId: parent.id })
        .expect(201)
        .expect((res) => {
          expect(res.body.body).toBe('Reply');
          expect(res.body.parentId).toBe(parent.id);
        });
    });

    it('should return 400 when body is empty', async () => {
      return authHelper
        .makeAuthenticatedRequest(
          'post',
          commentsUrl(testFeedback.id),
          user1Cookies,
        )
        .send({ body: '' })
        .expect(400);
    });
  });

  // ── Activity Log ────────────────────────────────────────────────────

  describe('Feedback Activity Log', () => {
    it('should return paginated activities', async () => {
      await authHelper
        .makeAuthenticatedRequest(
          'put',
          `${feedbackUrl(testFeedback.id)}/status`,
          user1Cookies,
        )
        .send({ status: FeedbackStatus.UNDER_REVIEW })
        .expect(200);

      await authHelper
        .makeAuthenticatedRequest(
          'put',
          `${feedbackUrl(testFeedback.id)}/priority`,
          user1Cookies,
        )
        .send({ priority: FeedbackPriority.HIGH })
        .expect(200);

      return authHelper
        .makeAuthenticatedRequest(
          'get',
          `${feedbackUrl(testFeedback.id)}/activities`,
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

  describe('Feedback Statistics', () => {
    it('should return counts by status, type and priority', async () => {
      await feedbackRepository.save({
        title: 'Completed feature',
        type: FeedbackType.FEATURE_REQUEST,
        status: FeedbackStatus.COMPLETED,
        priority: FeedbackPriority.HIGH,
        source: FeedbackSource.DASHBOARD,
        project: testProject,
        reporter: testUser,
      });

      return authHelper
        .makeAuthenticatedRequest(
          'get',
          `${feedbackListUrl()}/statistics`,
          user1Cookies,
        )
        .expect(200)
        .expect((res) => {
          expect(res.body).toHaveProperty('byStatus');
          expect(res.body).toHaveProperty('byType');
          expect(res.body).toHaveProperty('byPriority');
          expect(res.body.byStatus[FeedbackStatus.NEW]).toBe(1);
          expect(res.body.byStatus[FeedbackStatus.COMPLETED]).toBe(1);
          expect(res.body.byType[FeedbackType.FEATURE_REQUEST]).toBe(2);
          expect(res.body.byPriority[FeedbackPriority.MEDIUM]).toBe(1);
          expect(res.body.byPriority[FeedbackPriority.HIGH]).toBe(1);
        });
    });
  });

  // ── Public Submission ────────────────────────────────────────────────

  describe('Public Feedback Submission', () => {
    it('should accept public feedback without auth', async () => {
      return request(app.getHttpServer())
        .post(publicFeedbackUrl(testProject.id))
        .send({
          title: 'Public idea',
          type: FeedbackType.IDEA,
        })
        .expect(201)
        .expect((res) => {
          expect(res.body).toHaveProperty('result', 'OK');
        });
    });

    it('should store submitter name and email from public submission', async () => {
      await request(app.getHttpServer())
        .post(publicFeedbackUrl(testProject.id))
        .send({
          title: 'Named submission',
          type: FeedbackType.GENERAL,
          submitterName: 'Alice',
          submitterEmail: 'alice@example.com',
        })
        .expect(201);

      const saved = await feedbackRepository.findOne({
        where: { title: 'Named submission', project: { id: testProject.id } },
      });

      expect(saved).toBeDefined();
      expect(saved!.submitterName).toBe('Alice');
      expect(saved!.submitterEmail).toBe('alice@example.com');
      expect(saved!.source).toBe(FeedbackSource.PUBLIC);
    });

    it('should return 404 for unknown projectId on public route', async () => {
      return request(app.getHttpServer())
        .post(publicFeedbackUrl('604c0032-9556-4cf0-8fd2-b7c43cfedf04'))
        .send({ title: 'Lost feedback', type: FeedbackType.GENERAL })
        .expect(404);
    });

    it('should return 400 when type is missing on public route', async () => {
      return request(app.getHttpServer())
        .post(publicFeedbackUrl(testProject.id))
        .send({ title: 'No type' })
        .expect(400);
    });

    it('should return 400 when submitterEmail is invalid', async () => {
      return request(app.getHttpServer())
        .post(publicFeedbackUrl(testProject.id))
        .send({
          title: 'Bad email',
          type: FeedbackType.GENERAL,
          submitterEmail: 'not-an-email',
        })
        .expect(400);
    });
  });

  // ── Cross-org isolation ─────────────────────────────────────────────

  describe('Cross-organization Isolation', () => {
    it('should prevent user from accessing feedback of another org', async () => {
      return authHelper
        .makeAuthenticatedRequest('get', feedbackListUrl(), user2Cookies)
        .expect(403);
    });

    it('should prevent user from creating feedback in another org', async () => {
      return authHelper
        .makeAuthenticatedRequest('post', feedbackListUrl(), user2Cookies)
        .send({
          title: 'Sneaky feedback',
          type: FeedbackType.IDEA,
          priority: FeedbackPriority.LOW,
        })
        .expect(403);
    });
  });
});
