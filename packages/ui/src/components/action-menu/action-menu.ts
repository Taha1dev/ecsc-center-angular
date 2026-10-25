import { CdkMenu, CdkMenuItem } from '@angular/cdk/menu';
import type { ConnectedPosition } from '@angular/cdk/overlay';
import { Component, computed, input } from '@angular/core';
import { HlmButton } from '@spartan-ng/helm/button';
import { AppMenuTrigger } from './menu-trigger';
import { AppIcon } from '../icon/icon';
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
  imports: [CdkMenu, CdkMenuItem, AppMenuTrigger, HlmButton, AppIcon],
  templateUrl: './action-menu.html',
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
