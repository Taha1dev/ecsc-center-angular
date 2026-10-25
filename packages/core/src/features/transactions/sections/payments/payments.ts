import { Component } from '@angular/core';
import { AppDataTable, AppKeyValues, AppPanel, HlmButton } from '@workspace/ui';
import { SectionBase } from '../section-base';
@Component({
  selector: 'app-payments-section',
  imports: [AppPanel, AppKeyValues, AppDataTable, HlmButton],
  templateUrl: './payments.html',
})
export class PaymentsSection extends SectionBase {}
