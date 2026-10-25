import { CdkMenuModule } from '@angular/cdk/menu';
import { Component, computed, input, output, signal } from '@angular/core';
import { BrnPopoverImports } from '@spartan-ng/brain/popover';
import { HlmButton } from '../../helm/button';
import { HlmInput } from '../../helm/input';
import { AppIcon } from '../icon/icon';
@Component({
  selector: 'app-combobox',
  imports: [BrnPopoverImports, CdkMenuModule, HlmButton, HlmInput, AppIcon],
  templateUrl: './combobox.html',
})
export class AppCombobox {
  readonly label = input.required<string>();
  readonly options =
    input.required<readonly { value: string; label: string; keywords?: string[] }[]>();
  readonly selected = output<string>();
  readonly open = signal(false);
  readonly query = signal('');
  readonly filtered = computed(() => {
    const q = this.normalize(this.query());
    return this.options().filter((o) =>
      this.normalize(o.label + ' ' + (o.keywords ?? []).join(' ')).includes(q),
    );
  });
  normalize(s: string) {
    return s
      .normalize('NFKD')
      .replace(/[\u064B-\u065F]/g, '')
      .toLowerCase();
  }
  search(e: Event) {
    this.query.set((e.target as HTMLInputElement).value);
  }
  select(id: string) {
    this.selected.emit(id);
    this.open.set(false);
    this.query.set('');
  }
}
