import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { SidebarItem } from '@/components/layout/sidebar/sidebar-item';
import type { SidebarNavigationItem } from '@/types';

const renderIcon = (name: string, className?: string) => (
  <span data-testid={`icon-${name}`} className={className} />
);

const leafItem: SidebarNavigationItem = {
  label: '組織管理',
  href: '/organizations',
  icon: 'grid',
};

const parentItem: SidebarNavigationItem = {
  label: 'メンバー管理',
  href: '/members',
  icon: 'users',
  subItems: [
    { label: 'メンバー一覧', href: '/members' },
    { label: '承認待ち', href: '/members/pending', badge: '12' },
  ],
};

const leafItemWithBadge: SidebarNavigationItem = {
  label: '分析',
  href: '/analytics',
  icon: 'chart',
  badge: 'New',
};

const rootItem: SidebarNavigationItem = {
  label: 'ホーム',
  href: '/',
  icon: 'grid',
};

describe('SidebarItem', () => {
  describe('không có sub item', () => {
    it('render link khi không có sub item', () => {
      render(
        <ul>
          <SidebarItem
            item={leafItem}
            activeHref={null}
            onNavigate={jest.fn()}
            renderIcon={renderIcon}
          />
        </ul>,
      );
      expect(screen.getByRole('link', { name: /組織管理/ })).toHaveAttribute(
        'href',
        '/organizations',
      );
    });
  });

  describe('không có badge', () => {
    it('không render badge khi item không có badge', () => {
      render(
        <ul>
          <SidebarItem
            item={leafItem}
            activeHref={null}
            onNavigate={jest.fn()}
            renderIcon={renderIcon}
          />
        </ul>,
      );
      expect(screen.queryByText('New')).not.toBeInTheDocument();
    });
  });

  describe('có badge và không active', () => {
    it('render badge với nền trung tính', () => {
      render(
        <ul>
          <SidebarItem
            item={leafItemWithBadge}
            activeHref={null}
            onNavigate={jest.fn()}
            renderIcon={renderIcon}
          />
        </ul>,
      );
      expect(screen.getByText('New')).toHaveClass('bg-zinc-200', 'text-zinc-600');
    });

    it('không tô nền primary cho dòng khi chưa active', () => {
      render(
        <ul>
          <SidebarItem
            item={leafItemWithBadge}
            activeHref={null}
            onNavigate={jest.fn()}
            renderIcon={renderIcon}
          />
        </ul>,
      );
      expect(screen.getByRole('link', { name: /分析/ })).not.toHaveClass('bg-primary');
    });
  });

  describe('đang active', () => {
    it('đánh dấu link lá là trang hiện tại khi active', () => {
      render(
        <ul>
          <SidebarItem
            item={leafItem}
            activeHref="/organizations"
            onNavigate={jest.fn()}
            renderIcon={renderIcon}
          />
        </ul>,
      );
      expect(screen.getByRole('link', { name: /組織管理/ })).toHaveAttribute(
        'aria-current',
        'page',
      );
    });

    it('tự mở rộng khi một sub item đang active', () => {
      render(
        <ul>
          <SidebarItem
            item={parentItem}
            activeHref="/members/pending"
            onNavigate={jest.fn()}
            renderIcon={renderIcon}
          />
        </ul>,
      );
      expect(screen.getByText('承認待ち')).toBeInTheDocument();
    });

    it('tô nền primary cho dòng khi active', () => {
      render(
        <ul>
          <SidebarItem
            item={leafItem}
            activeHref="/organizations"
            onNavigate={jest.fn()}
            renderIcon={renderIcon}
          />
        </ul>,
      );
      expect(screen.getByRole('link', { name: /組織管理/ })).toHaveClass(
        'bg-primary',
        'text-primary-foreground',
      );
    });

    it('so khớp href gốc với đường dẫn sau khi bỏ dấu gạch chân', () => {
      render(
        <ul>
          <SidebarItem
            item={rootItem}
            activeHref="/"
            onNavigate={jest.fn()}
            renderIcon={renderIcon}
          />
        </ul>,
      );
      expect(screen.getByRole('link', { name: /ホーム/ })).toHaveAttribute('aria-current', 'page');
    });

    it('bỏ query string và dấu gạch chân cuối khi so khớp href', () => {
      render(
        <ul>
          <SidebarItem
            item={leafItem}
            activeHref="/organizations/?tab=all"
            onNavigate={jest.fn()}
            renderIcon={renderIcon}
          />
        </ul>,
      );
      expect(screen.getByRole('link', { name: /組織管理/ })).toHaveAttribute(
        'aria-current',
        'page',
      );
    });

    it('render badge theo màu primary khi active', () => {
      render(
        <ul>
          <SidebarItem
            item={leafItemWithBadge}
            activeHref="/analytics"
            onNavigate={jest.fn()}
            renderIcon={renderIcon}
          />
        </ul>,
      );
      expect(screen.getByText('New')).toHaveClass(
        'bg-primary-foreground/20',
        'text-primary-foreground',
      );
    });
  });

  describe('chỉ sub item active', () => {
    it('giữ nền trung tính cho dòng cha khi chỉ sub item active', () => {
      render(
        <ul>
          <SidebarItem
            item={parentItem}
            activeHref="/members/pending"
            onNavigate={jest.fn()}
            renderIcon={renderIcon}
          />
        </ul>,
      );
      const toggle = screen.getByRole('button', { name: /メンバー管理/ });
      expect(toggle).not.toHaveClass('bg-primary');
      expect(toggle).toHaveClass('font-semibold');
    });

    it('quay chevron xuống khi nhóm đang mở', () => {
      render(
        <ul>
          <SidebarItem
            item={parentItem}
            activeHref="/members/pending"
            onNavigate={jest.fn()}
            renderIcon={renderIcon}
          />
        </ul>,
      );
      expect(screen.getByTestId('icon-chevronDown')).toHaveClass('rotate-180');
    });

    it('giữ chevron ngang khi nhóm đang thu gọn', () => {
      render(
        <ul>
          <SidebarItem
            item={parentItem}
            activeHref={null}
            onNavigate={jest.fn()}
            renderIcon={renderIcon}
          />
        </ul>,
      );
      expect(screen.getByTestId('icon-chevronDown')).not.toHaveClass('rotate-180');
    });
  });

  describe('mặc định thu gọn', () => {
    it('render toggle button với sub item thu gọn mặc định khi không active', () => {
      render(
        <ul>
          <SidebarItem
            item={parentItem}
            activeHref={null}
            onNavigate={jest.fn()}
            renderIcon={renderIcon}
          />
        </ul>,
      );
      const toggle = screen.getByRole('button', { name: /メンバー管理/ });
      expect(toggle).toHaveAttribute('aria-expanded', 'false');
      expect(screen.queryByText('メンバー一覧')).not.toBeInTheDocument();
    });
  });

  describe('mở rộng theo click', () => {
    it('toggle sub item khi click', async () => {
      render(
        <ul>
          <SidebarItem
            item={parentItem}
            activeHref={null}
            onNavigate={jest.fn()}
            renderIcon={renderIcon}
          />
        </ul>,
      );
      const toggle = screen.getByRole('button', { name: /メンバー管理/ });
      await userEvent.click(toggle);
      expect(toggle).toHaveAttribute('aria-expanded', 'true');
      expect(screen.getByText('メンバー一覧')).toBeInTheDocument();

      await userEvent.click(toggle);
      expect(toggle).toHaveAttribute('aria-expanded', 'false');
      expect(screen.queryByText('メンバー一覧')).not.toBeInTheDocument();
    });
  });
});
