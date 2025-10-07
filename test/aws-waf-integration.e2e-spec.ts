import { INestApplication } from '@nestjs/common';
import { getRepositoryToken } from '@nestjs/typeorm';
import * as request from 'supertest';
import { App } from 'supertest/types';
import { Repository } from 'typeorm';

import { AuthHelper } from './auth/AuthHelper';
import { initNestTestApp } from './utils/initNestTestApp';
import { AwsWafCredentialsDTO } from '../src/models/dto/AwsWafCredentials.dto';
import { Account } from '../src/models/entity/Account.entity';
import { AwsWafCredentials } from '../src/models/entity/integrations/aws/waf/AwsWafCredentials.entity';
import { Member } from '../src/models/entity/Member.entity';
import { Organization } from '../src/models/entity/Organization.entity';
import { Session } from '../src/models/entity/Session.entity';
import { User } from '../src/models/entity/User.entity';

describe('AWS WAF Integration (e2e)', () => {
  let app: INestApplication<App>;
  let authHelper: AuthHelper;

  let userRepository: Repository<User>;
  let organizationRepository: Repository<Organization>;
  let memberRepository: Repository<Member>;
  let sessionRepository: Repository<Session>;
  let accountRepository: Repository<Account>;
  let awsWafCredentialsRepository: Repository<AwsWafCredentials>;

  let testUser: User;
  let testUser2: User;
  let testOrganization: Organization;
  let testOrganization2: Organization;
  let user1Cookies: string[];
  let user2Cookies: string[];

  const validAwsCredentials: AwsWafCredentialsDTO = {
    region: 'us-east-1',
    accessKeyId: 'AKIAIOSFODNN7EXAMPLE',
    secretAccessKey: 'wJalrXUtnFEMI/K7MDENG/bPxRfiCYEXAMPLEKEY',
  };

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
    awsWafCredentialsRepository = moduleFixture.get<
      Repository<AwsWafCredentials>
    >(getRepositoryToken(AwsWafCredentials));
  });

  beforeEach(async () => {
    // Clean up data before each test
    await awsWafCredentialsRepository.delete({});
    await memberRepository.delete({});
    await sessionRepository.delete({});
    await accountRepository.delete({});
    await organizationRepository.delete({});
    await userRepository.delete({});

    // Create test users
    user1Cookies = await authHelper.createAuthenticatedUser({
      email: 'user1@test.com',
      password: 'password123',
      name: 'Test User 1',
    });

    user2Cookies = await authHelper.createAuthenticatedUser({
      email: 'user2@test.com',
      password: 'password123',
      name: 'Test User 2',
    });

    // Get users from database
    const foundUser = await userRepository.findOne({
      where: { email: 'user1@test.com' },
    });
    const foundUser2 = await userRepository.findOne({
      where: { email: 'user2@test.com' },
    });

    if (!foundUser || !foundUser2) {
      throw new Error('Failed to create test users');
    }

    testUser = foundUser;
    testUser2 = foundUser2;

    // Create test organizations
    const org1 = organizationRepository.create({
      name: 'Test Org 1',
      slug: 'test-org-1',
      logo: '',
      metadata: '{"description": "Test organization 1"}',
    });
    testOrganization = await organizationRepository.save(org1);

    const org2 = organizationRepository.create({
      name: 'Test Org 2',
      slug: 'test-org-2',
      logo: '',
      metadata: '{"description": "Test organization 2"}',
    });
    testOrganization2 = await organizationRepository.save(org2);

    // Add users to organizations
    await memberRepository.save({
      user: testUser,
      organization: testOrganization,
      role: 'owner',
    });

    await memberRepository.save({
      user: testUser2,
      organization: testOrganization2,
      role: 'owner',
    });
  });

  afterAll(async () => {
    // Clean up after all tests
    await awsWafCredentialsRepository.delete({});
    await memberRepository.delete({});
    await sessionRepository.delete({});
    await accountRepository.delete({});
    await organizationRepository.delete({});
    await userRepository.delete({});
    await app.close();
  });

  describe('Authentication & Authorization', () => {
    it('should require authentication for all endpoints', async () => {
      const endpoints = [
        { method: 'get', path: '/api/v1/integrations/aws/waf/credentials' },
        { method: 'post', path: '/api/v1/integrations/aws/waf/credentials' },
        { method: 'delete', path: '/api/v1/integrations/aws/waf/credentials' },
      ];

      for (const endpoint of endpoints) {
        const method = endpoint.method as 'get' | 'post' | 'delete';
        const response = await request(app.getHttpServer())
          [method](endpoint.path)
          .query({ organizationId: testOrganization.id })
          .expect(403);

        // expect(response.body).toMatchObject({
        //   message: expect.any(String),
        //   statusCode: 403,
        // });
      }
    });

    it('should require valid organization membership', async () => {
      const endpoints = [
        { method: 'get', path: '/api/v1/integrations/aws/waf/credentials' },
        { method: 'post', path: '/api/v1/integrations/aws/waf/credentials' },
        { method: 'delete', path: '/api/v1/integrations/aws/waf/credentials' },
      ];

      for (const endpoint of endpoints) {
        const req = authHelper
          .makeAuthenticatedRequest(
            endpoint.method as 'get' | 'post' | 'delete',
            endpoint.path,
            user1Cookies,
          )
          .query({ organizationId: testOrganization2.id });

        if (endpoint.method === 'post') {
          req.send(validAwsCredentials);
        }

        const response = await req.expect(403);

        // expect(response.body).toMatchObject({
        //   message: expect.any(String),
        //   statusCode: 403,
        // });
      }
    });

    it('should require organizationId query parameter', async () => {
      const endpoints = [
        { method: 'get', path: '/api/v1/integrations/aws/waf/credentials' },
        { method: 'post', path: '/api/v1/integrations/aws/waf/credentials' },
        { method: 'delete', path: '/api/v1/integrations/aws/waf/credentials' },
      ];

      for (const endpoint of endpoints) {
        const req = authHelper.makeAuthenticatedRequest(
          endpoint.method as 'get' | 'post' | 'delete',
          endpoint.path,
          user1Cookies,
        );

        if (endpoint.method === 'post') {
          req.send(validAwsCredentials);
        }

        const response = await req.expect(400);

        // expect(response.body).toMatchObject({
        //   message: expect.any(String),
        //   statusCode: 400,
        // });
      }
    });
  });

  describe('Set AWS WAF Credentials (POST)', () => {
    it('should successfully set AWS WAF credentials', async () => {
      const response = await authHelper
        .makeAuthenticatedRequest(
          'post',
          '/api/v1/integrations/aws/waf/credentials',
          user1Cookies,
        )
        .query({ organizationId: testOrganization.id })
        .send(validAwsCredentials)
        .expect(201);

      expect(response.body).toMatchObject({
        result: 'OK',
      });

      // Verify credentials were saved to database
      const savedCredentials = await awsWafCredentialsRepository.findOne({
        where: { organization: { id: testOrganization.id } },
        relations: ['organization'],
      });

      expect(savedCredentials).toBeDefined();
      expect(savedCredentials!.region).toBe(validAwsCredentials.region);
      expect(savedCredentials!.accessKeyId).toBe(
        validAwsCredentials.accessKeyId,
      );
      expect(savedCredentials!.secretAccessKey).toBe(
        validAwsCredentials.secretAccessKey,
      );
      expect(savedCredentials!.organization.id).toBe(testOrganization.id);
    });

    it('should validate required fields', async () => {
      const invalidCredentials = [
        {}, // All fields missing
        { region: 'us-east-1' }, // Missing access keys
        { accessKeyId: 'AKIAIOSFODNN7EXAMPLE' }, // Missing region and secret
        { secretAccessKey: 'secret' }, // Missing region and access key
        { region: '', accessKeyId: 'key', secretAccessKey: 'secret' }, // Empty region
        { region: 'us-east-1', accessKeyId: '', secretAccessKey: 'secret' }, // Empty access key
        { region: 'us-east-1', accessKeyId: 'key', secretAccessKey: '' }, // Empty secret
      ];

      for (const credentials of invalidCredentials) {
        const response = await authHelper
          .makeAuthenticatedRequest(
            'post',
            '/api/v1/integrations/aws/waf/credentials',
            user1Cookies,
          )
          .query({ organizationId: testOrganization.id })
          .send(credentials)
          .expect(400);

        // expect(response.body).toMatchObject({
        //   message: expect.any(String),
        //   statusCode: 400,
        // });
      }
    });

    it('should reject non-string field values', async () => {
      const invalidCredentials = [
        { region: 123, accessKeyId: 'key', secretAccessKey: 'secret' },
        { region: 'us-east-1', accessKeyId: true, secretAccessKey: 'secret' },
        { region: 'us-east-1', accessKeyId: 'key', secretAccessKey: null },
        { region: [], accessKeyId: 'key', secretAccessKey: 'secret' },
        { region: 'us-east-1', accessKeyId: {}, secretAccessKey: 'secret' },
      ];

      for (const credentials of invalidCredentials) {
        const response = await authHelper
          .makeAuthenticatedRequest(
            'post',
            '/api/v1/integrations/aws/waf/credentials',
            user1Cookies,
          )
          .query({ organizationId: testOrganization.id })
          .send(credentials)
          .expect(400);

        // expect(response.body).toMatchObject({
        //   message: expect.any(String),
        //   statusCode: 400,
        // });
      }
    });

    it('should prevent setting credentials for non-existent organization', async () => {
      const nonExistentOrgId = '2eb53a0f-0fd4-4ff5-a3b5-b2bd5489466b';

      const response = await authHelper
        .makeAuthenticatedRequest(
          'post',
          '/api/v1/integrations/aws/waf/credentials',
          user1Cookies,
        )
        .query({ organizationId: nonExistentOrgId })
        .send(validAwsCredentials)
        .expect(403);

      //   expect(response.body).toMatchObject({
      //     message: 'Organization is not provided',
      //     statusCode: 404,
      //   });
    });

    it('should prevent duplicate credentials for same organization', async () => {
      // First set credentials successfully
      await authHelper
        .makeAuthenticatedRequest(
          'post',
          '/api/v1/integrations/aws/waf/credentials',
          user1Cookies,
        )
        .query({ organizationId: testOrganization.id })
        .send(validAwsCredentials)
        .expect(201);

      // Try to set credentials again for same organization
      const response = await authHelper
        .makeAuthenticatedRequest(
          'post',
          '/api/v1/integrations/aws/waf/credentials',
          user1Cookies,
        )
        .query({ organizationId: testOrganization.id })
        .send({
          region: 'us-west-2',
          accessKeyId: 'AKIAI44QH8DHBEXAMPLE',
          secretAccessKey: 'je7MtGbClwBF/2Zp9Utk/h3yCo8nvbEXAMPLEKEY',
        })
        .expect(409);

      //   expect(response.body).toMatchObject({
      //     message: 'Credentials already exist',
      //     statusCode: 409,
      //   });
    });

    it('should allow different organizations to have their own credentials', async () => {
      // Set credentials for first organization
      await authHelper
        .makeAuthenticatedRequest(
          'post',
          '/api/v1/integrations/aws/waf/credentials',
          user1Cookies,
        )
        .query({ organizationId: testOrganization.id })
        .send(validAwsCredentials)
        .expect(201);

      // Set different credentials for second organization
      const differentCredentials = {
        region: 'us-west-2',
        accessKeyId: 'AKIAI44QH8DHBEXAMPLE',
        secretAccessKey: 'je7MtGbClwBF/2Zp9Utk/h3yCo8nvbEXAMPLEKEY',
      };

      await authHelper
        .makeAuthenticatedRequest(
          'post',
          '/api/v1/integrations/aws/waf/credentials',
          user2Cookies,
        )
        .query({ organizationId: testOrganization2.id })
        .send(differentCredentials)
        .expect(201);

      // Verify both organizations have their respective credentials
      const org1Credentials = await awsWafCredentialsRepository.findOne({
        where: { organization: { id: testOrganization.id } },
      });
      const org2Credentials = await awsWafCredentialsRepository.findOne({
        where: { organization: { id: testOrganization2.id } },
      });

      expect(org1Credentials!.region).toBe(validAwsCredentials.region);
      expect(org2Credentials!.region).toBe(differentCredentials.region);
    });
  });

  describe('Get AWS WAF Credentials (GET)', () => {
    beforeEach(async () => {
      // Set up test credentials
      await authHelper
        .makeAuthenticatedRequest(
          'post',
          '/api/v1/integrations/aws/waf/credentials',
          user1Cookies,
        )
        .query({ organizationId: testOrganization.id })
        .send(validAwsCredentials)
        .expect(201);
    });

    it('should successfully retrieve AWS WAF credentials', async () => {
      const response = await authHelper
        .makeAuthenticatedRequest(
          'get',
          '/api/v1/integrations/aws/waf/credentials',
          user1Cookies,
        )
        .query({ organizationId: testOrganization.id })
        .expect(200);

      expect(response.body).toMatchObject({
        region: validAwsCredentials.region,
        accessKeyId: validAwsCredentials.accessKeyId,
        secretAccessKey: validAwsCredentials.secretAccessKey,
      });
    });

    it('should return 404 when credentials do not exist', async () => {
      const response = await authHelper
        .makeAuthenticatedRequest(
          'get',
          '/api/v1/integrations/aws/waf/credentials',
          user2Cookies,
        )
        .query({ organizationId: testOrganization2.id })
        .expect(404);

      //   expect(response.body).toMatchObject({
      //     message: "Integration with AWS WAF doesn't exist",
      //     statusCode: 404,
      //   });
    });

    it('should not allow access to other organization credentials', async () => {
      const response = await authHelper
        .makeAuthenticatedRequest(
          'get',
          '/api/v1/integrations/aws/waf/credentials',
          user2Cookies,
        )
        .query({ organizationId: testOrganization.id })
        .expect(403);

      //   expect(response.body).toMatchObject({
      //     message: expect.any(String),
      //     statusCode: 403,
      //   });
    });
  });

  describe('Delete AWS WAF Credentials (DELETE)', () => {
    beforeEach(async () => {
      // Set up test credentials
      await authHelper
        .makeAuthenticatedRequest(
          'post',
          '/api/v1/integrations/aws/waf/credentials',
          user1Cookies,
        )
        .query({ organizationId: testOrganization.id })
        .send(validAwsCredentials)
        .expect(201);
    });

    it('should successfully delete AWS WAF credentials', async () => {
      const response = await authHelper
        .makeAuthenticatedRequest(
          'delete',
          '/api/v1/integrations/aws/waf/credentials',
          user1Cookies,
        )
        .query({ organizationId: testOrganization.id })
        .expect(200);

      expect(response.body).toMatchObject({
        result: 'OK',
      });

      // Verify credentials were removed from database
      const deletedCredentials = await awsWafCredentialsRepository.findOne({
        where: { organization: { id: testOrganization.id } },
      });

      expect(deletedCredentials).toBeNull();
    });

    it('should return 404 when trying to delete non-existent credentials', async () => {
      const response = await authHelper
        .makeAuthenticatedRequest(
          'delete',
          '/api/v1/integrations/aws/waf/credentials',
          user2Cookies,
        )
        .query({ organizationId: testOrganization2.id })
        .expect(404);

      //   expect(response.body).toMatchObject({
      //     message: 'Credentials not found',
      //     statusCode: 404,
      //   });
    });

    it('should not allow deletion of other organization credentials', async () => {
      const response = await authHelper
        .makeAuthenticatedRequest(
          'delete',
          '/api/v1/integrations/aws/waf/credentials',
          user2Cookies,
        )
        .query({ organizationId: testOrganization.id })
        .expect(403);

      //   expect(response.body).toMatchObject({
      //     message: expect.any(String),
      //     statusCode: 403,
      //   });
    });
  });

  describe('Data Encryption & Security', () => {
    it('should encrypt sensitive credentials in database', async () => {
      await authHelper
        .makeAuthenticatedRequest(
          'post',
          '/api/v1/integrations/aws/waf/credentials',
          user1Cookies,
        )
        .query({ organizationId: testOrganization.id })
        .send(validAwsCredentials)
        .expect(201);

      // Query database directly without TypeORM transformers to check raw data
      const rawCredentials = await awsWafCredentialsRepository
        .createQueryBuilder('credentials')
        .where('credentials.organization_id = :orgId', {
          orgId: testOrganization.id,
        })
        .getRawOne();

      // The raw values should be encrypted (different from original values)
      expect(rawCredentials.region).not.toBe(validAwsCredentials.region);
      expect(rawCredentials.access_key_id).not.toBe(
        validAwsCredentials.accessKeyId,
      );
      expect(rawCredentials.secret_access_key).not.toBe(
        validAwsCredentials.secretAccessKey,
      );

      // But when retrieved through the service, they should be decrypted
      const response = await authHelper
        .makeAuthenticatedRequest(
          'get',
          '/api/v1/integrations/aws/waf/credentials',
          user1Cookies,
        )
        .query({ organizationId: testOrganization.id })
        .expect(200);

      expect(response.body.region).toBe(validAwsCredentials.region);
      expect(response.body.accessKeyId).toBe(validAwsCredentials.accessKeyId);
      expect(response.body.secretAccessKey).toBe(
        validAwsCredentials.secretAccessKey,
      );
    });
  });

  describe('Edge Cases & Error Handling', () => {
    it('should handle malformed JSON in request body', async () => {
      const response = await authHelper
        .makeAuthenticatedRequest(
          'post',
          '/api/v1/integrations/aws/waf/credentials',
          user1Cookies,
        )
        .query({ organizationId: testOrganization.id })
        .send('invalid json')
        .expect(400);

      //   expect(response.body).toMatchObject({
      //     message: expect.any(String),
      //     statusCode: 400,
      //   });
    });

    it('should handle extremely long credential values', async () => {
      const longCredentials = {
        region: 'a'.repeat(1000),
        accessKeyId: 'b'.repeat(1000),
        secretAccessKey: 'c'.repeat(1000),
      };

      const response = await authHelper
        .makeAuthenticatedRequest(
          'post',
          '/api/v1/integrations/aws/waf/credentials',
          user1Cookies,
        )
        .query({ organizationId: testOrganization.id })
        .send(longCredentials)
        .expect(201);

      expect(response.body).toMatchObject({
        result: 'OK',
      });
    });

    it('should handle special characters in credential values', async () => {
      const specialCharCredentials = {
        region: 'us-east-1',
        accessKeyId: 'AKIA!@#$%^&*()_+-=[]{}|;:,.<>?',
        secretAccessKey: 'secret+with/special=characters_and-symbols',
      };

      const response = await authHelper
        .makeAuthenticatedRequest(
          'post',
          '/api/v1/integrations/aws/waf/credentials',
          user1Cookies,
        )
        .query({ organizationId: testOrganization.id })
        .send(specialCharCredentials)
        .expect(201);

      expect(response.body).toMatchObject({
        result: 'OK',
      });

      // Verify retrieval works correctly
      const getResponse = await authHelper
        .makeAuthenticatedRequest(
          'get',
          '/api/v1/integrations/aws/waf/credentials',
          user1Cookies,
        )
        .query({ organizationId: testOrganization.id })
        .expect(200);

      expect(getResponse.body).toMatchObject(specialCharCredentials);
    });

    it('should handle invalid organization ID format', async () => {
      const invalidOrgIds = ['invalid-uuid', '123', '', 'not-a-uuid'];

      for (const invalidOrgId of invalidOrgIds) {
        const response = await authHelper
          .makeAuthenticatedRequest(
            'post',
            '/api/v1/integrations/aws/waf/credentials',
            user1Cookies,
          )
          .query({ organizationId: invalidOrgId })
          .send(validAwsCredentials)
          .expect(400);

        // expect(response.body).toMatchObject({
        //   message: 'Organization is not provided',
        //   statusCode: 404,
        // });
      }
    });
  });

  describe('API Versioning', () => {
    it('should work with v1 API version', async () => {
      const response = await authHelper
        .makeAuthenticatedRequest(
          'post',
          '/api/v1/integrations/aws/waf/credentials',
          user1Cookies,
        )
        .query({ organizationId: testOrganization.id })
        .send(validAwsCredentials)
        .expect(201);

      expect(response.body).toMatchObject({
        result: 'OK',
      });
    });

    it('should return 404 for unsupported API versions', async () => {
      const unsupportedVersions = ['v2', 'v3', 'v0'];

      for (const version of unsupportedVersions) {
        await authHelper
          .makeAuthenticatedRequest(
            'post',
            `/api/${version}/integrations/aws/waf/credentials`,
            user1Cookies,
          )
          .query({ organizationId: testOrganization.id })
          .send(validAwsCredentials)
          .expect(404);
      }
    });
  });

  describe('Performance & Load Tests', () => {
    it('should handle multiple concurrent requests', async () => {
      const concurrentRequests = Array.from({ length: 10 }, () =>
        authHelper
          .makeAuthenticatedRequest(
            'get',
            '/api/v1/integrations/aws/waf/credentials',
            user1Cookies,
          )
          .query({ organizationId: testOrganization.id }),
      );

      // First set credentials
      await authHelper
        .makeAuthenticatedRequest(
          'post',
          '/api/v1/integrations/aws/waf/credentials',
          user1Cookies,
        )
        .query({ organizationId: testOrganization.id })
        .send(validAwsCredentials)
        .expect(201);

      // Make concurrent requests
      const responses = await Promise.all(
        concurrentRequests.map((req) => req.expect(200)),
      );

      // All should return the same credentials
      responses.forEach((response) => {
        expect(response.body).toMatchObject(validAwsCredentials);
      });
    });
  });
});
