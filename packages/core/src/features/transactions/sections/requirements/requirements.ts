import { Component } from '@angular/core';
import { AppPanel, AppStatusBadge, HlmButton } from '@workspace/ui';
import { SectionBase } from '../section-base';
@Component({
  selector: 'app-requirements-section',
  imports: [AppPanel, AppStatusBadge, HlmButton],
  templateUrl: './requirements.html',
})
export class RequirementsSection extends SectionBase {}
