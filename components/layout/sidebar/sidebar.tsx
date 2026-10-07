'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Button } from '@/components/ui';
import { SidebarItem } from './sidebar-item';
import { sidebarNavigationGroups, sidebarText } from '@/constants';
import type { SidebarProps } from '@/types';

export const Sidebar = ({ isOpen, onClose, renderIcon }: SidebarProps) => {
  const activeHref = usePathname();

  return (
    <aside className="fixed inset-y-0 left-0 z-40 flex w-60 shrink-0 flex-col border-r border-border bg-surface lg:static lg:z-auto">
      <div className="flex h-20 items-center border-b border-border px-6">
        <Link href="/" className="flex items-center gap-3">
          <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-primary text-lg font-bold text-primary-foreground">
            {sidebarText.brand.mark}
          </span>
          <span className="text-lg font-semibold tracking-tight text-foreground truncate">
            {sidebarText.brand.name}
          </span>
        </Link>
      </div>

      <nav className="flex-1 overflow-y-auto px-4 py-6">
        <ul className="space-y-6">
          {sidebarNavigationGroups.map((group, groupIndex) => (
            <li key={groupIndex}>
              <ul className="space-y-1">
                {group.items.map((item) => (
                  <SidebarItem
                    key={item.href}
                    item={item}
                    activeHref={activeHref}
                    onNavigate={onClose}
                    renderIcon={renderIcon}
                  />
                ))}
              </ul>
            </li>
          ))}
        </ul>
      </nav>
    </aside>
  );
};
