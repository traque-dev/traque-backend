import { config } from 'core/config';
import { getSSLConfig } from 'core/db/utils/getSSLConfig';

import { DataSource, DataSourceOptions } from 'typeorm';

import { Account } from 'models/entity/Account.entity';
import { ApiKey } from 'models/entity/ApiKey.entity';
import { Bug } from 'models/entity/Bug.entity';
import { BugActivity } from 'models/entity/BugActivity.entity';
import { BugComment } from 'models/entity/BugComment.entity';
import { BugFile } from 'models/entity/BugFile.entity';
import { BugLabel } from 'models/entity/BugLabel.entity';
import { BugReproductionStep } from 'models/entity/BugReproductionStep.entity';
import { Conversation } from 'models/entity/Conversation.entity';
import { Event } from 'models/entity/Event.entity';
import { EventNotificationTrigger } from 'models/entity/EventNotificationTrigger.entity';
import { Exception } from 'models/entity/Exception.entity';
import { ExceptionFrame } from 'models/entity/ExceptionFrame.entity';
import { Feedback } from 'models/entity/Feedback.entity';
import { FeedbackActivity } from 'models/entity/FeedbackActivity.entity';
import { FeedbackComment } from 'models/entity/FeedbackComment.entity';
import { FeedbackFile } from 'models/entity/FeedbackFile.entity';
import { File } from 'models/entity/File.entity';
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
import { Incident } from 'models/entity/uptime/Incident.entity';
import { IncidentTimelineEntry } from 'models/entity/uptime/IncidentTimelineEntry.entity';
import { Monitor } from 'models/entity/uptime/Monitor.entity';
import { MonitorCheck } from 'models/entity/uptime/MonitorCheck.entity';
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
    File,
    BugFile,
    ExceptionFrame,
    PushNotificationToken,
    HttpContext,
    IpAddress,
    WaitlistParticipant,
    Event,
    EventNotificationTrigger,
    Conversation,
    Bug,
    BugActivity,
    BugComment,
    BugLabel,
    BugReproductionStep,
    // Person,

    // feedback
    Feedback,
    FeedbackActivity,
    FeedbackComment,
    FeedbackFile,

    // uptime
    Monitor,
    MonitorCheck,
    Incident,
    IncidentTimelineEntry,

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
