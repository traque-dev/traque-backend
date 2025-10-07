import { IpInfoResponse } from 'core/types/IpInfoResponse';

export function isIpInfoResponse(data: unknown): data is IpInfoResponse {
  if (typeof data !== 'object' || data === null) return false;

  const obj = data as Record<string, unknown>;

  return (
    typeof obj.ip === 'string' &&
    typeof obj.city === 'string' &&
    typeof obj.region === 'string' &&
    typeof obj.country === 'string' &&
    typeof obj.loc === 'string' &&
    typeof obj.org === 'string' &&
    typeof obj.postal === 'string' &&
    typeof obj.timezone === 'string'
  );
}
