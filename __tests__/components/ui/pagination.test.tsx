import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { Pagination } from '@/components/ui/pagination';

describe('Pagination', () => {
  describe('không có dữ liệu', () => {
    it('không render gì khi total bằng 0', () => {
      const { container } = render(<Pagination total={0} onPageChange={jest.fn()} />);
      expect(container).toBeEmptyDOMElement();
    });
  });

  describe('mặc định', () => {
    it('render summary cho khoảng page hiện tại', () => {
      render(<Pagination total={57} page={2} pageSize={10} onPageChange={jest.fn()} />);
      expect(screen.getByText(/Showing/)).toHaveTextContent('Showing 11-20 of 57');
    });
    it('đánh dấu page hiện tại bằng aria-current', () => {
      render(<Pagination total={30} page={2} pageSize={10} onPageChange={jest.fn()} />);
      expect(screen.getByRole('button', { name: 'Page 2' })).toHaveAttribute(
        'aria-current',
        'page',
      );
      expect(screen.getByRole('button', { name: 'Page 1' })).not.toHaveAttribute('aria-current');
    });
    it('disable nút previous ở page đầu và nút next ở page cuối', () => {
      const { rerender } = render(
        <Pagination total={30} page={1} pageSize={10} onPageChange={jest.fn()} />,
      );
      expect(screen.getByRole('button', { name: 'Previous page' })).toBeDisabled();
      expect(screen.getByRole('button', { name: 'Next page' })).toBeEnabled();

      rerender(<Pagination total={30} page={3} pageSize={10} onPageChange={jest.fn()} />);
      expect(screen.getByRole('button', { name: 'Previous page' })).toBeEnabled();
      expect(screen.getByRole('button', { name: 'Next page' })).toBeDisabled();
    });
    it('gộp các page ở xa thành ellipsis', () => {
      const { container } = render(
        <Pagination total={200} page={10} pageSize={10} onPageChange={jest.fn()} />,
      );
      expect(container.textContent).toContain('\u2026');
      expect(screen.getByRole('button', { name: 'Page 20' })).toBeInTheDocument();
      expect(screen.getByRole('button', { name: 'Page 1' })).toBeInTheDocument();
    });
  });

  describe('đổi trang', () => {
    it('gọi onPageChange với page và pageSize', async () => {
      const onPageChange = jest.fn();
      render(<Pagination total={30} page={1} pageSize={10} onPageChange={onPageChange} />);

      await userEvent.click(screen.getByRole('button', { name: 'Page 3' }));
      expect(onPageChange).toHaveBeenCalledWith(3, 10);

      await userEvent.click(screen.getByRole('button', { name: 'Next page' }));
      expect(onPageChange).toHaveBeenCalledWith(2, 10);
    });
    it('lùi một trang khi bấm nút previous', async () => {
      const onPageChange = jest.fn();
      render(<Pagination total={30} page={2} pageSize={10} onPageChange={onPageChange} />);

      await userEvent.click(screen.getByRole('button', { name: 'Previous page' }));
      expect(onPageChange).toHaveBeenCalledWith(1, 10);
    });

    it('reset về page 1 khi đổi page size', async () => {
      const onPageChange = jest.fn();
      render(<Pagination total={200} page={4} pageSize={10} onPageChange={onPageChange} />);

      const sizeSelect = screen.getByRole('combobox', {
        name: 'Rows per page',
      });
      await userEvent.click(sizeSelect);
      await userEvent.click(screen.getByRole('option', { name: '50件/ページ' }));

      expect(onPageChange).toHaveBeenCalledWith(1, 50);
    });
  });

  describe('disabled', () => {
    it('không gọi onPageChange khi disabled', async () => {
      const onPageChange = jest.fn();
      render(<Pagination total={30} page={1} pageSize={10} disabled onPageChange={onPageChange} />);
      await userEvent.click(screen.getByRole('button', { name: 'Page 2' }));
      expect(onPageChange).not.toHaveBeenCalled();
    });
    it('không đổi page size khi disabled', async () => {
      const onPageChange = jest.fn();
      render(
        <Pagination total={200} page={1} pageSize={10} disabled onPageChange={onPageChange} />,
      );
      const sizeSelect = screen.getByRole('combobox', {
        name: 'Rows per page',
      });
      expect(sizeSelect).toBeDisabled();
    });
  });

  describe('hiển thị tuỳ chỉnh', () => {
    it('có thể ẩn summary', () => {
      render(
        <Pagination
          total={30}
          page={1}
          pageSize={10}
          showSummary={false}
          onPageChange={jest.fn()}
        />,
      );
      expect(screen.queryByText(/Showing/)).not.toBeInTheDocument();
    });
  });

  describe('page size tuỳ chỉnh', () => {
    it('dùng danh sách option truyền vào', () => {
      render(
        <Pagination
          total={200}
          page={1}
          pageSize={20}
          pageSizeOptions={[20, 200]}
          onPageChange={jest.fn()}
        />,
      );
      expect(screen.getByRole('combobox', { name: 'Rows per page' })).toHaveTextContent(
        '20件/ページ',
      );
    });
  });

  describe('selector page size', () => {
    it('render selector page size với các kích thước mặc định', async () => {
      render(<Pagination total={200} page={1} pageSize={10} onPageChange={jest.fn()} />);
      const sizeSelect = screen.getByRole('combobox', {
        name: 'Rows per page',
      });
      expect(sizeSelect).toHaveTextContent('10件/ページ');

      await userEvent.click(sizeSelect);
      const options = screen.getAllByRole('option');
      expect(options.map((option) => option.textContent)).toEqual([
        '10件/ページ',
        '20件/ページ',
        '50件/ページ',
        '100件/ページ',
      ]);
    });
    it('co kích thước selector vừa với nội dung', () => {
      render(<Pagination total={200} page={1} pageSize={10} onPageChange={jest.fn()} />);
      expect(screen.getByRole('combobox', { name: 'Rows per page' })).toHaveClass('w-fit');
    });
    it('ẩn selector page size khi danh sách option rỗng', () => {
      render(
        <Pagination
          total={200}
          page={1}
          pageSize={10}
          pageSizeOptions={[]}
          onPageChange={jest.fn()}
        />,
      );
      expect(screen.queryByRole('combobox', { name: 'Rows per page' })).not.toBeInTheDocument();
    });
  });
});
