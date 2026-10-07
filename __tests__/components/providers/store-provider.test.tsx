import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { StoreProvider } from '@/components/providers/store-provider';
import { useAppDispatch, useAppSelector } from '@/hooks';
import { toggleSidebarCollapsed } from '@/store';

function SidebarProbe() {
  const collapsed = useAppSelector((state) => state.ui.sidebarCollapsed);
  const dispatch = useAppDispatch();

  return (
    <div>
      <p>{collapsed ? 'collapsed' : 'expanded'}</p>
      <button type="button" onClick={() => dispatch(toggleSidebarCollapsed())}>
        toggle
      </button>
    </div>
  );
}

describe('StoreProvider', () => {
  describe('trạng thái ban đầu', () => {
    it('cung cấp store với giá trị khởi tạo của slice ui', () => {
      render(
        <StoreProvider>
          <SidebarProbe />
        </StoreProvider>,
      );
      expect(screen.getByText('expanded')).toBeInTheDocument();
    });
  });

  describe('có tương tác', () => {
    it('dispatch action làm selector đọc được state mới', async () => {
      render(
        <StoreProvider>
          <SidebarProbe />
        </StoreProvider>,
      );
      await userEvent.click(screen.getByRole('button', { name: 'toggle' }));
      expect(screen.getByText('collapsed')).toBeInTheDocument();
    });

    it('tách store giữa hai provider', async () => {
      render(
        <div>
          <StoreProvider>
            <SidebarProbe />
          </StoreProvider>
          <StoreProvider>
            <SidebarProbe />
          </StoreProvider>
        </div>,
      );
      const [firstToggle, secondToggle] = screen.getAllByRole('button', {
        name: 'toggle',
      });
      await userEvent.click(firstToggle);
      expect(screen.getAllByText('collapsed')).toHaveLength(1);
      expect(screen.getAllByText('expanded')).toHaveLength(1);
      expect(firstToggle).toBeInTheDocument();
      expect(secondToggle).toBeInTheDocument();
    });
  });
});
