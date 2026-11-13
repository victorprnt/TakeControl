/**
 * Envelope consumption bands. The budget service is the only place that applies them.
 * Change these numbers to retune every progress indicator.
 */
export const budgetThresholds = {
  /** From this percent, inclusive, the envelope asks for attention. */
  attentionFromPercent: 70,
  /** Above this percent the envelope is critical. */
  criticalAbovePercent: 90,
} as const;
