import { INestApplication } from '@nestjs/common';
import { getRepositoryToken } from '@nestjs/typeorm';
import request from 'supertest';
import { App } from 'supertest/types';
import { Repository } from 'typeorm';

import { AuthHelper } from './auth/AuthHelper';
import { initNestTestApp } from './utils/initNestTestApp';
import { Account } from '../src/models/entity/Account.entity';
import { Member } from '../src/models/entity/Member.entity';
import { Organization } from '../src/models/entity/Organization.entity';
import { PushNotificationToken } from '../src/models/entity/PushNotificationToken.entity';
import { Session } from '../src/models/entity/Session.entity';
import { Monitor } from '../src/models/entity/uptime/Monitor.entity';
import { MonitorCheck } from '../src/models/entity/uptime/MonitorCheck.entity';
import { User } from '../src/models/entity/User.entity';
import { CheckStatus } from '../src/models/types/uptime/CheckStatus';
import { EscalationPolicy } from '../src/models/types/uptime/EscalationPolicy';
import { HttpMethod } from '../src/models/types/uptime/HttpMethod';
import { IpVersion } from '../src/models/types/uptime/IpVersion';
import { MaintenanceDay } from '../src/models/types/uptime/MaintenanceDay';
import { MonitorRegion } from '../src/models/types/uptime/MonitorRegion';
import { MonitorStatus } from '../src/models/types/uptime/MonitorStatus';
import { MonitorType } from '../src/models/types/uptime/MonitorType';
import { NotificationChannel } from '../src/models/types/uptime/NotificationChannel';

describe('Uptime Monitor (e2e)', () => {
  let app: INestApplication<App>;
  let authHelper: AuthHelper;

  let userRepository: Repository<User>;
  let organizationRepository: Repository<Organization>;
  let memberRepository: Repository<Member>;
  let sessionRepository: Repository<Session>;
  let accountRepository: Repository<Account>;
  let pushNotificationTokenRepository: Repository<PushNotificationToken>;
  let monitorRepository: Repository<Monitor>;
  let monitorCheckRepository: Repository<MonitorCheck>;

  let testOrganization: Organization;
  let testOrganization2: Organization;
  let testMonitor: Monitor;

  let user1Cookies: string[];
  let user2Cookies: string[];

  const monitorsUrl = () =>
    `/api/v1/organizations/${testOrganization.id}/uptime/monitors`;

  const monitorUrl = (monitorId: string) => `${monitorsUrl()}/${monitorId}`;

  const validCreatePayload = {
    name: 'speekl.com',
    url: 'https://speekl.com',
    type: MonitorType.HTTP_UNAVAILABLE,
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
    pushNotificationTokenRepository = moduleFixture.get<
      Repository<PushNotificationToken>
    >(getRepositoryToken(PushNotificationToken));
    monitorRepository = moduleFixture.get<Repository<Monitor>>(
      getRepositoryToken(Monitor),
    );
    monitorCheckRepository = moduleFixture.get<Repository<MonitorCheck>>(
      getRepositoryToken(MonitorCheck),
    );
  });

  beforeEach(async () => {
    try {
      await monitorCheckRepository.delete({});
      await monitorRepository.delete({});
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
      email: 'uptime-test@example.com',
      password: 'TestPassword123!',
    });

    user2Cookies = await authHelper.createAuthenticatedUser({
      name: 'Test User 2',
      email: 'uptime-test2@example.com',
      password: 'TestPassword123!',
    });

    const testUser = await userRepository.findOne({
      where: { email: 'uptime-test@example.com' },
    });
    const testUser2 = await userRepository.findOne({
      where: { email: 'uptime-test2@example.com' },
    });

    if (!testUser || !testUser2) {
      throw new Error('Failed to create test users');
    }

    const org1 = organizationRepository.create({
      name: 'Monitor Org',
      slug: 'monitor-org',
      logo: '',
      metadata: '',
    });
    testOrganization = await organizationRepository.save(org1);

    const org2 = organizationRepository.create({
      name: 'Other Org',
      slug: 'other-org',
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

    const monitor = new Monitor({
      name: 'speekl.com',
      url: 'https://speekl.com',
      type: MonitorType.HTTP_UNAVAILABLE,
      status: MonitorStatus.UP,
      checkIntervalSeconds: 180,
      confirmationPeriodSeconds: 0,
      recoveryPeriodSeconds: 180,
      requestTimeoutSeconds: 30,
      httpMethod: HttpMethod.GET,
      followRedirects: true,
      keepCookiesOnRedirect: true,
      ipVersion: IpVersion.BOTH,
      regions: [MonitorRegion.EUROPE, MonitorRegion.NORTH_AMERICA],
      sslVerification: true,
      notificationChannels: [NotificationChannel.EMAIL],
      escalationPolicy: EscalationPolicy.IMMEDIATELY,
    });

    monitor.organization = testOrganization;
    testMonitor = await monitorRepository.save(monitor);
  });

  afterAll(async () => {
    await monitorCheckRepository.delete({});
    await monitorRepository.delete({});
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
    it('should return 403 when no auth token is provided', () => {
      return request(app.getHttpServer()).get(monitorsUrl()).expect(403);
    });

    it('should return 403 when invalid session token is provided', () => {
      return request(app.getHttpServer())
        .get(monitorsUrl())
        .set('Cookie', 'better-auth.session_token=invalid-token')
        .expect(403);
    });

    it('should return 403 when user accesses monitors from another org', () => {
      return authHelper
        .makeAuthenticatedRequest('get', monitorsUrl(), user2Cookies)
        .expect(403);
    });

    it('should return 403 when creating a monitor in another org', () => {
      return authHelper
        .makeAuthenticatedRequest('post', monitorsUrl(), user2Cookies)
        .send(validCreatePayload)
        .expect(403);
    });
  });

  // ── Monitor CRUD ────────────────────────────────────────────────────

  describe('Monitor Creation', () => {
    it('should create a monitor with required fields', () => {
      return authHelper
        .makeAuthenticatedRequest('post', monitorsUrl(), user1Cookies)
        .send(validCreatePayload)
        .expect(201)
        .expect((res) => {
          expect(res.body).toHaveProperty('id');
          expect(res.body.name).toBe('speekl.com');
          expect(res.body.url).toBe('https://speekl.com');
          expect(res.body.type).toBe(MonitorType.HTTP_UNAVAILABLE);
          expect(res.body.status).toBe(MonitorStatus.PENDING);
          expect(res.body.checkIntervalSeconds).toBe(180);
          expect(res.body.httpMethod).toBe(HttpMethod.GET);
          expect(res.body.followRedirects).toBe(true);
          expect(res.body.sslVerification).toBe(true);
        });
    });

    it('should create a monitor with all optional fields', () => {
      return authHelper
        .makeAuthenticatedRequest('post', monitorsUrl(), user1Cookies)
        .send({
          name: 'Full Monitor',
          url: 'https://api.speekl.com/health',
          type: MonitorType.HTTP_STATUS_CODE,
          pronounceableName: 'Speekl API Health',
          checkIntervalSeconds: 60,
          confirmationPeriodSeconds: 30,
          recoveryPeriodSeconds: 120,
          requestTimeoutSeconds: 15,
          httpMethod: HttpMethod.POST,
          requestBody: '{"t": "{timestamp}"}',
          requestHeaders: [
            { name: 'Authorization', value: 'Bearer abc123' },
            { name: 'Content-Type', value: 'application/json' },
          ],
          followRedirects: false,
          keepCookiesOnRedirect: false,
          basicAuthUsername: 'admin',
          basicAuthPassword: 'secret',
          proxyHost: 'proxy.example.com',
          proxyPort: 3128,
          expectedStatusCode: 200,
          ipVersion: IpVersion.IPV4,
          regions: [MonitorRegion.EUROPE],
          sslVerification: false,
          sslExpirationAlertDays: 30,
          domainExpirationAlertDays: 14,
          maintenanceWindowStartTime: '02:00',
          maintenanceWindowEndTime: '04:00',
          maintenanceWindowTimezone: 'Europe/Warsaw',
          maintenanceWindowDays: [MaintenanceDay.SAT, MaintenanceDay.SUN],
        })
        .expect(201)
        .expect((res) => {
          expect(res.body.pronounceableName).toBe('Speekl API Health');
          expect(res.body.checkIntervalSeconds).toBe(60);
          expect(res.body.httpMethod).toBe(HttpMethod.POST);
          expect(res.body.requestHeaders).toHaveLength(2);
          expect(res.body.expectedStatusCode).toBe(200);
          expect(res.body.ipVersion).toBe(IpVersion.IPV4);
          expect(res.body.regions).toEqual([MonitorRegion.EUROPE]);
          expect(res.body.maintenanceWindowDays).toEqual(
            expect.arrayContaining([MaintenanceDay.SAT, MaintenanceDay.SUN]),
          );
        });
    });

    it('should create a keyword monitor', () => {
      return authHelper
        .makeAuthenticatedRequest('post', monitorsUrl(), user1Cookies)
        .send({
          name: 'Keyword Check',
          url: 'https://speekl.com',
          type: MonitorType.HTTP_KEYWORD_MISSING,
          keyword: 'Welcome',
        })
        .expect(201)
        .expect((res) => {
          expect(res.body.type).toBe(MonitorType.HTTP_KEYWORD_MISSING);
          expect(res.body.keyword).toBe('Welcome');
        });
    });

    it('should create a TCP monitor with port', () => {
      return authHelper
        .makeAuthenticatedRequest('post', monitorsUrl(), user1Cookies)
        .send({
          name: 'Redis TCP',
          url: 'https://redis.example.com',
          type: MonitorType.TCP,
          port: 6379,
        })
        .expect(201)
        .expect((res) => {
          expect(res.body.type).toBe(MonitorType.TCP);
          expect(res.body.port).toBe(6379);
        });
    });

    it('should return 400 when name is missing', () => {
      return authHelper
        .makeAuthenticatedRequest('post', monitorsUrl(), user1Cookies)
        .send({
          url: 'https://example.com',
          type: MonitorType.HTTP_UNAVAILABLE,
        })
        .expect(400);
    });

    it('should return 400 when url is missing', () => {
      return authHelper
        .makeAuthenticatedRequest('post', monitorsUrl(), user1Cookies)
        .send({ name: 'Test', type: MonitorType.HTTP_UNAVAILABLE })
        .expect(400);
    });

    it('should return 400 when type is missing', () => {
      return authHelper
        .makeAuthenticatedRequest('post', monitorsUrl(), user1Cookies)
        .send({ name: 'Test', url: 'https://example.com' })
        .expect(400);
    });

    it('should return 400 when type is invalid', () => {
      return authHelper
        .makeAuthenticatedRequest('post', monitorsUrl(), user1Cookies)
        .send({ ...validCreatePayload, type: 'INVALID' })
        .expect(400);
    });

    it('should return 400 when checkIntervalSeconds is below minimum', () => {
      return authHelper
        .makeAuthenticatedRequest('post', monitorsUrl(), user1Cookies)
        .send({ ...validCreatePayload, checkIntervalSeconds: 10 })
        .expect(400);
    });

    it('should return 400 when maintenanceWindowStartTime format is invalid', () => {
      return authHelper
        .makeAuthenticatedRequest('post', monitorsUrl(), user1Cookies)
        .send({ ...validCreatePayload, maintenanceWindowStartTime: '25:00' })
        .expect(400);
    });

    it('should return 400 when expectedStatusCode is out of range', () => {
      return authHelper
        .makeAuthenticatedRequest('post', monitorsUrl(), user1Cookies)
        .send({ ...validCreatePayload, expectedStatusCode: 999 })
        .expect(400);
    });

    it('should return 400 when port is out of range', () => {
      return authHelper
        .makeAuthenticatedRequest('post', monitorsUrl(), user1Cookies)
        .send({ ...validCreatePayload, port: 70000 })
        .expect(400);
    });
  });

  describe('Monitor Listing', () => {
    it('should return paginated monitors', () => {
      return authHelper
        .makeAuthenticatedRequest('get', monitorsUrl(), user1Cookies)
        .expect(200)
        .expect((res) => {
          expect(res.body).toHaveProperty('items');
          expect(res.body).toHaveProperty('meta');
          expect(Array.isArray(res.body.items)).toBe(true);
          expect(res.body.items).toHaveLength(1);
          expect(res.body.items[0].name).toBe('speekl.com');
        });
    });

    it('should support pagination parameters', async () => {
      for (let i = 0; i < 5; i++) {
        const m = new Monitor({
          name: `Monitor ${i}`,
          url: `https://example-${i}.com`,
          type: MonitorType.HTTP_UNAVAILABLE,
          status: MonitorStatus.PENDING,
          checkIntervalSeconds: 180,
          confirmationPeriodSeconds: 0,
          recoveryPeriodSeconds: 180,
          requestTimeoutSeconds: 30,
          httpMethod: HttpMethod.GET,
          followRedirects: true,
          keepCookiesOnRedirect: true,
          ipVersion: IpVersion.BOTH,
          regions: [MonitorRegion.EUROPE],
          sslVerification: true,
          notificationChannels: [NotificationChannel.EMAIL],
          escalationPolicy: EscalationPolicy.IMMEDIATELY,
        });

        m.organization = testOrganization;
        await monitorRepository.save(m);
      }

      return authHelper
        .makeAuthenticatedRequest(
          'get',
          `${monitorsUrl()}?page=1&size=3`,
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

    it('should filter by status', () => {
      return authHelper
        .makeAuthenticatedRequest(
          'get',
          `${monitorsUrl()}?status=${MonitorStatus.UP}`,
          user1Cookies,
        )
        .expect(200)
        .expect((res) => {
          expect(res.body.items).toHaveLength(1);
          expect(res.body.items[0].status).toBe(MonitorStatus.UP);
        });
    });

    it('should filter by type', () => {
      return authHelper
        .makeAuthenticatedRequest(
          'get',
          `${monitorsUrl()}?type=${MonitorType.HTTP_UNAVAILABLE}`,
          user1Cookies,
        )
        .expect(200)
        .expect((res) => {
          expect(res.body.items).toHaveLength(1);
        });
    });

    it('should filter by search', () => {
      return authHelper
        .makeAuthenticatedRequest(
          'get',
          `${monitorsUrl()}?search=speekl`,
          user1Cookies,
        )
        .expect(200)
        .expect((res) => {
          expect(res.body.items).toHaveLength(1);
          expect(res.body.items[0].name).toBe('speekl.com');
        });
    });

    it('should return empty list when no monitors match filter', () => {
      return authHelper
        .makeAuthenticatedRequest(
          'get',
          `${monitorsUrl()}?status=${MonitorStatus.DOWN}`,
          user1Cookies,
        )
        .expect(200)
        .expect((res) => {
          expect(res.body.items).toHaveLength(0);
        });
    });
  });

  describe('Individual Monitor Access', () => {
    it('should return a monitor by ID', () => {
      return authHelper
        .makeAuthenticatedRequest(
          'get',
          monitorUrl(testMonitor.id),
          user1Cookies,
        )
        .expect(200)
        .expect((res) => {
          expect(res.body.id).toBe(testMonitor.id);
          expect(res.body.name).toBe('speekl.com');
          expect(res.body.url).toBe('https://speekl.com');
          expect(res.body.type).toBe(MonitorType.HTTP_UNAVAILABLE);
          expect(res.body).toHaveProperty('createdAt');
          expect(res.body).toHaveProperty('updatedAt');
        });
    });

    it('should return 404 for non-existent monitor', () => {
      const nonExistentId = '604c0032-9556-4cf0-8fd2-b7c43cfedf04';

      return authHelper
        .makeAuthenticatedRequest(
          'get',
          monitorUrl(nonExistentId),
          user1Cookies,
        )
        .expect(404);
    });

    it('should return 400 for malformed monitor ID', () => {
      return authHelper
        .makeAuthenticatedRequest(
          'get',
          monitorUrl('malformed-id'),
          user1Cookies,
        )
        .expect(400);
    });
  });

  describe('Monitor Update', () => {
    it('should update monitor fields', () => {
      return authHelper
        .makeAuthenticatedRequest(
          'patch',
          monitorUrl(testMonitor.id),
          user1Cookies,
        )
        .send({
          name: 'Updated Name',
          checkIntervalSeconds: 60,
        })
        .expect(200)
        .expect((res) => {
          expect(res.body.name).toBe('Updated Name');
          expect(res.body.checkIntervalSeconds).toBe(60);
        });
    });

    it('should allow partial update', () => {
      return authHelper
        .makeAuthenticatedRequest(
          'patch',
          monitorUrl(testMonitor.id),
          user1Cookies,
        )
        .send({ pronounceableName: 'Speekl Website' })
        .expect(200)
        .expect((res) => {
          expect(res.body.pronounceableName).toBe('Speekl Website');
          expect(res.body.name).toBe('speekl.com');
        });
    });

    it('should update request headers', () => {
      return authHelper
        .makeAuthenticatedRequest(
          'patch',
          monitorUrl(testMonitor.id),
          user1Cookies,
        )
        .send({
          requestHeaders: [{ name: 'Authorization', value: 'Bearer newtoken' }],
        })
        .expect(200)
        .expect((res) => {
          expect(res.body.requestHeaders).toHaveLength(1);
          expect(res.body.requestHeaders[0].name).toBe('Authorization');
        });
    });

    it('should update maintenance window', () => {
      return authHelper
        .makeAuthenticatedRequest(
          'patch',
          monitorUrl(testMonitor.id),
          user1Cookies,
        )
        .send({
          maintenanceWindowStartTime: '01:00',
          maintenanceWindowEndTime: '05:00',
          maintenanceWindowTimezone: 'UTC',
          maintenanceWindowDays: [
            MaintenanceDay.MON,
            MaintenanceDay.TUE,
            MaintenanceDay.WED,
            MaintenanceDay.THU,
            MaintenanceDay.FRI,
          ],
        })
        .expect(200)
        .expect((res) => {
          expect(res.body.maintenanceWindowStartTime).toBe('01:00');
          expect(res.body.maintenanceWindowEndTime).toBe('05:00');
          expect(res.body.maintenanceWindowDays).toHaveLength(5);
        });
    });

    it('should return 404 when updating non-existent monitor', () => {
      const nonExistentId = '604c0032-9556-4cf0-8fd2-b7c43cfedf04';

      return authHelper
        .makeAuthenticatedRequest(
          'patch',
          monitorUrl(nonExistentId),
          user1Cookies,
        )
        .send({ name: 'Nope' })
        .expect(404);
    });
  });

  describe('Monitor Deletion', () => {
    it('should delete a monitor', async () => {
      await authHelper
        .makeAuthenticatedRequest(
          'delete',
          monitorUrl(testMonitor.id),
          user1Cookies,
        )
        .expect(200)
        .expect((res) => {
          expect(res.body).toHaveProperty('result', 'OK');
        });

      return authHelper
        .makeAuthenticatedRequest(
          'get',
          monitorUrl(testMonitor.id),
          user1Cookies,
        )
        .expect(404);
    });

    it('should return 404 when deleting non-existent monitor', () => {
      const nonExistentId = '604c0032-9556-4cf0-8fd2-b7c43cfedf04';

      return authHelper
        .makeAuthenticatedRequest(
          'delete',
          monitorUrl(nonExistentId),
          user1Cookies,
        )
        .expect(404);
    });
  });

  // ── Pause / Resume ──────────────────────────────────────────────────

  describe('Monitor Pause and Resume', () => {
    it('should pause a monitor', () => {
      return authHelper
        .makeAuthenticatedRequest(
          'post',
          `${monitorUrl(testMonitor.id)}/pause`,
          user1Cookies,
        )
        .expect(201)
        .expect((res) => {
          expect(res.body.status).toBe(MonitorStatus.PAUSED);
        });
    });

    it('should resume a paused monitor', async () => {
      await monitorRepository.update(testMonitor.id, {
        status: MonitorStatus.PAUSED,
      });

      return authHelper
        .makeAuthenticatedRequest(
          'post',
          `${monitorUrl(testMonitor.id)}/resume`,
          user1Cookies,
        )
        .expect(201)
        .expect((res) => {
          expect(res.body.status).toBe(MonitorStatus.PENDING);
        });
    });

    it('should return 404 when pausing non-existent monitor', () => {
      const nonExistentId = '604c0032-9556-4cf0-8fd2-b7c43cfedf04';

      return authHelper
        .makeAuthenticatedRequest(
          'post',
          `${monitorUrl(nonExistentId)}/pause`,
          user1Cookies,
        )
        .expect(404);
    });
  });

  // ── Check History & Stats ───────────────────────────────────────────

  describe('Check History', () => {
    beforeEach(async () => {
      const now = new Date();

      for (let i = 0; i < 5; i++) {
        const check = new MonitorCheck({
          status: i === 2 ? CheckStatus.DOWN : CheckStatus.UP,
          region: MonitorRegion.EUROPE,
          checkedAt: new Date(now.getTime() - i * 180_000),
          httpStatusCode: i === 2 ? 500 : 200,
          errorMessage: i === 2 ? 'Internal Server Error' : undefined,
          dnsLookupMs: 10 + i,
          tcpConnectionMs: 20 + i,
          tlsHandshakeMs: 15 + i,
          firstByteMs: 50 + i * 10,
          totalResponseMs: 100 + i * 20,
        });

        check.monitor = testMonitor;
        await monitorCheckRepository.save(check);
      }
    });

    it('should return paginated check history', () => {
      return authHelper
        .makeAuthenticatedRequest(
          'get',
          `${monitorUrl(testMonitor.id)}/checks`,
          user1Cookies,
        )
        .expect(200)
        .expect((res) => {
          expect(res.body).toHaveProperty('items');
          expect(res.body).toHaveProperty('meta');
          expect(res.body.items).toHaveLength(5);
          expect(res.body.items[0]).toHaveProperty('status');
          expect(res.body.items[0]).toHaveProperty('checkedAt');
          expect(res.body.items[0]).toHaveProperty('totalResponseMs');
        });
    });

    it('should support pagination on checks', () => {
      return authHelper
        .makeAuthenticatedRequest(
          'get',
          `${monitorUrl(testMonitor.id)}/checks?page=1&size=2`,
          user1Cookies,
        )
        .expect(200)
        .expect((res) => {
          expect(res.body.items).toHaveLength(2);
          expect(res.body.meta.totalItems).toBe(5);
          expect(res.body.meta.itemsPerPage).toBe(2);
        });
    });

    it('should return 404 for checks of non-existent monitor', () => {
      const nonExistentId = '604c0032-9556-4cf0-8fd2-b7c43cfedf04';

      return authHelper
        .makeAuthenticatedRequest(
          'get',
          `${monitorUrl(nonExistentId)}/checks`,
          user1Cookies,
        )
        .expect(404);
    });
  });

  describe('Monitor Summary', () => {
    it('should return summary with uptime and last checked at', async () => {
      const now = new Date();

      for (let i = 0; i < 3; i++) {
        const check = new MonitorCheck({
          status: CheckStatus.UP,
          region: MonitorRegion.EUROPE,
          checkedAt: new Date(now.getTime() - i * 180_000),
          totalResponseMs: 100,
        });

        check.monitor = testMonitor;
        await monitorCheckRepository.save(check);
      }

      return authHelper
        .makeAuthenticatedRequest(
          'get',
          `${monitorUrl(testMonitor.id)}/summary`,
          user1Cookies,
        )
        .expect(200)
        .expect((res) => {
          expect(res.body).toHaveProperty('currentlyUpForMs');
          expect(res.body).toHaveProperty('lastCheckedAt');
          expect(res.body.currentlyUpForMs).toBeGreaterThan(0);
          expect(res.body.lastCheckedAt).not.toBeNull();
        });
    });

    it('should return null values when no checks exist', () => {
      return authHelper
        .makeAuthenticatedRequest(
          'get',
          `${monitorUrl(testMonitor.id)}/summary`,
          user1Cookies,
        )
        .expect(200)
        .expect((res) => {
          expect(res.body.currentlyUpForMs).toBeNull();
          expect(res.body.lastCheckedAt).toBeNull();
        });
    });
  });

  describe('Response Times', () => {
    beforeEach(async () => {
      const now = new Date();

      for (let i = 0; i < 3; i++) {
        const check = new MonitorCheck({
          status: CheckStatus.UP,
          region: MonitorRegion.EUROPE,
          checkedAt: new Date(now.getTime() - i * 60_000),
          dnsLookupMs: 10 + i * 5,
          tcpConnectionMs: 20 + i * 5,
          tlsHandshakeMs: 15 + i * 5,
          totalResponseMs: 100 + i * 50,
        });

        check.monitor = testMonitor;
        await monitorCheckRepository.save(check);
      }
    });

    it('should return response time series for default period', () => {
      return authHelper
        .makeAuthenticatedRequest(
          'get',
          `${monitorUrl(testMonitor.id)}/response-times`,
          user1Cookies,
        )
        .expect(200)
        .expect((res) => {
          expect(Array.isArray(res.body)).toBe(true);
          expect(res.body).toHaveLength(3);
          expect(res.body[0]).toHaveProperty('checkedAt');
          expect(res.body[0]).toHaveProperty('dnsLookupMs');
          expect(res.body[0]).toHaveProperty('tcpConnectionMs');
          expect(res.body[0]).toHaveProperty('tlsHandshakeMs');
          expect(res.body[0]).toHaveProperty('totalResponseMs');
        });
    });

    it('should filter response times by region', () => {
      return authHelper
        .makeAuthenticatedRequest(
          'get',
          `${monitorUrl(testMonitor.id)}/response-times?region=${MonitorRegion.EUROPE}`,
          user1Cookies,
        )
        .expect(200)
        .expect((res) => {
          expect(res.body).toHaveLength(3);
        });
    });

    it('should return empty array for region with no data', () => {
      return authHelper
        .makeAuthenticatedRequest(
          'get',
          `${monitorUrl(testMonitor.id)}/response-times?region=${MonitorRegion.AUSTRALIA}`,
          user1Cookies,
        )
        .expect(200)
        .expect((res) => {
          expect(res.body).toHaveLength(0);
        });
    });

    it('should accept period parameter', () => {
      return authHelper
        .makeAuthenticatedRequest(
          'get',
          `${monitorUrl(testMonitor.id)}/response-times?period=week`,
          user1Cookies,
        )
        .expect(200)
        .expect((res) => {
          expect(Array.isArray(res.body)).toBe(true);
        });
    });
  });

  describe('Availability', () => {
    beforeEach(async () => {
      const now = new Date();

      const checks = [
        { status: CheckStatus.UP, offset: 0 },
        { status: CheckStatus.UP, offset: 180_000 },
        { status: CheckStatus.DOWN, offset: 360_000 },
        { status: CheckStatus.DOWN, offset: 540_000 },
        { status: CheckStatus.UP, offset: 720_000 },
        { status: CheckStatus.UP, offset: 900_000 },
      ];

      for (const c of checks) {
        const check = new MonitorCheck({
          status: c.status,
          region: MonitorRegion.EUROPE,
          checkedAt: new Date(now.getTime() - c.offset),
          totalResponseMs: 100,
        });

        check.monitor = testMonitor;
        await monitorCheckRepository.save(check);
      }
    });

    it('should return availability for default periods', () => {
      return authHelper
        .makeAuthenticatedRequest(
          'get',
          `${monitorUrl(testMonitor.id)}/availability`,
          user1Cookies,
        )
        .expect(200)
        .expect((res) => {
          expect(Array.isArray(res.body)).toBe(true);
          expect(res.body.length).toBeGreaterThanOrEqual(1);

          const period = res.body[0];
          expect(period).toHaveProperty('label');
          expect(period).toHaveProperty('from');
          expect(period).toHaveProperty('to');
          expect(period).toHaveProperty('availabilityPercent');
          expect(period).toHaveProperty('downtimeMs');
          expect(period).toHaveProperty('incidentCount');
          expect(period).toHaveProperty('longestDowntimeMs');
          expect(period).toHaveProperty('averageDowntimeMs');
        });
    });

    it('should return availability for custom date range', () => {
      const from = new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString();
      const to = new Date().toISOString();

      return authHelper
        .makeAuthenticatedRequest(
          'get',
          `${monitorUrl(testMonitor.id)}/availability?from=${from}&to=${to}`,
          user1Cookies,
        )
        .expect(200)
        .expect((res) => {
          expect(res.body).toHaveLength(1);
          expect(res.body[0].label).toBe('Custom');
        });
    });

    it('should calculate downtime correctly', () => {
      return authHelper
        .makeAuthenticatedRequest(
          'get',
          `${monitorUrl(testMonitor.id)}/availability`,
          user1Cookies,
        )
        .expect(200)
        .expect((res) => {
          const body = res.body as any[];
          const todayPeriod = body.find((p: any) => p.label === 'Today');

          if (todayPeriod) {
            expect(todayPeriod.availabilityPercent).toBeLessThan(100);
            expect(todayPeriod.downtimeMs).toBeGreaterThan(0);
            expect(todayPeriod.incidentCount).toBeGreaterThanOrEqual(1);
          }
        });
    });
  });

  // ── Cross-org isolation ─────────────────────────────────────────────

  describe('Cross-organization Isolation', () => {
    it('should prevent user from accessing monitors of another org', () => {
      return authHelper
        .makeAuthenticatedRequest('get', monitorsUrl(), user2Cookies)
        .expect(403);
    });

    it('should prevent user from viewing a monitor in another org', () => {
      return authHelper
        .makeAuthenticatedRequest(
          'get',
          monitorUrl(testMonitor.id),
          user2Cookies,
        )
        .expect(403);
    });

    it('should prevent user from deleting a monitor in another org', () => {
      return authHelper
        .makeAuthenticatedRequest(
          'delete',
          monitorUrl(testMonitor.id),
          user2Cookies,
        )
        .expect(403);
    });

    it('should prevent user from pausing a monitor in another org', () => {
      return authHelper
        .makeAuthenticatedRequest(
          'post',
          `${monitorUrl(testMonitor.id)}/pause`,
          user2Cookies,
        )
        .expect(403);
    });

    it('should prevent user from viewing checks of another org monitor', () => {
      return authHelper
        .makeAuthenticatedRequest(
          'get',
          `${monitorUrl(testMonitor.id)}/checks`,
          user2Cookies,
        )
        .expect(403);
    });
  });
});
