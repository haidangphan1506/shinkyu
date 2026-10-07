import type { ReactNode } from 'react';

export type SidebarIconName = 'grid' | 'bag' | 'users' | 'chart' | 'settings' | 'help' | 'bell';

export type SidebarNavigationSubItem = {
  label: string;
  href: string;
  badge?: string;
};

export type SidebarNavigationItem = {
  label: string;
  href: string;
  icon: SidebarIconName;
  badge?: string;
  subItems?: SidebarNavigationSubItem[];
};

export type SidebarNavigationGroup = {
  items: SidebarNavigationItem[];
};

export type RenderIconName =
  SidebarNavigationItem['icon'] | 'close' | 'chevronDown' | 'sparkles' | 'dots';

export type RenderIcon = (name: RenderIconName, className?: string) => ReactNode;

export type SidebarProps = {
  isOpen: boolean;
  onClose: () => void;
  renderIcon: RenderIcon;
};

export type SidebarItemProps = {
  item: SidebarNavigationItem;
  activeHref: string | null;
  onNavigate: () => void;
  renderIcon: RenderIcon;
};

export type SidebarSubItemProps = {
  item: SidebarNavigationSubItem;
  isActive: boolean;
  onNavigate: () => void;
};
