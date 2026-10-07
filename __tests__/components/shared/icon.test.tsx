import { render } from '@testing-library/react';
import { Icon } from '@/components/shared/icon';

describe('Icon', () => {
  describe('mặc định', () => {
    it('render svg cho tên icon đã biết', () => {
      const { container } = render(<Icon name="grid" />);
      expect(container.querySelector('svg')).toBeInTheDocument();
    });

    it('áp dụng class kích thước mặc định', () => {
      const { container } = render(<Icon name="bell" />);
      expect(container.querySelector('svg')).toHaveClass('h-5', 'w-5');
    });

    it('ẩn khỏi công nghệ trợ giúp', () => {
      const { container } = render(<Icon name="search" />);
      expect(container.querySelector('svg')).toHaveAttribute('aria-hidden', 'true');
    });
  });

  describe('className tuỳ chỉnh', () => {
    it('áp dụng className tuỳ chỉnh khi được truyền vào', () => {
      const { container } = render(<Icon name="bell" className="h-8 w-8" />);
      expect(container.querySelector('svg')).toHaveClass('h-8', 'w-8');
    });
  });
});
