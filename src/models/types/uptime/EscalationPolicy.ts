export enum EscalationPolicy {
  DO_NOTHING = 'DO_NOTHING',
  IMMEDIATELY = 'IMMEDIATELY',
  WITHIN_3_MIN = 'WITHIN_3_MIN',
  WITHIN_5_MIN = 'WITHIN_5_MIN',
  WITHIN_10_MIN = 'WITHIN_10_MIN',
}

export const ESCALATION_DELAY_MS: Record<EscalationPolicy, number> = {
  [EscalationPolicy.DO_NOTHING]: 0,
  [EscalationPolicy.IMMEDIATELY]: 0,
  [EscalationPolicy.WITHIN_3_MIN]: 3 * 60 * 1000,
  [EscalationPolicy.WITHIN_5_MIN]: 5 * 60 * 1000,
  [EscalationPolicy.WITHIN_10_MIN]: 10 * 60 * 1000,
};
