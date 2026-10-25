import { Component, computed, input } from '@angular/core';
import { AppIcon } from '../icon/icon';
export type Intent =
  'neutral' | 'primary' | 'secondary' | 'success' | 'warning' | 'info' | 'danger';
const badgeStyles: Record<Intent, string> = {
  neutral: 'bg-neutral-soft text-neutral-foreground border-neutral-border',
  primary: 'bg-primary-soft text-primary-soft-foreground border-primary/20',
  secondary: 'bg-secondary-soft text-secondary-soft-foreground border-secondary/20',
  success: 'bg-success-soft text-success-foreground border-success-border',
  warning: 'bg-warning-soft text-warning-foreground border-warning-border',
  info: 'bg-info-soft text-info-foreground border-info-border',
  danger: 'bg-danger-soft text-danger-foreground border-danger-border',
};
@Component({
  selector: 'app-status-badge',
  imports: [AppIcon],
  templateUrl: './status-badge.html',
})
export class AppStatusBadge {
  readonly label = input.required<string>();
  readonly intent = input<Intent>('neutral');
  readonly classes = computed(
    () =>
      'inline-flex items-center gap-1.5 rounded-full border px-2.5 py-1 text-sm ' +
      badgeStyles[this.intent()],
  );
}
