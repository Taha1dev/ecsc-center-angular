import { NgTemplateOutlet } from '@angular/common';
import { Component, effect, input, signal, TemplateRef } from '@angular/core';
import type { RowSelectionState } from '@tanstack/angular-table';
import { HlmButton } from '@spartan-ng/helm/button';
import type { MenuAction } from '../action-menu/action-menu';
import { AppDataTable, type TableColumn } from '../data-table/data-table';
import { AppIcon } from '../icon/icon';
@Component({
  selector: 'app-collection-view',
  host: { class: 'block min-w-0' },
  imports: [NgTemplateOutlet, AppDataTable, HlmButton, AppIcon],
  templateUrl: './collection-view.html',
})
export class CollectionView<T extends object> {
  readonly data = input.required<readonly T[]>();
  readonly columns = input.required<readonly TableColumn<T>[]>();
  readonly getRowId = input.required<(row: T) => string>();
  readonly card = input.required<TemplateRef<{ $implicit: T }>>();
  readonly label = input.required<string>();
  readonly actions = input<((row: T) => readonly MenuAction[]) | null>(null);
  readonly view = signal<'table' | 'cards' | null>(null);
  readonly selected = signal<RowSelectionState>({});
  constructor() {
    effect(() => {
      if (this.view() === null) this.view.set(this.data().length > 1 ? 'table' : 'cards');
    });
  }
  activeView() {
    return this.view() ?? (this.data().length > 1 ? 'table' : 'cards');
  }
  toggle(row: T) {
    const id = this.getRowId()(row);
    this.selected.update((v) => {
      const next = { ...v };
      if (next[id]) delete next[id];
      else next[id] = true;
      return next;
    });
  }
}
