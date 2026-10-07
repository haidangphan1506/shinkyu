import Link from 'next/link';
import type { SidebarSubItemProps } from '@/types';

export const SidebarSubItem = ({ item, isActive, onNavigate }: SidebarSubItemProps) => {
  return (
    <li>
      <Link
        href={item.href}
        onClick={onNavigate}
        aria-current={isActive ? 'page' : undefined}
        className={`flex items-center gap-2 rounded-lg py-2 pr-2 text-sm transition-colors ${
          isActive
            ? 'bg-zinc-100 font-semibold text-zinc-950 dark:bg-zinc-800 dark:text-zinc-50'
            : 'font-medium text-zinc-600 hover:bg-zinc-100 hover:text-zinc-950 dark:text-zinc-400 dark:hover:bg-zinc-800 dark:hover:text-zinc-50'
        }`}
      >
        <span
          className={`h-1.5 w-1.5 shrink-0 rounded-full ${
            isActive ? 'bg-primary' : 'bg-zinc-300 dark:bg-zinc-600'
          }`}
        />
        <span className="flex-1 truncate">{item.label}</span>
        {item.badge ? (
          <span
            className={`rounded-full px-1.5 py-0.5 text-[11px] font-semibold ${
              isActive
                ? 'bg-primary text-primary-foreground'
                : 'bg-zinc-200 text-zinc-600 dark:bg-zinc-700 dark:text-zinc-300'
            }`}
          >
            {item.badge}
          </span>
        ) : null}
      </Link>
    </li>
  );
};
