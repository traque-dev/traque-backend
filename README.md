# Traque Backend

A modern error and event tracking service built with NestJS. Traque helps you monitor, track, and analyze errors and events in your applications in real-time.

## Features

### Error Tracking

- **Exception Capture**: Capture and store application exceptions with detailed context
- **Exception Statistics**: Analyze error patterns and trends
- **AI-Powered Analysis**: Automatic exception analysis using AI agents
- **Issue Management**: Group related exceptions into manageable issues

### Event Tracking

- **Event Capture**: Track custom events from your applications
- **Event Notifications**: Configure triggers for event-based notifications
- **Real-time Monitoring**: Monitor events as they happen

### Integrations

- **AWS WAF Integration**: Connect with AWS Web Application Firewall
- **IP Details Lookup**: Get detailed information about IP addresses
- **Expo Push Notifications**: Send notifications to mobile devices

### Organization & Projects

- **Multi-tenancy**: Support for organizations with multiple projects
- **Team Management**: Invite team members and manage access
- **API Keys**: Secure API key management for each project
- **Subscription Management**: Handle different subscription tiers

### Security & Authentication

- **Better Auth Integration**: Modern authentication system
- **CSRF Protection**: Built-in CSRF token protection
- **Rate Limiting**: Prevent API abuse with throttling
- **API Key Authentication**: Secure SDK integration

## Tech Stack

- **Framework**: NestJS 11.x
- **Runtime**: Node.js 22
- **Database**: PostgreSQL with TypeORM
- **Authentication**: Better Auth
- **AI**: OpenAI integration with AI SDK
- **Email**: Resend
- **API Documentation**: Swagger + Scalar API Reference
- **Testing**: Jest
- **Package Manager**: pnpm

## Prerequisites

- Node.js 22 or higher
- PostgreSQL database
- pnpm (or npm/yarn)

## Installation

```bash
# Install pnpm if you haven't already
npm install -g pnpm

# Install dependencies
pnpm install
```

## Configuration

The application uses a YAML configuration file located at `resources/application.yaml`.

### Sentry-Compatible SDKs

Traque exposes a Sentry-style ingest API. To forward events from any official Sentry SDK:

1. Copy the project `api_key` and `id`.
2. Build a DSN that points to your Traque host:  
   `https://<api_key>@traque.your-domain.com/<project_id>`
3. Configure the SDK’s transport URL to `https://traque.your-domain.com/api/<project_id>/envelope`.

Only `event` envelope items are persisted today (sessions, transactions, attachments are skipped but still acknowledged). Rotate the `api_key` whenever you need to revoke a DSN.

### Environment Variables

You can also configure the application using environment variables, which take precedence over the YAML file.

## Running the Application

### Development Mode

```bash
# Start with hot-reload
pnpm run dev

# Or
pnpm run start:dev
```

### Production Mode

```bash
# Build the application
pnpm run build

# Start production server
pnpm run start:prod
```

### Debug Mode

```bash
pnpm run start:debug
```

## API Documentation

Once the application is running, you can access the API documentation at:

- **Scalar API Reference**: http://localhost:8080/api/reference

The API is versioned and accessible at `/api/v{version}/...`

## Database Migrations

### Generate Migration

```bash
pnpm run typeorm:migration:generate
# Enter migration name when prompted
```

### Create Empty Migration

```bash
pnpm run typeorm:migration:create
# Enter migration name when prompted
```

### Run Migrations

Migrations run automatically on application startup.

## Testing

```bash
# Unit tests
pnpm run test

# Watch mode
pnpm run test:watch

# Test coverage
pnpm run test:cov

# E2E tests
pnpm run test:e2e

# E2E tests with coverage
pnpm run test:e2e:cov

# Debug tests
pnpm run test:debug
```

## Code Quality

### Linting

```bash
pnpm run lint
```

### Formatting

```bash
pnpm run format
```

## Key Features Implementation

### Exception Tracking

Exceptions are captured through the `ExceptionCapture` controller and analyzed by the AI-powered `ExceptionAnalyzer` agent. Related exceptions are automatically grouped into issues for easier management.

### Event Tracking

Custom events can be tracked through the `EventCapture` controller. You can configure notification triggers based on specific event patterns.

### Multi-tenancy

The system supports multiple organizations, each with multiple projects. API keys are scoped to projects, ensuring proper data isolation.

### Real-time Notifications

Integration with Expo push notifications allows real-time alerts for critical errors and events.

## License

MIT

## Author

Dan Zabrotski, Speekl, LLC
