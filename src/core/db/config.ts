import { config } from 'core/config';
import { getSSLConfig } from 'core/db/utils/getSSLConfig';

import { DataSource, DataSourceOptions } from 'typeorm';

import { Account } from 'models/entity/Account.entity';
import { ApiKey } from 'models/entity/ApiKey.entity';
import { Conversation } from 'models/entity/Conversation.entity';
import { Event } from 'models/entity/Event.entity';
import { EventNotificationTrigger } from 'models/entity/EventNotificationTrigger.entity';
import { Exception } from 'models/entity/Exception.entity';
import { ExceptionFrame } from 'models/entity/ExceptionFrame.entity';
import { HttpContext } from 'models/entity/HttpContext.entity';
import { AwsWafCredentials } from 'models/entity/integrations/aws/waf/AwsWafCredentials.entity';
import { Invitation } from 'models/entity/Invitation.entity';
import { IpAddress } from 'models/entity/IpAddress.entity';
import { Issue } from 'models/entity/Issue.entity';
import { Jwks } from 'models/entity/Jwks.entity';
import { Member } from 'models/entity/Member.entity';
import { Organization } from 'models/entity/Organization.entity';
// import { Person } from 'models/entity/Person.entity';
import { Project } from 'models/entity/Project.entity';
import { PushNotificationToken } from 'models/entity/PushNotificationToken.entity';
import { Session } from 'models/entity/Session.entity';
import { Subscription } from 'models/entity/Subscription.entity';
import { TwoFactor } from 'models/entity/TwoFactor.entity';
import { User } from 'models/entity/User.entity';
import { Verification } from 'models/entity/Verification.entity';
import { WaitlistParticipant } from 'models/entity/WaitlistParticipant.entity';

export const dataSourceConfig: DataSourceOptions = {
  type: 'postgres',
  host: config.app.datasource.host,
  port: config.app.datasource.port,
  database: config.app.datasource.database,
  username: config.app.datasource.username,
  password: config.app.datasource.password,
  ...getSSLConfig(),
  entities: [
    // auth
    Account,
    Session,
    User,
    Verification,
    ApiKey,

    // two factor
    TwoFactor,

    // organization
    Organization,
    Member,
    Invitation,
    Subscription,

    // jwt
    Jwks,

    // app
    Project,
    Issue,
    Exception,
    ExceptionFrame,
    PushNotificationToken,
    HttpContext,
    IpAddress,
    WaitlistParticipant,
    Event,
    EventNotificationTrigger,
    Conversation,
    // Person,

    // integrations
    // aws
    AwsWafCredentials,
  ],
  logging: ['error'],
  migrationsTableName: 'migrations',
  migrationsRun: true,
  migrations: ['dist/core/db/migrations/*.js'],
};

const dataSource = new DataSource(dataSourceConfig);

export default dataSource;
