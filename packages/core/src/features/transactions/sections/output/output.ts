import { Component } from '@angular/core';
import { AppEntityCard, AppIcon, HlmButton } from '@workspace/ui';
import { SectionBase } from '../section-base';
@Component({
  selector: 'app-output-section',
  imports: [AppEntityCard, HlmButton, AppIcon],
  templateUrl: './output.html',
})
export class OutputSection extends SectionBase {
  readonly templates = ['إيصال استلام', 'ملخص المعاملة', 'بيان الرسوم'];
}
