import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { EmptyState } from '@/components/ui/empty-state';

describe('EmptyState', () => {
  describe('mặc định', () => {
    it('hiện tiêu đề mặc định khi không truyền props', () => {
      render(<EmptyState />);
      expect(screen.getByText('ユーザーが見つかりません')).toBeInTheDocument();
    });

    it('không hiện icon, mô tả, hành động khi không truyền', () => {
      const { container } = render(<EmptyState />);
      expect(container.querySelector('[aria-hidden]')).not.toBeInTheDocument();
      expect(
        screen.queryByText('検索条件やフィルター条件を変更してみてください。'),
      ).not.toBeInTheDocument();
      expect(screen.queryByRole('button')).not.toBeInTheDocument();
    });
  });

  describe('có nội dung truyền vào', () => {
    it('ghi đè tiêu đề mặc định bằng title truyền vào', () => {
      render(<EmptyState title="指定した条件のデータがありません" />);
      expect(screen.getByText('指定した条件のデータがありません')).toBeInTheDocument();
      expect(screen.queryByText('ユーザーが見つかりません')).not.toBeInTheDocument();
    });

    it('hiện description dưới tiêu đề', () => {
      render(
        <EmptyState
          title="ユーザーが見つかりません"
          description="検索条件やフィルター条件を変更してみてください。"
        />,
      );
      expect(
        screen.getByText('検索条件やフィルター条件を変更してみてください。'),
      ).toBeInTheDocument();
    });

    it('ẩn description khi truyền giá trị rỗng', () => {
      const { container } = render(<EmptyState title="ユーザーが見つかりません" description="" />);
      expect(screen.getByText('ユーザーが見つかりません')).toBeInTheDocument();
      expect(container.querySelectorAll('p')).toHaveLength(1);
    });

    it('hiện icon trong badge có aria-hidden', () => {
      render(<EmptyState icon={<span>ICON</span>} />);
      const badge = screen.getByText('ICON').parentElement;
      expect(badge).toHaveAttribute('aria-hidden', 'true');
    });

    it('hiện action và bắn onClick khi tương tác', async () => {
      const onClick = jest.fn();
      render(
        <EmptyState
          title="No users found"
          action={
            <button type="button" onClick={onClick}>
              Create member
            </button>
          }
        />,
      );
      await userEvent.click(screen.getByRole('button', { name: 'Create member' }));
      expect(onClick).toHaveBeenCalledTimes(1);
    });

    it('nối className vào container', () => {
      const { container } = render(<EmptyState className="py-10" />);
      expect(container.firstElementChild).toHaveClass('py-10', 'flex-col');
    });
  });
});
