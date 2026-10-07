import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { SidebarSubItem } from '@/components/layout/sidebar/sidebar-sub-item';

const item = { label: 'メンバー一覧', href: '/members' };

describe('SidebarSubItem', () => {
  describe('không active', () => {
    it('render label thành link trỏ tới href', () => {
      render(
        <ul>
          <SidebarSubItem item={item} isActive={false} onNavigate={jest.fn()} />
        </ul>,
      );
      const link = screen.getByRole('link', { name: item.label });
      expect(link).toHaveAttribute('href', item.href);
    });

    it('gọi onNavigate khi click', async () => {
      const onNavigate = jest.fn();
      render(
        <ul>
          <SidebarSubItem item={item} isActive={false} onNavigate={onNavigate} />
        </ul>,
      );
      await userEvent.click(screen.getByRole('link', { name: item.label }));
      expect(onNavigate).toHaveBeenCalledTimes(1);
    });
  });

  describe('active', () => {
    it('đánh dấu link là trang hiện tại khi active', () => {
      render(
        <ul>
          <SidebarSubItem item={item} isActive onNavigate={jest.fn()} />
        </ul>,
      );
      expect(screen.getByRole('link', { name: item.label })).toHaveAttribute(
        'aria-current',
        'page',
      );
    });
  });

  describe('có badge', () => {
    it('render badge khi được truyền vào', () => {
      render(
        <ul>
          <SidebarSubItem item={{ ...item, badge: '12' }} isActive={false} onNavigate={jest.fn()} />
        </ul>,
      );
      expect(screen.getByText('12')).toBeInTheDocument();
    });
  });
});
