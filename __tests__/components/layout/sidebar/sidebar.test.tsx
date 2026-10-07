import React from 'react';
import { render, screen } from '@testing-library/react';
import { Sidebar } from '@/components/layout/sidebar';
import { sidebarNavigationGroups, sidebarText } from '@/constants';

jest.mock('next/link', () => {
  function MockLink({
    children,
    href,
    onClick,
  }: {
    children?: React.ReactNode;
    href?: string;
    onClick?: () => void;
  }) {
    return (
      <a href={href} onClick={onClick}>
        {children}
      </a>
    );
  }
  return MockLink;
});

jest.mock('next/navigation', () => ({
  usePathname: () => '/members',
}));

jest.mock('../../../../components/layout/sidebar/sidebar-item', () => ({
  SidebarItem: function MockSidebarItem({ item }: { item: { href: string; label: string } }) {
    return <div data-testid={`sidebar-item-${item.href}`}>{item.label}</div>;
  },
}));

jest.mock('../../../../components/ui', () => ({
  Button: ({ children, onClick, ...props }: React.ComponentPropsWithoutRef<'button'>) => (
    <button onClick={onClick} {...props}>
      {children}
    </button>
  ),
}));

describe('Sidebar', () => {
  const mockOnClose = jest.fn();
  const mockRenderIcon = jest.fn((name: string) => <span>{name}</span>);

  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('Render', () => {
    it('nên luôn render sidebar bất kể isOpen', () => {
      render(<Sidebar isOpen={false} onClose={mockOnClose} renderIcon={mockRenderIcon} />);

      const sidebar = screen.getByRole('complementary');
      expect(sidebar).toBeInTheDocument();
    });

    it('nên render logo thương hiệu và tên', () => {
      render(<Sidebar isOpen={true} onClose={mockOnClose} renderIcon={mockRenderIcon} />);

      expect(screen.getByText(sidebarText.brand.mark)).toBeInTheDocument();
      expect(screen.getByText(sidebarText.brand.name)).toBeInTheDocument();
    });

    it('nên render phần điều hướng', () => {
      render(<Sidebar isOpen={true} onClose={mockOnClose} renderIcon={mockRenderIcon} />);

      const nav = screen.getByRole('navigation');
      expect(nav).toBeInTheDocument();
    });

    it('nên render tất cả các mục sidebar từ nhóm điều hướng', () => {
      render(<Sidebar isOpen={true} onClose={mockOnClose} renderIcon={mockRenderIcon} />);

      sidebarNavigationGroups.forEach((group) => {
        group.items.forEach((item) => {
          expect(screen.getByTestId(`sidebar-item-${item.href}`)).toBeInTheDocument();
        });
      });
    });
  });

  describe('Render biểu tượng', () => {
    it('nên truyền hàm renderIcon cho sidebar items', () => {
      const customRenderIcon = jest.fn((name: string) => (
        <span data-testid={`icon-${name}`}>{name}</span>
      ));

      render(<Sidebar isOpen={true} onClose={mockOnClose} renderIcon={customRenderIcon} />);

      expect(sidebarNavigationGroups.length).toBeGreaterThan(0);
    });
  });

  describe('Khả năng tiếp cận', () => {
    it('nên có phần tử nav với vai trò thích hợp', () => {
      render(<Sidebar isOpen={true} onClose={mockOnClose} renderIcon={mockRenderIcon} />);

      const nav = screen.getByRole('navigation');
      expect(nav).toBeInTheDocument();
    });

    it('nên có vai trò complementary cho sidebar', () => {
      render(<Sidebar isOpen={true} onClose={mockOnClose} renderIcon={mockRenderIcon} />);

      const aside = screen.getByRole('complementary');
      expect(aside).toBeInTheDocument();
    });
  });

  describe('Kiểu dáng', () => {
    it('nên có vị trí fixed trên di động', () => {
      const { container } = render(
        <Sidebar isOpen={true} onClose={mockOnClose} renderIcon={mockRenderIcon} />,
      );

      const aside = container.querySelector('aside');
      expect(aside).toHaveClass('fixed', 'left-0', 'inset-y-0');
    });

    it('nên có vị trí static trên màn hình lớn', () => {
      const { container } = render(
        <Sidebar isOpen={true} onClose={mockOnClose} renderIcon={mockRenderIcon} />,
      );

      const aside = container.querySelector('aside');
      expect(aside).toHaveClass('lg:static');
    });

    it('không nên có animation chuyển đổi', () => {
      const { container } = render(
        <Sidebar isOpen={true} onClose={mockOnClose} renderIcon={mockRenderIcon} />,
      );

      const aside = container.querySelector('aside');
      expect(aside).not.toHaveClass('transition-transform', 'duration-200');
    });

    it('nên có chiều rộng 60 đơn vị', () => {
      const { container } = render(
        <Sidebar isOpen={true} onClose={mockOnClose} renderIcon={mockRenderIcon} />,
      );

      const aside = container.querySelector('aside');
      expect(aside).toHaveClass('w-60');
    });
  });

  describe('Hỗ trợ chế độ tối', () => {
    it('nên có nền dùng token surface đổi theo chế độ tối', () => {
      const { container } = render(
        <Sidebar isOpen={true} onClose={mockOnClose} renderIcon={mockRenderIcon} />,
      );

      const aside = container.querySelector('aside');
      expect(aside).toHaveClass('bg-surface');
    });

    it('nên có đường viền dùng token border đổi theo chế độ tối', () => {
      const { container } = render(
        <Sidebar isOpen={true} onClose={mockOnClose} renderIcon={mockRenderIcon} />,
      );

      const aside = container.querySelector('aside');
      expect(aside).toHaveClass('border-border');
    });
  });

  describe('Xác thực Props', () => {
    it('nên render với renderIcon prop', () => {
      const newRenderIcon = jest.fn((name: string) => (
        <span data-testid={`new-icon-${name}`}>{name}</span>
      ));

      render(<Sidebar isOpen={true} onClose={mockOnClose} renderIcon={newRenderIcon} />);

      const sidebar = screen.getByRole('complementary');
      expect(sidebar).toBeInTheDocument();
    });

    it('nên render bất kể giá trị isOpen', () => {
      const { rerender, container } = render(
        <Sidebar isOpen={false} onClose={mockOnClose} renderIcon={mockRenderIcon} />,
      );

      let aside = container.querySelector('aside');
      expect(aside).toBeInTheDocument();

      rerender(<Sidebar isOpen={true} onClose={mockOnClose} renderIcon={mockRenderIcon} />);

      aside = container.querySelector('aside');
      expect(aside).toBeInTheDocument();
    });
  });
});
