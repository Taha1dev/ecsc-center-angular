import { CdkMenu, CdkMenuItem } from '@angular/cdk/menu';
import type { ConnectedPosition } from '@angular/cdk/overlay';
import { Component, computed, input } from '@angular/core';
import { HlmButton } from '../helm/button';
import { HlmMenuTrigger } from '../helm/menu-trigger';
import { AppIcon } from './icon';
export type ActionGroup = { id: string; label: string; order?: number };
export type MenuAction = {
  id: string;
  label: string;
  icon?: string;
  disabled?: boolean;
  reason?: string;
  intent?: 'neutral' | 'normal' | 'primary' | 'warning' | 'danger';
  group?: ActionGroup;
  onSelect: () => void;
};
let menuSerial = 0;
@Component({
  selector: 'app-action-menu',
  imports: [CdkMenu, CdkMenuItem, HlmMenuTrigger, HlmButton, AppIcon],
  template: ` @if (actions().length) {
      <button
        hlmBtn
        hlmMenuTrigger
        [variant]="text() || !showIcon() ? 'outline' : 'ghost'"
        [size]="text() || !showIcon() ? 'default' : 'icon'"
        type="button"
        [disabled]="disabled()"
        [attr.aria-label]="label()"
        [cdkMenuTriggerFor]="menu"
        [cdkMenuPosition]="positions"
      >
        <ng-content />
        @if (!text() && showIcon()) {
          <app-icon name="phosphorDotsThree" />
        } @else {
          {{ text() }}
        }
      </button>
    }
    <ng-template #menu
      ><div
        cdkMenu
        dir="rtl"
        [attr.aria-label]="label()"
        class="z-50 max-h-[85svh] w-72 max-w-[calc(100vw-1.5rem)] overflow-y-auto rounded-panel border bg-popover p-1.5 text-start shadow-float"
      >
        @for (group of groups(); track group.id) {
          @if ($index) {
            <div role="separator" class="mx-2 my-1.5 h-px bg-border"></div>
          }
          <div role="group" [attr.aria-labelledby]="group.label ? id + '-' + group.id : null">
            @if (group.label) {
              <p
                [id]="id + '-' + group.id"
                class="px-3 pt-2 pb-1 text-xs font-medium text-muted-foreground"
              >
                {{ group.label }}
              </p>
            }
            @for (action of group.actions; track action.id) {
              <button
                cdkMenuItem
                [cdkMenuItemDisabled]="!!action.disabled"
                [attr.aria-describedby]="action.reason ? id + '-' + action.id + '-reason' : null"
                (cdkMenuItemTriggered)="select(action)"
                [class]="
                  'flex min-h-11 w-full cursor-default flex-col justify-center rounded-control px-3 py-2.5 text-start text-sm outline-none focus-visible:ring-1 focus-visible:ring-inset focus-visible:ring-ring/30 aria-disabled:opacity-60 ' +
                  intentClass(action.intent)
                "
              >
                <span class="flex items-center gap-2.5">
                  @if (action.icon; as icon) {
                    <app-icon [name]="icon" size="18px" />
                  }
                  {{ action.label }}</span
                >
                @if (action.reason) {
                  <span
                    [id]="id + '-' + action.id + '-reason'"
                    class="mt-1 text-xs text-muted-foreground"
                    >{{ action.reason }}</span
                  >
                }
              </button>
            }
          </div>
        }
      </div></ng-template
    >`,
})
export class AppActionMenu {
  readonly disabled = input(false);
  readonly showIcon = input(true);
  readonly label = input('الإجراءات');
  readonly text = input('');
  readonly actions = input.required<readonly MenuAction[]>();
  readonly id = 'menu-' + ++menuSerial;
  readonly positions: ConnectedPosition[] = [
    { originX: 'end', originY: 'bottom', overlayX: 'end', overlayY: 'top', offsetY: 5 },
    { originX: 'end', originY: 'top', overlayX: 'end', overlayY: 'bottom', offsetY: -5 },
  ];
  readonly groups = computed(() => {
    const groups = new Map<
      string,
      { id: string; label: string; order: number; actions: MenuAction[] }
    >();
    for (const action of this.actions()) {
      const id = action.group?.id || 'ungrouped',
        group = groups.get(id);
      if (group) group.actions.push(action);
      else
        groups.set(id, {
          id,
          label: action.group?.label || '',
          order: action.group?.order ?? 0,
          actions: [action],
        });
    }
    return [...groups.values()].toSorted((a, b) => a.order - b.order);
  });
  intentClass(intent: MenuAction['intent']) {
    return intent === 'danger'
      ? 'text-danger hover:bg-danger-soft focus-visible:bg-danger-soft'
      : intent === 'warning'
        ? 'text-warning-foreground hover:bg-warning-soft focus-visible:bg-warning-soft'
        : intent === 'primary'
          ? 'text-primary hover:bg-primary-soft focus-visible:bg-primary-soft'
          : 'text-popover-foreground hover:bg-accent focus-visible:bg-accent';
  }
  select(action: MenuAction) {
    if (!action.disabled) setTimeout(() => action.onSelect(), 0);
  }
}
