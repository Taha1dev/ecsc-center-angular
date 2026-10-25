import { Component } from '@angular/core';
import { AppDataTable, AppKeyValues, AppPanel, HlmButton } from '@workspace/ui';
import { SectionBase } from '../section-base';
@Component({
  selector: 'app-fees-section',
  imports: [AppPanel, AppKeyValues, AppDataTable, HlmButton],
  templateUrl: './fees.html',
})
export class FeesSection extends SectionBase {}
