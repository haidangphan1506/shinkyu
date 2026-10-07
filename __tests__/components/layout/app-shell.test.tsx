import React from 'react';
import { render, screen } from '@testing-library/react';
import { AppShell } from '@/components/layout';
import { sidebarNavigationGroups, sidebarText } from '@/constants';

jest.mock('next/link', () => {
  const Link = ({ children, href }: { children: React.ReactNode; href: string }) => (
    <a href={href}>{children}</a>
  );
  return { __esModule: true, default: Link };
});

jest.mock('next/navigation', () => ({
  usePathname: () => '/members',
}));

describe('AppShell', () => {
  describe('Khi render với children', () => {
    it('nên render children vào vùng nội dung chính', () => {
      render(
        <AppShell>
          <p>Nội dung trang</p>
        </AppShell>,
      );

      const main = screen.getByRole('main');
      expect(main).toBeInTheDocument();
      expect(screen.getByText('Nội dung trang')).toBeInTheDocument();
    });

    it('nên render vùng nội dung chính vùng một phần trang', () => {
      const { container } = render(
        <AppShell>
          <p>Nội dung trang</p>
        </AppShell>,
      );

      expect(container.querySelector('main')).toBeInTheDocument();
    });
  });

  describe('Khi render với layout điều hướng', () => {
    it('nên render sidebar và header', () => {
      render(
        <AppShell>
          <p>Nội dung trang</p>
        </AppShell>,
      );

      expect(screen.getByRole('complementary')).toBeInTheDocument();
      expect(screen.getByRole('banner')).toBeInTheDocument();
    });

    it('nên render thương hiệu và toàn bộ mục điều hướng từ hằng số', () => {
      render(
        <AppShell>
          <p>Nội dung trang</p>
        </AppShell>,
      );

      expect(screen.getByText(sidebarText.brand.name)).toBeInTheDocument();
      sidebarNavigationGroups.forEach((group) => {
        group.items.forEach((item) => {
          expect(screen.getByText(item.label)).toBeInTheDocument();
        });
      });
    });

    it('nên render biểu tượng cho từng mục sidebar', () => {
      const { container } = render(
        <AppShell>
          <p>Nội dung trang</p>
        </AppShell>,
      );

      const itemCount = sidebarNavigationGroups.reduce(
        (total, group) => total + group.items.length,
        0,
      );
      const icons = container.querySelectorAll('aside nav svg.shrink-0');
      expect(icons.length).toBeGreaterThanOrEqual(itemCount);
    });
  });

  describe('Kiểu dáng', () => {
    it('nên bọc layout trong một div cao tối thiểu toàn màn hình', () => {
      const { container } = render(
        <AppShell>
          <p>Nội dung trang</p>
        </AppShell>,
      );

      const root = container.firstElementChild;
      expect(root).toHaveClass('flex', 'min-h-dvh');
    });

    it('nên có nền dùng token background đổi theo chế độ tối', () => {
      const { container } = render(
        <AppShell>
          <p>Nội dung trang</p>
        </AppShell>,
      );

      expect(container.firstElementChild).toHaveClass('bg-background');
    });

    it('nên giới hạn bề rộng vùng nội dung', () => {
      render(
        <AppShell>
          <p>Nội dung trang</p>
        </AppShell>,
      );

      expect(screen.getByRole('main')).toHaveClass('max-w-[1600px]');
    });
  });
});
