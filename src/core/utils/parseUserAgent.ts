import { ClickDeviceType } from 'models/types/shortlink/ClickDeviceType';

export type ParsedUserAgent = {
  deviceType: ClickDeviceType;
  browser?: string;
  os?: string;
  isBot: boolean;
};

const BOT_PATTERN =
  /bot|crawler|spider|crawling|slurp|facebookexternalhit|whatsapp|telegrambot|preview|headless|curl|wget|python-requests|axios|go-http/i;

function detectOs(ua: string): string | undefined {
  if (/windows nt/i.test(ua)) return 'Windows';
  if (/iphone|ipad|ipod/i.test(ua)) return 'iOS';
  if (/mac os x|macintosh/i.test(ua)) return 'macOS';
  if (/android/i.test(ua)) return 'Android';
  if (/linux/i.test(ua)) return 'Linux';
  return undefined;
}

function detectBrowser(ua: string): string | undefined {
  if (/edg\//i.test(ua)) return 'Edge';
  if (/opr\/|opera/i.test(ua)) return 'Opera';
  if (/firefox\//i.test(ua)) return 'Firefox';
  if (/chrome\//i.test(ua) && !/chromium/i.test(ua)) return 'Chrome';
  if (/safari\//i.test(ua) && !/chrome\//i.test(ua)) return 'Safari';
  return undefined;
}

function detectDeviceType(ua: string, isBot: boolean): ClickDeviceType {
  if (isBot) return ClickDeviceType.BOT;
  if (/ipad|tablet|playbook|silk/i.test(ua)) return ClickDeviceType.TABLET;
  if (/mobi|iphone|ipod|android.*mobile|windows phone/i.test(ua)) {
    return ClickDeviceType.MOBILE;
  }
  if (/windows nt|macintosh|mac os x|linux|cros/i.test(ua)) {
    return ClickDeviceType.DESKTOP;
  }
  return ClickDeviceType.UNKNOWN;
}

export function parseUserAgent(userAgent?: string): ParsedUserAgent {
  if (!userAgent) {
    return { deviceType: ClickDeviceType.UNKNOWN, isBot: false };
  }

  const isBot = BOT_PATTERN.test(userAgent);

  return {
    isBot,
    deviceType: detectDeviceType(userAgent, isBot),
    browser: detectBrowser(userAgent),
    os: detectOs(userAgent),
  };
}
