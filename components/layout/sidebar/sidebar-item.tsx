'use client';

import { useId, useState } from 'react';
import Link from 'next/link';
import { SidebarSubItem } from './sidebar-sub-item';
import { sidebarText } from '@/constants';
import type { SidebarItemProps } from '@/types';

const normalizePath = (href: string) => href.split(/[?#]/)[0].replace(/\/+$/, '') || '/';

const isHrefActive = (href: string, activeHref: string | null) =>
  activeHref !== null && normalizePath(href) === normalizePath(activeHref);

export const SidebarItem = ({ item, activeHref, onNavigate, renderIcon }: SidebarItemProps) => {
  const subItems = item.subItems ?? [];
  const hasSubItems = subItems.length > 0;
  const isActive = isHrefActive(item.href, activeHref);
  const isSubItemActive = hasSubItems
    ? subItems.some((subItem) => isHrefActive(subItem.href, activeHref))
    : false;
  const subItemsId = useId();
  const [isExpandedOverride, setIsExpandedOverride] = useState<boolean | null>(null);
  const isExpanded = isExpandedOverride ?? (hasSubItems && (isActive || isSubItemActive));

  const rowClassName = `flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-left text-sm transition-colors ${
    isActive
      ? 'bg-primary font-semibold text-primary-foreground shadow-sm'
      : isSubItemActive
        ? 'font-semibold text-foreground hover:bg-surface-muted'
        : 'font-medium text-muted-foreground hover:bg-surface-muted hover:text-foreground'
  }`;

  const rowContent = (
    <>
      {renderIcon(item.icon, 'h-4.5 w-4.5 shrink-0')}
      <span className="flex-1 truncate">{item.label}</span>
      {item.badge ? (
        <span
          className={`rounded-full px-2 py-0.5 text-[11px] font-semibold ${
            isActive
              ? 'bg-primary-foreground/20 text-primary-foreground'
              : 'bg-zinc-200 text-zinc-600 dark:bg-zinc-700 dark:text-zinc-300'
          }`}
        >
          {item.badge}
        </span>
      ) : null}
      {hasSubItems
        ? renderIcon(
            'chevronDown',
            `h-4 w-4 shrink-0 transition-transform duration-200 ${isExpanded ? 'rotate-180' : ''}`,
          )
        : null}
    </>
  );

  return (
    <li>
      {hasSubItems ? (
        <button
          type="button"
          onClick={() => setIsExpandedOverride(!isExpanded)}
          aria-expanded={isExpanded}
          aria-controls={subItemsId}
          aria-label={
            isExpanded
              ? sidebarText.subItems.close(item.label)
              : sidebarText.subItems.open(item.label)
          }
          className={rowClassName}
        >
          {rowContent}
        </button>
      ) : (
        <Link
          href={item.href}
          onClick={onNavigate}
          aria-current={isActive ? 'page' : undefined}
          className={rowClassName}
        >
          {rowContent}
        </Link>
      )}
      {hasSubItems && isExpanded ? (
        <ul
          id={subItemsId}
          className="mt-1 ml-5 space-y-0.5 border-l border-zinc-200 pl-2 dark:border-zinc-800"
        >
          {subItems.map((subItem) => (
            <SidebarSubItem
              key={subItem.href}
              item={subItem}
              isActive={isHrefActive(subItem.href, activeHref)}
              onNavigate={onNavigate}
            />
          ))}
        </ul>
      ) : null}
    </li>
  );
};
