import { act, render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { Provider } from 'react-redux';
import { Toaster } from '@/components/ui/toaster';
import { makeStore, pushToast, type AppStore } from '@/store';

function renderToaster() {
  const store: AppStore = makeStore();
  render(
    <Provider store={store}>
      <Toaster />
    </Provider>,
  );
  return store;
}

describe('Toaster', () => {
  describe('không có toast', () => {
    it('render region Notifications rỗng', () => {
      renderToaster();
      expect(screen.getByRole('region', { name: 'Notifications' })).toBeInTheDocument();
      expect(screen.queryByRole('status')).not.toBeInTheDocument();
      expect(screen.queryByRole('alert')).not.toBeInTheDocument();
    });
  });

  describe('có toast', () => {
    it('hiển thị message của toast với role status', () => {
      const store = renderToaster();
      act(() => {
        store.dispatch(pushToast({ message: 'Đã lưu thay đổi' }));
      });
      expect(screen.getByRole('status')).toHaveTextContent('Đã lưu thay đổi');
    });

    it('hiển thị toast tone error với role alert', () => {
      const store = renderToaster();
      act(() => {
        store.dispatch(pushToast({ message: 'Không thể tải dữ liệu', tone: 'error' }));
      });
      expect(screen.getByRole('alert')).toHaveTextContent('Không thể tải dữ liệu');
      expect(screen.queryByRole('status')).not.toBeInTheDocument();
    });

    it('hiển thị nhiều toast cùng lúc', () => {
      const store = renderToaster();
      act(() => {
        store.dispatch(pushToast({ message: 'thứ nhất' }));
        store.dispatch(pushToast({ message: 'thứ hai', tone: 'success' }));
      });
      expect(screen.getByText('thứ nhất')).toBeInTheDocument();
      expect(screen.getByText('thứ hai')).toBeInTheDocument();
    });

    it('có nút dismiss với accessible name cho mỗi toast', () => {
      const store = renderToaster();
      act(() => {
        store.dispatch(pushToast({ message: 'Đã lưu' }));
      });
      expect(screen.getAllByRole('button', { name: 'Dismiss notification' })).toHaveLength(1);
    });
  });

  describe('toast được gỡ', () => {
    it('tự động gỡ toast sau khi hết duration', () => {
      jest.useFakeTimers();
      try {
        const store = renderToaster();
        act(() => {
          store.dispatch(pushToast({ message: 'Tự đóng', duration: 3000 }));
        });
        act(() => {
          jest.advanceTimersByTime(2999);
        });
        expect(screen.getByRole('status')).toBeInTheDocument();
        act(() => {
          jest.advanceTimersByTime(1);
        });
        expect(screen.queryByRole('status')).not.toBeInTheDocument();
      } finally {
        jest.useRealTimers();
      }
    });

    it('gỡ toast khi bấm nút dismiss', async () => {
      const user = userEvent.setup();
      const store = renderToaster();
      act(() => {
        store.dispatch(pushToast({ message: 'Đã lưu' }));
      });
      await user.click(screen.getByRole('button', { name: 'Dismiss notification' }));
      expect(screen.queryByRole('status')).not.toBeInTheDocument();
    });
  });
});
