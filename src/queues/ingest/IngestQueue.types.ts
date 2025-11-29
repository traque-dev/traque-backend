export type IngestEventJobData = {
  projectId: string;
  eventId?: string;
  eventPayload: Record<string, unknown>;
  receivedAt: string;
};
