import { config } from 'core/config';
import { resend } from 'core/email/sender';

import { expo } from '@better-auth/expo';
import { Logger } from '@nestjs/common';
import { betterAuth } from 'better-auth';
import {
  twoFactor,
  openAPI,
  organization,
  jwt,
  bearer,
  anonymous,
} from 'better-auth/plugins';
import { Pool } from 'pg';

import { polarPlugin } from './polar';

const twoFactorPlugin = twoFactor({
  schema: {
    user: {
      modelName: 'users',
      fields: {
        twoFactorEnabled: 'two_factor_enabled',
      },
    },
    twoFactor: {
      modelName: 'two_factor',
      fields: {
        backupCodes: 'backup_codes',
        userId: 'user_id',
      },
    },
  },
});

const organizationPlugin = organization({
  schema: {
    session: {
      modelName: 'sessions',
      fields: {
        activeOrganizationId: 'active_organization_id',
      },
    },
    organization: {
      modelName: 'organizations',
      fields: {
        createdAt: 'created_at',
      },
    },
    member: {
      modelName: 'members',
      fields: {
        createdAt: 'created_at',
        organizationId: 'organization_id',
        userId: 'user_id',
      },
    },
    invitation: {
      modelName: 'invitations',
      fields: {
        organizationId: 'organization_id',
        inviterId: 'inviter_id',
        expiresAt: 'expires_at',
      },
    },
  },
  async sendInvitationEmail({ email, organization }) {
    await resend.emails.send({
      from: 'Traque <no-reply@traque.dev>',
      to: email,
      subject: `Join ${organization.name} on Traque Monitoring`,
      html: `
        <h2>You've been invited to join ${organization.name}</h2>
        <p>Hi there!</p>
        <p>You have been invited to join <strong>${organization.name}</strong> on Traque Monitoring.</p>
        <p>To accept this invitation, please download the Traque Monitoring mobile app and complete your registration.</p>
        <p>Welcome to the team!</p>
      `,
    });
  },
});

const jwtPlugin = jwt({
  jwt: {
    expirationTime: '2h',
  },
  schema: {
    jwks: {
      fields: {
        createdAt: 'created_at',
        publicKey: 'public_key',
        privateKey: 'private_key',
      },
    },
  },
});

const logger = new Logger('Auth');

const database = new Pool({
  host: config.app.datasource.host,
  database: config.app.datasource.database,
  user: config.app.datasource.username,
  password: config.app.datasource.password,
  port: config.app.datasource.port,
});

export const auth: ReturnType<typeof betterAuth> = betterAuth({
  plugins: [
    twoFactorPlugin,
    organizationPlugin,
    jwtPlugin,
    openAPI(),
    bearer(),
    expo(),
    anonymous({
      schema: {
        user: {
          fields: {
            isAnonymous: 'is_anonymous',
          },
        },
      },
    }),
    polarPlugin,
  ],

  emailAndPassword: {
    enabled: true,
    requireEmailVerification: true,
    sendResetPassword: async ({ user, url }) => {
      logger.log(`Sending reset password email to ${user.email}`);
      await resend.emails.send({
        from: 'Traque <no-reply@traque.dev>',
        to: user.email,
        subject: 'Reset your password',
        html: `Click the link to reset your password: ${url}`,
      });
    },
    onPasswordReset: async ({ user }): Promise<void> => {
      logger.log(`Password for user ${user.email} has been reset.`);
      await resend.emails.send({
        from: 'Traque <no-reply@traque.dev>',
        to: user.email,
        subject: 'Your password has been reset',
        html: 'Your password was changed. If this was not you, please contact support.',
      });
    },
  },

  emailVerification: {
    async sendVerificationEmail({ user, url }) {
      logger.log(`Sending verification email to ${user.email}`);
      await resend.emails.send({
        from: 'Traque <no-reply@traque.dev>',
        to: user.email,
        subject: `Verify your email to finish Traque signup`,
        html: `Thanks for signing up for Traque. To finish your signup, verify your email here: ${url} If you didn't sign up, you can ignore this message.`,
      });
    },
  },

  trustedOrigins: config.app.auth.trustedOrigins,
  secret: config.app.jwt.secret,
  baseURL: config.app.http.baseURL,
  logger,
  advanced: {
    crossSubDomainCookies: config.isProduction
      ? {
          enabled: config.app.auth.crossSubDomainCookies?.enabled ?? false,
          domain: config.app.auth.crossSubDomainCookies?.domain,
        }
      : undefined,
    defaultCookieAttributes: config.isProduction
      ? {
          secure: true,
          httpOnly: true,
          sameSite: 'none', // Allows CORS-based cookie sharing across subdomains
          partitioned: true, // New browser standards will mandate this for foreign cookies
        }
      : undefined,
    database: {
      generateId: false,
    },
  },
  database,
  socialProviders: {
    apple: {
      clientId: config.oauth.apple.clientId,
      clientSecret: config.oauth.apple.clientSecret,
    },
    google: {
      prompt: 'select_account',
      clientId: config.oauth.google.clientId,
      clientSecret: config.oauth.google.clientSecret,
    },
  },

  user: {
    deleteUser: {
      enabled: true,
    },
    modelName: 'users',
    fields: {
      createdAt: 'created_at',
      updatedAt: 'updated_at',
      emailVerified: 'email_verified',
    },
  },
  session: {
    modelName: 'sessions',
    fields: {
      createdAt: 'created_at',
      updatedAt: 'updated_at',
      userId: 'user_id',
      expiresAt: 'expires_at',
      ipAddress: 'ip_address',
      userAgent: 'user_agent',
    },
  },
  account: {
    modelName: 'accounts',
    fields: {
      createdAt: 'created_at',
      updatedAt: 'updated_at',
      userId: 'user_id',
      accountId: 'account_id',
      providerId: 'provider_id',
      accessToken: 'access_token',
      refreshToken: 'refresh_token',
      idToken: 'id_token',
      accessTokenExpiresAt: 'access_token_expires_at',
      refreshTokenExpiresAt: 'refresh_token_expires_at',
    },
  },
  verification: {
    modelName: 'verifications',
    fields: {
      createdAt: 'created_at',
      updatedAt: 'updated_at',
      expiresAt: 'expires_at',
    },
  },
  databaseHooks: {
    session: {
      create: {
        before: async (session) => {
          const userId = session.userId;
          let activeOrganizationId: string | null = null;

          try {
            const result = await database.query<{ id?: string }>(
              `SELECT o.id 
              FROM organizations o 
              JOIN members m ON m.organization_id = o.id 
              WHERE m.user_id = $1 
              ORDER BY o.created_at ASC 
              LIMIT 1`,
              [userId],
            );

            if (result.rows.length > 0) {
              const organizationId = result?.rows?.[0]?.id;

              if (organizationId) {
                activeOrganizationId = organizationId;
              }
            }
          } catch (error) {
            logger.error(`Failed to fetch active organization: ${error}`);
          }

          return {
            data: {
              ...session,
              activeOrganizationId,
            },
          };
        },
      },
    },
  },
});
