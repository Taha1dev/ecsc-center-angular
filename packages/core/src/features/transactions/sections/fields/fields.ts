import { Component } from '@angular/core';
import { AppPanel, HlmButton } from '@workspace/ui';
import { SectionBase } from '../section-base';
@Component({
  selector: 'app-fields-section',
  imports: [AppPanel, HlmButton],
  templateUrl: './fields.html',
})
export class FieldsSection extends SectionBase {}
