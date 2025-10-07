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
import { Project } from '../src/models/entity/Project.entity';
import { PushNotificationToken } from '../src/models/entity/PushNotificationToken.entity';
import { Session } from '../src/models/entity/Session.entity';
import { User } from '../src/models/entity/User.entity';
import { EventPlatform } from '../src/models/types/EventPlatform';

describe('ProjectController (e2e)', () => {
  let app: INestApplication<App>;
  let authHelper: AuthHelper;

  let userRepository: Repository<User>;
  let organizationRepository: Repository<Organization>;
  let projectRepository: Repository<Project>;
  let memberRepository: Repository<Member>;
  let sessionRepository: Repository<Session>;
  let accountRepository: Repository<Account>;
  let pushNotificationTokenRepository: Repository<PushNotificationToken>;

  let testUser: User;
  let testUser2: User;
  let testOrganization: Organization;
  let testOrganization2: Organization;
  let testProject: Project;
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
  });

  beforeEach(async () => {
    // Clear all data in correct order to respect foreign key constraints
    try {
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

    // Create a test project
    const project = projectRepository.create({
      name: 'Test Project',
      description: 'Test project description',
      platform: EventPlatform.REACT,
      slug: 'test-project',
      apiKey: 'test-api-key-123',
      organization: testOrganization,
      authorizedUrls: ['https://example.com', 'https://test.com'],
    });
    testProject = await projectRepository.save(project);
  });

  afterAll(async () => {
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
    it('should return 403 when no authentication token is provided for GET /v1/organizations/:orgId/projects', () => {
      return request(app.getHttpServer())
        .get(`/api/v1/organizations/${testOrganization.id}/projects`)
        .expect(403);
    });

    it('should return 403 when no authentication token is provided for GET /v1/organizations/:orgId/projects/:projectId', () => {
      return request(app.getHttpServer())
        .get(
          `/api/v1/organizations/${testOrganization.id}/projects/${testProject.id}`,
        )
        .expect(403);
    });

    it('should return 403 when no authentication token is provided for POST /v1/organizations/:orgId/projects', () => {
      return request(app.getHttpServer())
        .post(`/api/v1/organizations/${testOrganization.id}/projects`)
        .send({
          name: 'New Project',
          description: 'New project description',
          platform: EventPlatform.NODE_JS,
        })
        .expect(403);
    });

    it('should return 403 when invalid session token is provided', () => {
      return request(app.getHttpServer())
        .get(`/api/v1/organizations/${testOrganization.id}/projects`)
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
        .get(`/api/v1/organizations/${testOrganization.id}/projects`)
        .set('Cookie', `better-auth.session_token=${expiredSession.token}`)
        .expect(403);
    });
  });

  describe('Organization Access Control', () => {
    it('should return 403 when user tries to access projects from organization they are not a member of', async () => {
      // Use testUser2 who is not a member of testOrganization
      return authHelper
        .makeAuthenticatedRequest(
          'get',
          `/api/v1/organizations/${testOrganization.id}/projects`,
          user2Cookies,
        )
        .expect(403)
        .expect((res) => {
          expect(res.body.error.message).toBe(
            "You don't have an access to this organization or this organization doesn't exist",
          );
        });
    });

    it('should return 403 when trying to access project from non-existent organization', async () => {
      const nonExistentOrgId = '604c0032-9556-4cf0-8fd2-b7c43cfedf04';

      return authHelper
        .makeAuthenticatedRequest(
          'get',
          `/api/v1/organizations/${nonExistentOrgId}/projects`,
          user1Cookies,
        )
        .expect(403)
        .expect((res) => {
          expect(res.body.error.message).toBe(
            "You don't have an access to this organization or this organization doesn't exist",
          );
        });
    });

    it('should return 400 when organization ID is malformed', async () => {
      return authHelper
        .makeAuthenticatedRequest(
          'get',
          '/api/v1/organizations/malformed-id/projects',
          user1Cookies,
        )
        .expect(400);
    });
  });

  describe('Project Access Control', () => {
    it('should return 403 when user tries to access specific project from organization they are not a member of', async () => {
      return authHelper
        .makeAuthenticatedRequest(
          'get',
          `/api/v1/organizations/${testOrganization.id}/projects/${testProject.id}`,
          user2Cookies,
        )
        .expect(403)
        .expect((res) => {
          expect(res.body.error.message).toBe(
            "You don't have an access to this organization or this organization doesn't exist",
          );
        });
    });

    it('should return 403 when trying to access non-existent project', async () => {
      const nonExistentProjectId = '604c0032-9556-4cf0-8fd2-b7c43cfedf04';

      return authHelper
        .makeAuthenticatedRequest(
          'get',
          `/api/v1/organizations/${testOrganization.id}/projects/${nonExistentProjectId}`,
          user1Cookies,
        )
        .expect(403)
        .expect((res) => {
          expect(res.body.error.message).toBe(
            "You don't have an access to this project or project doesn't exist",
          );
        });
    });

    it('should return 400 when project ID is malformed', async () => {
      return authHelper
        .makeAuthenticatedRequest(
          'get',
          `/api/v1/organizations/${testOrganization.id}/projects/malformed-id`,
          user1Cookies,
        )
        .expect(400);
    });
  });

  describe('Project Listing', () => {
    it('should return all projects for authenticated user in their organization', async () => {
      return authHelper
        .makeAuthenticatedRequest(
          'get',
          `/api/v1/organizations/${testOrganization.id}/projects`,
          user1Cookies,
        )
        .expect(200)
        .expect((res) => {
          expect(Array.isArray(res.body)).toBe(true);
          expect(res.body).toHaveLength(1);
          expect(res.body[0]).toHaveProperty('id', testProject.id);
          expect(res.body[0]).toHaveProperty('name', 'Test Project');
          expect(res.body[0]).toHaveProperty(
            'description',
            'Test project description',
          );
          expect(res.body[0]).toHaveProperty('platform', EventPlatform.REACT);
          expect(res.body[0]).toHaveProperty('slug', 'test-project');
          expect(res.body[0]).toHaveProperty('apiKey', 'test-api-key-123');
          expect(res.body[0]).toHaveProperty('createdAt');
          expect(res.body[0]).toHaveProperty('updatedAt');
        });
    });

    it('should return empty array when organization has no projects', async () => {
      return authHelper
        .makeAuthenticatedRequest(
          'get',
          `/api/v1/organizations/${testOrganization2.id}/projects`,
          user2Cookies,
        )
        .expect(200)
        .expect((res) => {
          expect(Array.isArray(res.body)).toBe(true);
          expect(res.body).toHaveLength(0);
        });
    });

    it('should return multiple projects when organization has multiple projects', async () => {
      // Create additional projects
      const project2 = projectRepository.create({
        name: 'Test Project 2',
        description: 'Second test project',
        platform: EventPlatform.NODE_JS,
        slug: 'test-project-2',
        apiKey: 'test-api-key-456',
        organization: testOrganization,
      });
      await projectRepository.save(project2);

      const project3 = projectRepository.create({
        name: 'Test Project 3',
        description: 'Third test project',
        platform: EventPlatform.PYTHON,
        slug: 'test-project-3',
        apiKey: 'test-api-key-789',
        organization: testOrganization,
      });
      await projectRepository.save(project3);

      return authHelper
        .makeAuthenticatedRequest(
          'get',
          `/api/v1/organizations/${testOrganization.id}/projects`,
          user1Cookies,
        )
        .expect(200)
        .expect((res) => {
          expect(Array.isArray(res.body)).toBe(true);
          expect(res.body).toHaveLength(3);

          const projectNames = (res.body as Project[]).map((p) => p.name);
          expect(projectNames).toContain('Test Project');
          expect(projectNames).toContain('Test Project 2');
          expect(projectNames).toContain('Test Project 3');
        });
    });
  });

  describe('Individual Project Access', () => {
    it('should allow user to access specific project in their organization', async () => {
      return authHelper
        .makeAuthenticatedRequest(
          'get',
          `/api/v1/organizations/${testOrganization.id}/projects/${testProject.id}`,
          user1Cookies,
        )
        .expect(200)
        .expect((res) => {
          expect(res.body).toHaveProperty('id', testProject.id);
          expect(res.body).toHaveProperty('name', 'Test Project');
          expect(res.body).toHaveProperty(
            'description',
            'Test project description',
          );
          expect(res.body).toHaveProperty('platform', EventPlatform.REACT);
          expect(res.body).toHaveProperty('slug', 'test-project');
          expect(res.body).toHaveProperty('apiKey', 'test-api-key-123');
          expect(res.body).toHaveProperty('createdAt');
          expect(res.body).toHaveProperty('updatedAt');
        });
    });

    it('should handle project with minimal fields', async () => {
      const minimalProject = projectRepository.create({
        name: 'Minimal Project',
        apiKey: 'minimal-api-key',
        organization: testOrganization,
      });
      const savedProject = await projectRepository.save(minimalProject);

      return authHelper
        .makeAuthenticatedRequest(
          'get',
          `/api/v1/organizations/${testOrganization.id}/projects/${savedProject.id}`,
          user1Cookies,
        )
        .expect(200)
        .expect((res) => {
          expect(res.body).toHaveProperty('id', savedProject.id);
          expect(res.body).toHaveProperty('name', 'Minimal Project');
          expect(res.body).toHaveProperty('apiKey', 'minimal-api-key');
          expect(res.body.description).toBeNull();
          expect(res.body.platform).toBeNull();
          expect(res.body.slug).toBeNull();
        });
    });
  });

  describe('Project Creation', () => {
    it('should create project with all fields', async () => {
      const projectData = {
        name: 'New Full Project',
        description: 'A complete project with all fields',
        platform: EventPlatform.NEXT_JS,
        slug: 'new-full-project',
      };

      return authHelper
        .makeAuthenticatedRequest(
          'post',
          `/api/v1/organizations/${testOrganization.id}/projects`,
          user1Cookies,
        )
        .send(projectData)
        .expect(201)
        .expect((res) => {
          expect(res.body).toHaveProperty('name', projectData.name);
          expect(res.body).toHaveProperty(
            'description',
            projectData.description,
          );
          expect(res.body).toHaveProperty('platform', projectData.platform);
          expect(res.body).toHaveProperty('slug', projectData.slug);
          expect(res.body).toHaveProperty('apiKey');
          expect(res.body.apiKey).toMatch(/^trq_/); // Check API key format
          expect(res.body).toHaveProperty('id');
          expect(res.body).toHaveProperty('createdAt');
          expect(res.body).toHaveProperty('updatedAt');
        });
    });

    it('should create project with minimal required fields', async () => {
      const projectData = {
        name: 'Minimal New Project',
      };

      return authHelper
        .makeAuthenticatedRequest(
          'post',
          `/api/v1/organizations/${testOrganization.id}/projects`,
          user1Cookies,
        )
        .send(projectData)
        .expect(201)
        .expect((res) => {
          console.log('RES', res.body);
          expect(res.body).toHaveProperty('name', projectData.name);
          expect(res.body).toHaveProperty('apiKey');
          expect(res.body.apiKey).toMatch(/^trq_/);
          expect(res.body).toHaveProperty('id');
          expect(res.body.description).toBeNull();
          expect(res.body.platform).toBeNull();
          expect(res.body.slug).toBeNull();
        });
    });

    it('should create project with each supported platform', async () => {
      const platforms = Object.values(EventPlatform);

      for (const platform of platforms) {
        const projectData = {
          name: `${platform} Project`,
          description: `Project for ${platform} platform`,
          platform: platform,
          slug: `${platform.toLowerCase()}-project`,
        };

        await authHelper
          .makeAuthenticatedRequest(
            'post',
            `/api/v1/organizations/${testOrganization.id}/projects`,
            user1Cookies,
          )
          .send(projectData)
          .expect(201)
          .expect((res) => {
            expect(res.body).toHaveProperty('platform', platform);
            expect(res.body).toHaveProperty('name', projectData.name);
          });
      }
    });

    it('should generate unique API keys for each project', async () => {
      const projectData1 = { name: 'Project 1' };
      const projectData2 = { name: 'Project 2' };

      const response1 = await authHelper
        .makeAuthenticatedRequest(
          'post',
          `/api/v1/organizations/${testOrganization.id}/projects`,
          user1Cookies,
        )
        .send(projectData1)
        .expect(201);

      const response2 = await authHelper
        .makeAuthenticatedRequest(
          'post',
          `/api/v1/organizations/${testOrganization.id}/projects`,
          user1Cookies,
        )
        .send(projectData2)
        .expect(201);

      expect(response1.body.apiKey).not.toBe(response2.body.apiKey);
      expect(response1.body.apiKey).toMatch(/^trq_/);
      expect(response2.body.apiKey).toMatch(/^trq_/);
    });

    it('should return 403 when trying to create project in organization user is not member of', async () => {
      const projectData = {
        name: 'Unauthorized Project',
        description: 'This should fail',
      };

      return authHelper
        .makeAuthenticatedRequest(
          'post',
          `/api/v1/organizations/${testOrganization.id}/projects`,
          user2Cookies, // user2 is not member of testOrganization
        )
        .send(projectData)
        .expect(403)
        .expect((res) => {
          expect(res.body.error.message).toBe(
            "You don't have an access to this organization or this organization doesn't exist",
          );
        });
    });

    it('should return 400 when project name is missing', async () => {
      const projectData = {
        description: 'Project without name',
        platform: EventPlatform.REACT,
      };

      return authHelper
        .makeAuthenticatedRequest(
          'post',
          `/api/v1/organizations/${testOrganization.id}/projects`,
          user1Cookies,
        )
        .send(projectData)
        .expect(400);
    });

    it('should return 400 when project name is empty', async () => {
      const projectData = {
        name: '',
        description: 'Project with empty name',
      };

      return authHelper
        .makeAuthenticatedRequest(
          'post',
          `/api/v1/organizations/${testOrganization.id}/projects`,
          user1Cookies,
        )
        .send(projectData)
        .expect(400);
    });

    it('should return 400 when platform is invalid', async () => {
      const projectData = {
        name: 'Invalid Platform Project',
        platform: 'INVALID_PLATFORM',
      };

      return authHelper
        .makeAuthenticatedRequest(
          'post',
          `/api/v1/organizations/${testOrganization.id}/projects`,
          user1Cookies,
        )
        .send(projectData)
        .expect(400);
    });
  });

  describe('Multiple Users and Organizations', () => {
    it('should prevent cross-access between users projects', async () => {
      // Create a project in testOrganization2
      const project2 = projectRepository.create({
        name: 'User 2 Project',
        description: 'Project for user 2',
        apiKey: 'user2-api-key',
        organization: testOrganization2,
      });
      const savedProject2 = await projectRepository.save(project2);

      // User 1 should not be able to access User 2's project
      await authHelper
        .makeAuthenticatedRequest(
          'get',
          `/api/v1/organizations/${testOrganization2.id}/projects/${savedProject2.id}`,
          user1Cookies,
        )
        .expect(403);

      // User 2 should not be able to access User 1's project
      await authHelper
        .makeAuthenticatedRequest(
          'get',
          `/api/v1/organizations/${testOrganization.id}/projects/${testProject.id}`,
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

      // Create a project in testOrganization2
      const project2 = projectRepository.create({
        name: 'Multi-Org Project',
        description: 'Project for multi-org user',
        apiKey: 'multi-org-api-key',
        organization: testOrganization2,
      });
      await projectRepository.save(project2);

      // User should now be able to access projects from both organizations
      await authHelper
        .makeAuthenticatedRequest(
          'get',
          `/api/v1/organizations/${testOrganization.id}/projects`,
          user1Cookies,
        )
        .expect(200)
        .expect((res) => {
          expect(res.body).toHaveLength(1);
        });

      await authHelper
        .makeAuthenticatedRequest(
          'get',
          `/api/v1/organizations/${testOrganization2.id}/projects`,
          user1Cookies,
        )
        .expect(200)
        .expect((res) => {
          expect(res.body).toHaveLength(1);
        });
    });
  });

  describe('Edge Cases', () => {
    it('should handle very long project names gracefully', async () => {
      const longName = 'A'.repeat(1000);
      const projectData = {
        name: longName,
        description: 'Project with very long name',
      };

      // This might return 400 if there's a length limit, or 201 if it's accepted
      const response = await authHelper
        .makeAuthenticatedRequest(
          'post',
          `/api/v1/organizations/${testOrganization.id}/projects`,
          user1Cookies,
        )
        .send(projectData);

      expect([201, 400]).toContain(response.status);
    });

    it('should handle special characters in project fields', async () => {
      const projectData = {
        name: 'Project with émojis 🚀 and spéçial chars',
        description: 'Test with "quotes" and \'apostrophes\' and <html> tags',
        slug: 'project-with-special-chars',
      };

      return authHelper
        .makeAuthenticatedRequest(
          'post',
          `/api/v1/organizations/${testOrganization.id}/projects`,
          user1Cookies,
        )
        .send(projectData)
        .expect(201)
        .expect((res) => {
          expect(res.body.name).toBe(projectData.name);
          expect(res.body.description).toBe(projectData.description);
        });
    });

    it('should handle empty organization projects endpoint', () => {
      return request(app.getHttpServer())
        .get('/api/v1/organizations//projects')
        .expect(404);
    });

    it('should handle non-existent nested routes', () => {
      return request(app.getHttpServer())
        .get(
          `/api/v1/organizations/${testOrganization.id}/projects/nonexistent/route`,
        )
        .expect(404);
    });

    it('should handle malformed JSON in project creation', async () => {
      return request(app.getHttpServer())
        .post(`/api/v1/organizations/${testOrganization.id}/projects`)
        .set('Cookie', user1Cookies[0])
        .send('{ invalid json }')
        .set('Content-Type', 'application/json')
        .expect(400);
    });
  });
});
