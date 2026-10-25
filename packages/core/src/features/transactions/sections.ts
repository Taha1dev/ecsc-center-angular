import type { Type } from '@angular/core';
import { sections } from '@workspace/domain';
import type { SectionEntry } from '../../module';
import { ActionsSection } from './sections/actions/actions';
import { ActivitySection } from './sections/activity/activity';
import { ApplicantsSection } from './sections/applicants/applicants';
import { AttachmentsSection } from './sections/attachments/attachments';
import { DecisionsSection } from './sections/decisions/decisions';
import { FeesSection } from './sections/fees/fees';
import { FieldsSection } from './sections/fields/fields';
import { NotesSection } from './sections/notes/notes';
import { OutputSection } from './sections/output/output';
import { OverviewSection } from './sections/overview/overview';
import { PartiesSection } from './sections/parties/parties';
import { PaymentsSection } from './sections/payments/payments';
import { RefundsSection } from './sections/refunds/refunds';
import { RequirementsSection } from './sections/requirements/requirements';
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
