import type { TransactionRecord } from '../domain/model';
import type { FieldDefinition } from '../domain/services';
export type Transaction = Omit<TransactionRecord, 'notes' | 'decisions' | 'activity'> & {
  notes: (TransactionRecord['notes'][number] & { author: string })[];
  decisions: (TransactionRecord['decisions'][number] & { author: string })[];
  activity: (TransactionRecord['activity'][number] & { actor: string })[];
  type: string;
  group: string;
  team: string;
  owner: string;
  step: string;
  fields: {
    id: string;
    label: string;
    value: string;
    kind: FieldDefinition['kind'];
  }[];
  requirements: {
    id: string;
    label: string;
    provided: boolean;
    optional: boolean;
  }[];
};
