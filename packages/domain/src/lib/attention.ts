import type { Transaction } from '../types/domain';
import { REFERENCE_DATE } from './format';
export type AttentionKind = 'overdue' | 'unassigned' | 'waiting';
export function attentionReasons(t: Transaction): AttentionKind[] {
  const reasons: AttentionKind[] = [];
  if (t.deadline < REFERENCE_DATE && t.status !== 'completed' && t.status !== 'rejected')
    reasons.push('overdue');
  if (!t.owner) reasons.push('unassigned');
  if (t.status === 'waiting') reasons.push('waiting');
  return reasons;
}
