import { render, screen } from '@testing-library/react';
import { Header } from '@/components/layout';

describe('Header', () => {
  describe('Khi render với điều kiện mặc định', () => {
    it('nên render phần tử header cấp cao nhất của trang', () => {
      render(<Header />);

      expect(screen.getByRole('banner')).toBeInTheDocument();
    });

    it('nên hiển thị tiêu đề Dashboard ở cấp heading 1', () => {
      render(<Header />);

      expect(screen.getByRole('heading', { level: 1, name: 'Dashboard' })).toBeInTheDocument();
    });

    it('nên hiển thị chữ viết tắt của người dùng', () => {
      render(<Header />);

      expect(screen.getByText('AM')).toBeInTheDocument();
    });
  });

  describe('Kiểu dáng', () => {
    it('nên giữ header dính ở đỉnh trang', () => {
      render(<Header />);

      expect(screen.getByRole('banner')).toHaveClass('sticky', 'top-0');
    });

    it('nên có đường viền dưới và nền mờ', () => {
      render(<Header />);

      expect(screen.getByRole('banner')).toHaveClass('border-b', 'backdrop-blur');
    });
  });

  describe('Hỗ trợ chế độ tối', () => {
    it('nên có nền mờ dùng token surface đổi theo chế độ tối', () => {
      render(<Header />);

      expect(screen.getByRole('banner')).toHaveClass('bg-surface/85');
    });

    it('nên có đường viền dùng token border đổi theo chế độ tối', () => {
      render(<Header />);

      expect(screen.getByRole('banner')).toHaveClass('border-border');
    });
  });
});
