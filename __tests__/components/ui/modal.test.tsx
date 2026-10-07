import { fireEvent, render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { Modal } from '@/components/ui/modal';

describe('Modal', () => {
  describe('đóng', () => {
    it('không render gì khi đóng', () => {
      render(
        <Modal open={false} onClose={jest.fn()} title="Hidden">
          Body
        </Modal>,
      );
      expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
    });
  });

  describe('hiển thị', () => {
    it('render dialog dễ tiếp cận với title, body và footer', () => {
      render(
        <Modal
          open
          onClose={jest.fn()}
          title="Edit user"
          description="Change the details below"
          footer={<button type="button">Save</button>}
        >
          Body
        </Modal>,
      );
      const dialog = screen.getByRole('dialog');
      expect(dialog).toHaveAttribute('aria-modal', 'true');
      expect(dialog).toHaveAccessibleName('Edit user');
      expect(dialog).toHaveAccessibleDescription('Change the details below');
      expect(screen.getByText('Body')).toBeInTheDocument();
      expect(screen.getByRole('button', { name: 'Save' })).toBeInTheDocument();
    });

    it('fallback sang aria-label khi không có title', () => {
      render(<Modal open onClose={jest.fn()} aria-label="Loading" />);
      expect(screen.getByRole('dialog')).toHaveAccessibleName('Loading');
    });

    it('không render header khi không có title và nút đóng đã tắt', () => {
      render(<Modal open onClose={jest.fn()} aria-label="Bare" showCloseButton={false} />);

      expect(screen.queryByRole('heading')).not.toBeInTheDocument();
      expect(screen.queryByRole('button')).not.toBeInTheDocument();
    });

    it('áp dụng class kích thước theo size', () => {
      render(<Modal open onClose={jest.fn()} title="Wide" size="xl" />);
      expect(screen.getByRole('dialog')).toHaveClass('max-w-2xl');
    });

    it('không hiển thị nút đóng theo mặc định', () => {
      render(<Modal open onClose={jest.fn()} title="No close" />);
      expect(screen.queryByRole('button', { name: 'Close dialog' })).not.toBeInTheDocument();
    });

    it('có thể hiển thị nút đóng khi bật showCloseButton', () => {
      render(<Modal open onClose={jest.fn()} title="With close" showCloseButton />);
      expect(screen.getByRole('button', { name: 'Close dialog' })).toBeInTheDocument();
    });
  });

  describe('đóng bằng tương tác', () => {
    it('đóng khi bấm nút đóng', async () => {
      const onClose = jest.fn();
      render(<Modal open onClose={onClose} title="Closable" showCloseButton />);
      await userEvent.click(screen.getByRole('button', { name: 'Close dialog' }));
      expect(onClose).toHaveBeenCalledTimes(1);
    });

    it('đóng khi nhấn phím Escape', async () => {
      const onClose = jest.fn();
      render(<Modal open onClose={onClose} title="Escapable" />);
      await userEvent.keyboard('{Escape}');
      expect(onClose).toHaveBeenCalledTimes(1);
    });

    it('bỏ qua Escape khi closeOnEscape là false', async () => {
      const onClose = jest.fn();
      render(<Modal open onClose={onClose} title="Sticky" closeOnEscape={false} />);
      await userEvent.keyboard('{Escape}');
      expect(onClose).not.toHaveBeenCalled();
    });

    it('bỏ qua thao tác click vào overlay theo mặc định', async () => {
      const onClose = jest.fn();
      render(
        <Modal open onClose={onClose} title="Overlay">
          Body
        </Modal>,
      );

      await userEvent.click(screen.getByTestId('modal-overlay'));
      await userEvent.click(screen.getByText('Body'));
      expect(onClose).not.toHaveBeenCalled();
    });

    it('đóng khi click overlay và closeOnOverlayClick là true', async () => {
      const onClose = jest.fn();
      render(
        <Modal open onClose={onClose} title="Overlay" closeOnOverlayClick>
          Body
        </Modal>,
      );

      await userEvent.click(screen.getByTestId('modal-overlay'));
      expect(onClose).toHaveBeenCalledTimes(1);

      await userEvent.click(screen.getByText('Body'));
      expect(onClose).toHaveBeenCalledTimes(1);
    });
  });

  describe('focus và scroll', () => {
    it('khoá body scroll khi mở và trả lại sau khi đóng', () => {
      const { rerender } = render(<Modal open onClose={jest.fn()} title="A" />);
      expect(document.body.style.overflow).toBe('hidden');

      rerender(<Modal open={false} onClose={jest.fn()} title="A" />);
      expect(document.body.style.overflow).toBe('');
    });

    it('chuyển focus vào trong dialog khi mở', async () => {
      render(
        <>
          <button type="button">Outside</button>
          <Modal open onClose={jest.fn()} title="Focus" showCloseButton={false}>
            <button type="button">Inside</button>
          </Modal>
        </>,
      );
      expect(screen.getByRole('button', { name: 'Inside' })).toHaveFocus();
    });
  });

  describe('kẹp focus trong dialog', () => {
    function renderFocusableModal() {
      render(
        <Modal open onClose={jest.fn()} title="Trap" showCloseButton>
          <button type="button">First</button>
          <button type="button">Last</button>
        </Modal>,
      );
    }

    it('lùi về phần tử cuối khi Shift+Tab ở phần tử đầu tiên', () => {
      renderFocusableModal();
      const first = screen.getByRole('button', { name: 'Close dialog' });
      first.focus();

      expect(fireEvent.keyDown(first, { key: 'Tab', shiftKey: true })).toBe(false);
      expect(screen.getByRole('button', { name: 'Last' })).toHaveFocus();
    });

    it('tiến về phần tử đầu tiên khi Tab ở phần tử cuối cùng', () => {
      renderFocusableModal();
      const last = screen.getByRole('button', { name: 'Last' });
      last.focus();

      expect(fireEvent.keyDown(last, { key: 'Tab' })).toBe(false);
      expect(screen.getByRole('button', { name: 'Close dialog' })).toHaveFocus();
    });

    it('lùi về phần tử cuối khi Shift+Tab và focus đang ở chính dialog', () => {
      renderFocusableModal();
      const dialog = screen.getByRole('dialog');
      dialog.focus();

      fireEvent.keyDown(dialog, { key: 'Tab', shiftKey: true });

      expect(screen.getByRole('button', { name: 'Last' })).toHaveFocus();
    });

    it('không kẹp focus khi Tab ở phần tử ở giữa', () => {
      renderFocusableModal();
      const first = screen.getByRole('button', { name: 'First' });
      first.focus();

      expect(fireEvent.keyDown(first, { key: 'Tab' })).toBe(true);
      expect(first).toHaveFocus();
    });

    it('bỏ qua phím khác Tab và Escape', () => {
      renderFocusableModal();
      const first = screen.getByRole('button', { name: 'First' });
      first.focus();

      expect(fireEvent.keyDown(first, { key: 'a' })).toBe(true);
      expect(first).toHaveFocus();
    });

    it('bỏ qua kẹp focus khi dialog không có phần tử focus được', () => {
      render(<Modal open onClose={jest.fn()} title="Bare" showCloseButton={false} />);
      const dialog = screen.getByRole('dialog');
      dialog.focus();

      expect(fireEvent.keyDown(dialog, { key: 'Tab' })).toBe(true);
      expect(dialog).toHaveFocus();
    });
  });
});
