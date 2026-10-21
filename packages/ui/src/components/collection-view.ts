import { NgTemplateOutlet } from '@angular/common';
import { Component, effect, input, signal, TemplateRef } from '@angular/core';
import type { RowSelectionState } from '@tanstack/angular-table';
import { HlmButton } from '../helm/button';
import type { MenuAction } from './action-menu';
import { AppDataTable, type TableColumn } from './data-table';
import { AppIcon } from './icon';
@Component({
  selector: 'app-collection-view',
  host: { class: 'block min-w-0' },
  imports: [NgTemplateOutlet, AppDataTable, HlmButton, AppIcon],
  template: `<div class="min-w-0 space-y-4">
    @if (data().length > 1) {
      <div class="flex flex-wrap items-center justify-between gap-3">
        <p class="text-sm text-muted-foreground">
          {{ label() }} · نفس السجلات والإجراءات في العرضين
        </p>
        <div class="flex gap-1 rounded-inset bg-muted p-1">
          <button
            hlmBtn
            size="sm"
            type="button"
            [variant]="activeView() === 'table' ? 'secondary' : 'ghost'"
            [attr.aria-pressed]="activeView() === 'table'"
            (click)="view.set('table')"
          >
            <app-icon name="phosphorTable" />عرض الجدول</button
          ><button
            hlmBtn
            size="sm"
            type="button"
            [variant]="activeView() === 'cards' ? 'secondary' : 'ghost'"
            [attr.aria-pressed]="activeView() === 'cards'"
            (click)="view.set('cards')"
          >
            <app-icon name="phosphorSquaresFour" />عرض البطاقات
          </button>
        </div>
      </div>
    }
    <div [hidden]="activeView() !== 'table'">
      <app-data-table
        [data]="data()"
        [columns]="columns()"
        [getRowId]="getRowId()"
        [selection]="true"
        [(selectedRows)]="selected"
        [actions]="actions()"
      />
    </div>
    <div
      [hidden]="activeView() !== 'cards'"
      [class]="data().length > 1 ? 'grid min-w-0 gap-4 sm:grid-cols-2' : 'grid min-w-0 gap-4'"
    >
      @for (row of data(); track getRowId()(row)) {
        <div class="min-w-0">
          @if (data().length > 1) {
            <label class="mb-2 flex items-center gap-2 text-sm text-muted-foreground"
              ><input
                type="checkbox"
                class="size-4 accent-primary"
                [checked]="!!selected()[getRowId()(row)]"
                [attr.aria-label]="'تحديد السجل ' + getRowId()(row)"
                (change)="toggle(row)"
              />تحديد السجل</label
            >
          }
          <ng-container
            [ngTemplateOutlet]="card()"
            [ngTemplateOutletContext]="{ $implicit: row }"
          />
        </div>
      }
    </div>
  </div>`,
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
