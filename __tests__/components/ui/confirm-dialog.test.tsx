import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { useState } from 'react';
import { ConfirmDialog } from '@/components/ui/confirm-dialog';
import { useConfirm } from '@/hooks';

describe('ConfirmDialog', () => {
  describe('mặc định', () => {
    it('render label và mô tả mặc định', () => {
      render(
        <ConfirmDialog
          open
          onConfirm={jest.fn()}
          onCancel={jest.fn()}
          title="Delete user"
          message="This cannot be undone"
        />,
      );
      expect(screen.getByRole('dialog')).toHaveAccessibleName('Delete user');
      expect(screen.getByRole('button', { name: 'Cancel' })).toBeInTheDocument();
      expect(screen.getByRole('button', { name: 'Confirm' })).toBeInTheDocument();
    });
  });

  describe('tuỳ chỉnh', () => {
    it('dùng label tuỳ chỉnh và tone danger', () => {
      render(
        <ConfirmDialog
          open
          onConfirm={jest.fn()}
          onCancel={jest.fn()}
          confirmLabel="Delete"
          cancelLabel="Keep"
          tone="danger"
        />,
      );
      expect(screen.getByRole('button', { name: 'Keep' })).toBeInTheDocument();
      expect(screen.getByRole('button', { name: 'Delete' })).toBeInTheDocument();
    });
  });

  describe('đóng', () => {
    it('gọi onCancel từ nút cancel, phím Escape và overlay', async () => {
      const onCancel = jest.fn();
      const { rerender } = render(<ConfirmDialog open onConfirm={jest.fn()} onCancel={onCancel} />);

      await userEvent.click(screen.getByRole('button', { name: 'Cancel' }));
      await userEvent.keyboard('{Escape}');
      await userEvent.click(screen.getByTestId('modal-overlay'));
      rerender(<ConfirmDialog open onConfirm={jest.fn()} onCancel={onCancel} />);
      await userEvent.click(screen.getByTestId('modal-overlay'));

      expect(onCancel).toHaveBeenCalled();
    });
  });

  describe('loading', () => {
    it('hiện trạng thái loading khi onConfirm chưa hoàn tất', async () => {
      let resolveConfirm: () => void = () => undefined;
      render(
        <ConfirmDialog
          open
          onCancel={jest.fn()}
          onConfirm={() =>
            new Promise<void>((resolve) => {
              resolveConfirm = resolve;
            })
          }
        />,
      );

      const confirmButton = screen.getByRole('button', { name: 'Confirm' });
      await userEvent.click(confirmButton);

      await waitFor(() => expect(confirmButton).toBeDisabled());
      expect(confirmButton).toHaveAttribute('aria-busy', 'true');

      resolveConfirm();
      await waitFor(() => expect(confirmButton).toBeEnabled());
    });
  });
});

describe('useConfirm', () => {
  function Harness({ onResult }: { onResult: (value: boolean) => void }) {
    const { confirm, confirmDialog } = useConfirm();
    const [label, setLabel] = useState('idle');

    return (
      <div>
        <button
          type="button"
          onClick={async () => {
            const result = await confirm({
              title: 'Delete user',
              message: 'This cannot be undone',
            });
            onResult(result);
            setLabel(result ? 'deleted' : 'kept');
          }}
        >
          Delete
        </button>
        <p>{label}</p>
        {confirmDialog}
      </div>
    );
  }

  describe('xác nhận', () => {
    it('resolve với true sau khi xác nhận', async () => {
      const onResult = jest.fn();
      render(<Harness onResult={onResult} />);

      await userEvent.click(screen.getByRole('button', { name: 'Delete' }));
      expect(screen.getByRole('dialog')).toBeInTheDocument();

      await userEvent.click(screen.getByRole('button', { name: 'Confirm' }));

      await waitFor(() => expect(onResult).toHaveBeenCalledWith(true));
      expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
      expect(screen.getByText('deleted')).toBeInTheDocument();
    });
  });

  describe('hủy', () => {
    it('resolve với false sau khi hủy', async () => {
      const onResult = jest.fn();
      render(<Harness onResult={onResult} />);

      await userEvent.click(screen.getByRole('button', { name: 'Delete' }));
      await userEvent.click(screen.getByRole('button', { name: 'Cancel' }));

      await waitFor(() => expect(onResult).toHaveBeenCalledWith(false));
      expect(screen.getByText('kept')).toBeInTheDocument();
    });
  });

  describe('gọi lại confirm khi một request đang chờ', () => {
    it('resolve request cũ với false và giữ request mới', async () => {
      const onFirst = jest.fn();
      const onSecond = jest.fn();

      function ReopenHarness() {
        const { confirm, confirmDialog } = useConfirm();
        return (
          <div>
            <button
              type="button"
              onClick={() => {
                void confirm({ title: 'First' }).then((result) => onFirst(result));
              }}
            >
              First
            </button>
            <button
              type="button"
              onClick={() => {
                void confirm({ title: 'Second' }).then((result) => onSecond(result));
              }}
            >
              Second
            </button>
            {confirmDialog}
          </div>
        );
      }

      render(<ReopenHarness />);
      await userEvent.click(screen.getByRole('button', { name: 'First' }));
      expect(screen.getByRole('dialog')).toHaveAccessibleName('First');

      await userEvent.click(screen.getByRole('button', { name: 'Second' }));
      await waitFor(() => expect(onFirst).toHaveBeenCalledWith(false));
      expect(screen.getByRole('dialog')).toHaveAccessibleName('Second');

      await userEvent.click(screen.getByRole('button', { name: 'Confirm' }));
      await waitFor(() => expect(onSecond).toHaveBeenCalledWith(true));
    });
  });
});
