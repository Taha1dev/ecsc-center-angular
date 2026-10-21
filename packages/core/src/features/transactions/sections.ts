import type { Type } from '@angular/core';
import { sections } from '@workspace/domain';
import type { SectionEntry } from '../../module';
import { ActionsSection } from './sections/actions';
import { ActivitySection } from './sections/activity';
import { ApplicantsSection } from './sections/applicants';
import { AttachmentsSection } from './sections/attachments';
import { DecisionsSection } from './sections/decisions';
import { FeesSection } from './sections/fees';
import { FieldsSection } from './sections/fields';
import { NotesSection } from './sections/notes';
import { OutputSection } from './sections/output';
import { OverviewSection } from './sections/overview';
import { PartiesSection } from './sections/parties';
import { PaymentsSection } from './sections/payments';
import { RefundsSection } from './sections/refunds';
import { RequirementsSection } from './sections/requirements';
const renderers: Record<string, Type<unknown>> = {
  overview: OverviewSection,
  applicants: ApplicantsSection,
  parties: PartiesSection,
  fields: FieldsSection,
  requirements: RequirementsSection,
  attachments: AttachmentsSection,
  payments: PaymentsSection,
  fees: FeesSection,
  refunds: RefundsSection,
  decisions: DecisionsSection,
  actions: ActionsSection,
  notes: NotesSection,
  activity: ActivitySection,
  output: OutputSection,
};
export const defaultSections: SectionEntry[] = sections.map((section, order) => ({
  ...section,
  order,
  component: renderers[section.id],
}));
