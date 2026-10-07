import { emptyStateText } from '@/constants';
import type { EmptyStateProps } from '@/types';

const cx = (...classNames: (string | false | undefined)[]) => classNames.filter(Boolean).join(' ');

export function EmptyState({ icon, title, description, action, className }: EmptyStateProps) {
  return (
    <div
      className={cx('flex flex-col items-center justify-center px-6 py-12 text-center', className)}
    >
      {icon ? (
        <span
          aria-hidden="true"
          className="flex h-12 w-12 items-center justify-center rounded-full bg-surface-muted text-muted-foreground"
        >
          {icon}
        </span>
      ) : null}
      <p className="mt-4 text-sm font-semibold text-foreground">{title ?? emptyStateText.title}</p>
      {description ? <p className="mt-1 text-sm text-muted-foreground">{description}</p> : null}
      {action ? <div className="mt-4">{action}</div> : null}
    </div>
  );
}
