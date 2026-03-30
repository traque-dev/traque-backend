export enum MonitorType {
  HTTP_UNAVAILABLE = 'HTTP_UNAVAILABLE',
  HTTP_KEYWORD_MISSING = 'HTTP_KEYWORD_MISSING',
  HTTP_KEYWORD_PRESENT = 'HTTP_KEYWORD_PRESENT',
  HTTP_STATUS_CODE = 'HTTP_STATUS_CODE',
  PING = 'PING',
  TCP = 'TCP',
  UDP = 'UDP',
  SMTP = 'SMTP',
  POP3 = 'POP3',
  IMAP = 'IMAP',
  DNS = 'DNS',
  PLAYWRIGHT = 'PLAYWRIGHT',
}

export const PREMIUM_MONITOR_TYPES: MonitorType[] = [
  MonitorType.TCP,
  MonitorType.UDP,
  MonitorType.SMTP,
  MonitorType.POP3,
  MonitorType.IMAP,
  MonitorType.DNS,
  MonitorType.PLAYWRIGHT,
];
