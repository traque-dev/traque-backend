export type ShortLinkClickJobData = {
  shortLinkId: string;
  clickedAt: string;
  ip?: string;
  userAgent?: string;
  referer?: string;
  language?: string;
};
