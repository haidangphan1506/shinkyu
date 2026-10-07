import { createRef } from 'react';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { Button } from '@/components/ui/button';

describe('Button', () => {
  describe('mặc định', () => {
    it('render children', () => {
      render(<Button>Click me</Button>);
      expect(screen.getByRole('button', { name: 'Click me' })).toBeInTheDocument();
    });

    it('kích hoạt onClick', async () => {
      const onClick = jest.fn();
      render(<Button onClick={onClick}>Submit</Button>);
      await userEvent.click(screen.getByRole('button', { name: 'Submit' }));
      expect(onClick).toHaveBeenCalledTimes(1);
    });

    it('mặc định dùng variant primary và size md', () => {
      render(<Button>Mặc định</Button>);
      const button = screen.getByRole('button', { name: 'Mặc định' });
      expect(button).toHaveClass('bg-primary', 'h-10', 'min-w-30', 'text-sm');
    });

    it('không hiện spinner khi không loading', () => {
      render(<Button>Idle</Button>);
      expect(screen.queryByTestId('button-spinner')).not.toBeInTheDocument();
      expect(screen.getByRole('button', { name: 'Idle' })).not.toHaveAttribute('aria-busy');
    });

    it('giữ transition-colors để hover chuyển màu mượt', () => {
      render(<Button>Chuyển màu</Button>);
      expect(screen.getByRole('button', { name: 'Chuyển màu' })).toHaveClass('transition-colors');
    });

    it('mặc định có type button để không submit form ngoài ý muốn', () => {
      render(<Button>An toàn</Button>);
      expect(screen.getByRole('button', { name: 'An toàn' })).toHaveAttribute('type', 'button');
    });

    it('tôn trọng type do người dùng truyền', () => {
      render(
        <form>
          <Button type="submit">Gửi</Button>
        </form>,
      );
      expect(screen.getByRole('button', { name: 'Gửi' })).toHaveAttribute('type', 'submit');
    });

    it('focus được bằng bàn phím', async () => {
      render(<Button>Bàn phím</Button>);
      const button = screen.getByRole('button', { name: 'Bàn phím' });
      await userEvent.tab();
      expect(button).toHaveFocus();
    });
  });

  describe('disabled', () => {
    it('bị disabled khi truyền prop disabled', () => {
      render(<Button disabled>Disabled</Button>);
      expect(screen.getByRole('button', { name: 'Disabled' })).toBeDisabled();
    });

    it('giữ class disabled:pointer-events-none để hover không bám vào button disabled', () => {
      render(<Button disabled>Không hover được</Button>);
      expect(screen.getByRole('button', { name: 'Không hover được' })).toHaveClass(
        'disabled:pointer-events-none',
        'disabled:opacity-50',
      );
    });
  });

  describe('loading', () => {
    it('hiện spinner và disable button khi loading', async () => {
      const onClick = jest.fn();
      render(
        <Button loading onClick={onClick}>
          Save
        </Button>,
      );
      const button = screen.getByRole('button', { name: /Save/ });
      expect(button).toBeDisabled();
      expect(button).toHaveAttribute('aria-busy', 'true');
      expect(screen.getByTestId('button-spinner')).toBeInTheDocument();
      await userEvent.click(button);
      expect(onClick).not.toHaveBeenCalled();
    });

    it('vẫn render children khi loading', () => {
      render(<Button loading>Đang lưu</Button>);
      expect(screen.getByRole('button', { name: /Đang lưu/ })).toBeInTheDocument();
    });

    it('hover lên button loading vẫn chặn onClick', async () => {
      const onClick = jest.fn();
      render(
        <Button loading onClick={onClick}>
          Đang lưu
        </Button>,
      );
      const button = screen.getByRole('button', { name: /Đang lưu/ });

      await userEvent.hover(button);
      await userEvent.click(button);

      expect(button).toBeDisabled();
      expect(onClick).not.toHaveBeenCalled();
    });
  });

  describe('biến thể và kích thước', () => {
    it.each([
      ['primary', 'bg-primary'],
      ['secondary', 'bg-primary/10'],
      ['outline', 'border-primary'],
      ['ghost', 'text-primary'],
      ['danger', 'bg-error'],
    ] as const)('render class của variant %s', (variant, expected) => {
      render(<Button variant={variant}>Biến thể</Button>);
      expect(screen.getByRole('button', { name: 'Biến thể' })).toHaveClass(expected);
    });

    it.each([
      ['sm', 'h-8', 'px-3', 'text-xs'],
      ['md', 'h-10', 'min-w-30', 'px-4', 'text-sm'],
      ['lg', 'h-12', 'px-5', 'text-base'],
    ] as const)('render class của size %s', (size, ...expected) => {
      render(<Button size={size}>Kích thước</Button>);
      expect(screen.getByRole('button', { name: 'Kích thước' })).toHaveClass(...expected);
    });

    it.each([
      ['sm', 'h-3.5', 'w-3.5'],
      ['md', 'h-4', 'w-4'],
      ['lg', 'h-5', 'w-5'],
    ] as const)('spinner đổi kích thước theo size %s', (size, ...expected) => {
      render(
        <Button size={size} loading>
          Đang xử lý
        </Button>,
      );
      expect(screen.getByRole('status')).toHaveClass(...expected);
    });
  });

  describe('hover', () => {
    it('click sau hover vẫn kích hoạt onClick đúng một lần', async () => {
      const onClick = jest.fn();
      render(<Button onClick={onClick}>Hover rồi click</Button>);
      const button = screen.getByRole('button', { name: 'Hover rồi click' });

      await userEvent.hover(button);
      await userEvent.click(button);

      expect(onClick).toHaveBeenCalledTimes(1);
    });

    it('hover giữ nguyên accessible name và focus ring class', async () => {
      render(<Button>Lưu thay đổi</Button>);
      const button = screen.getByRole('button', { name: 'Lưu thay đổi' });

      await userEvent.hover(button);

      expect(screen.getByRole('button', { name: 'Lưu thay đổi' })).toBe(button);
      expect(button).toHaveClass('focus-visible:ring-2', 'focus-visible:ring-primary');
    });

    it('className của người dùng đứng cạnh class hover mặc định', () => {
      render(<Button className="hover:bg-error">Tự override</Button>);
      const button = screen.getByRole('button', { name: 'Tự override' });
      expect(button).toHaveClass('hover:bg-error', 'hover:bg-brand-600');
    });

    it.each([
      ['primary', 'hover:bg-brand-600'],
      ['secondary', 'hover:bg-primary/20'],
      ['outline', 'hover:bg-primary/10'],
      ['ghost', 'hover:bg-primary/10'],
      ['danger', 'hover:bg-error/90'],
    ] as const)('variant %s khai báo class hover riêng', (variant, expected) => {
      render(<Button variant={variant}>Di chuột</Button>);
      expect(screen.getByRole('button', { name: 'Di chuột' })).toHaveClass(expected);
    });

    it('không đổi class sau khi hover và rời chuột', async () => {
      render(<Button>Ổn định</Button>);
      const button = screen.getByRole('button', { name: 'Ổn định' });
      const before = button.className;

      await userEvent.hover(button);
      expect(button).toHaveClass('bg-primary', 'hover:bg-brand-600');
      await userEvent.unhover(button);

      expect(button.className).toBe(before);
    });
  });

  describe('className và ref', () => {
    it('nối thêm className vào class mặc định', () => {
      render(<Button className="w-full">Nới rộng</Button>);
      const button = screen.getByRole('button', { name: 'Nới rộng' });
      expect(button).toHaveClass('w-full', 'bg-primary', 'h-10');
    });

    it('bỏ qua className rỗng mà không để lại khoảng trắng thừa', () => {
      render(<Button className="">Sạch</Button>);
      const button = screen.getByRole('button', { name: 'Sạch' });
      expect(button.className).toBe(button.className.trim());
      expect(button.className).not.toMatch(/\s{2,}/);
    });

    it('chuyển tiếp ref tới phần tử button', () => {
      const ref = createRef<HTMLButtonElement>();
      render(<Button ref={ref}>Có ref</Button>);
      expect(ref.current).toBe(screen.getByRole('button', { name: 'Có ref' }));
      expect(ref.current).toBeInstanceOf(HTMLButtonElement);
    });

    it('chuyển tiếp các prop HTML còn lại xuống phần tử button', () => {
      render(
        <Button name="submit-action" aria-describedby="mo-ta">
          Có prop
        </Button>,
      );
      const button = screen.getByRole('button', { name: 'Có prop' });
      expect(button).toHaveAttribute('name', 'submit-action');
      expect(button).toHaveAttribute('aria-describedby', 'mo-ta');
    });
  });
});
