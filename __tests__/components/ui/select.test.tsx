import { createRef } from 'react';
import { fireEvent, render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { Select } from '@/components/ui/select';

const options = [
  { label: 'One', value: '1' },
  { label: 'Two', value: '2' },
  { label: 'Three', value: '3', disabled: true },
];

const disabledOptions = [
  { label: 'One', value: '1', disabled: true },
  { label: 'Two', value: '2', disabled: true },
];

function mockTriggerRect(
  trigger: HTMLElement,
  rect: Partial<DOMRect> & { width: number; height: number },
) {
  jest.spyOn(trigger, 'getBoundingClientRect').mockReturnValue({
    x: 0,
    y: 0,
    top: 0,
    right: 0,
    bottom: 0,
    left: 0,
    toJSON: () => ({}),
    ...rect,
  } as DOMRect);
}

function setViewport(width: number, height: number) {
  Object.defineProperty(window, 'innerWidth', {
    value: width,
    configurable: true,
  });
  Object.defineProperty(window, 'innerHeight', {
    value: height,
    configurable: true,
  });
}

describe('Select', () => {
  describe('trigger đóng', () => {
    it('render label và trigger với option đầu tiên được chọn', () => {
      render(<Select label="Number" options={options} />);
      const trigger = screen.getByRole('combobox', { name: 'Number' });
      expect(trigger).toBeInTheDocument();
      expect(trigger).toHaveTextContent('One');
    });
    it('render trigger chiếm toàn bộ width', () => {
      render(<Select label="Number" options={options} />);
      expect(screen.getByRole('combobox')).toHaveClass('w-full');
    });
    it('đổi con trỏ thành pointer khi hover trigger', () => {
      render(<Select label="Number" options={options} />);
      expect(screen.getByRole('combobox')).toHaveClass('cursor-pointer');
    });
    it('giữ con trỏ not-allowed khi trigger disabled', () => {
      render(<Select label="Number" options={options} disabled />);
      const trigger = screen.getByRole('combobox', { name: 'Number' });
      expect(trigger).toHaveClass('disabled:cursor-not-allowed');
    });
    it('không hiện option nào cho đến khi mở listbox', () => {
      render(<Select label="Number" options={options} />);
      expect(screen.queryByRole('listbox')).not.toBeInTheDocument();
      expect(screen.queryByRole('option')).not.toBeInTheDocument();
    });
    it('bỏ qua phím mở menu khi trigger disabled', () => {
      render(<Select label="Number" options={options} disabled />);
      const trigger = screen.getByRole('combobox', { name: 'Number' });
      expect(trigger).toBeDisabled();

      fireEvent.keyDown(trigger, { key: 'Enter' });

      expect(screen.queryByRole('listbox')).not.toBeInTheDocument();
    });
    it('bỏ qua phím không thuộc bảng điều khiển', () => {
      render(<Select label="Number" options={options} />);
      const trigger = screen.getByRole('combobox', { name: 'Number' });
      trigger.focus();

      fireEvent.keyDown(trigger, { key: 'a' });

      expect(screen.queryByRole('listbox')).not.toBeInTheDocument();
    });
  });

  describe('nhãn của select', () => {
    it('lấy accessible name của trigger từ nhãn', () => {
      render(<Select label="Number" options={options} />);

      const trigger = screen.getByRole('combobox', { name: 'Number' });
      const label = document.getElementById(trigger.getAttribute('aria-labelledby') ?? '');
      expect(label).toHaveTextContent('Number');
      expect(document.querySelector('label')).toBeNull();
    });
    it('không mở listbox khi click vào nhãn', async () => {
      const user = userEvent.setup();
      render(<Select label="Number" options={options} />);

      await user.click(screen.getByText('Number'));

      expect(screen.queryByRole('listbox')).not.toBeInTheDocument();
      expect(screen.getByRole('combobox', { name: 'Number' })).toHaveAttribute(
        'aria-expanded',
        'false',
      );
    });
    it('chỉ mở listbox khi click vào trigger', async () => {
      const user = userEvent.setup();
      render(<Select label="Number" options={options} />);

      await user.click(screen.getByRole('combobox', { name: 'Number' }));

      expect(screen.getByRole('listbox')).toBeInTheDocument();
      expect(screen.getAllByRole('option')).toHaveLength(3);
    });
  });

  describe('giá trị đã chọn', () => {
    it('render placeholder mặc định khi giá trị không khớp option nào', async () => {
      const user = userEvent.setup();
      render(<Select label="Number" options={options} value="missing" />);
      const trigger = screen.getByRole('combobox', { name: 'Number' });
      expect(trigger).toHaveTextContent('Select');

      await user.click(trigger);

      expect(trigger).not.toHaveAttribute('aria-activedescendant');
    });
    it('render placeholder truyền vào khi chưa chọn option nào', () => {
      render(<Select label="Number" options={[]} placeholder="Chọn số" />);
      expect(screen.getByRole('combobox', { name: 'Number' })).toHaveTextContent('Chọn số');
    });
    it('dùng defaultValue làm option đang chọn', () => {
      render(<Select label="Number" options={options} defaultValue="2" />);
      expect(screen.getByRole('combobox', { name: 'Number' })).toHaveTextContent('Two');
    });
    it('giữ giá trị controlled được đồng bộ', async () => {
      const user = userEvent.setup();
      const onChange = jest.fn();
      render(<Select label="Number" options={options} value="1" onChange={onChange} />);
      await user.click(screen.getByRole('combobox', { name: 'Number' }));
      await user.click(screen.getByRole('option', { name: 'Two' }));
      expect(onChange).toHaveBeenCalledWith('2');
      expect(screen.getByRole('combobox')).toHaveTextContent('One');
    });
  });

  describe('mở listbox', () => {
    it('render các option dưới dạng div bên trong listbox', async () => {
      const user = userEvent.setup();
      render(<Select label="Number" options={options} />);
      await user.click(screen.getByRole('combobox', { name: 'Number' }));
      const listbox = screen.getByRole('listbox');
      expect(listbox.tagName).toBe('DIV');
      expect(listbox).toHaveClass('z-100');
      const rendered = screen.getAllByRole('option');
      expect(rendered).toHaveLength(3);
      expect(rendered[0].tagName).toBe('DIV');
      expect(rendered[0]).toHaveAttribute('aria-selected', 'true');
    });
    it('đánh dấu các option bị disabled', async () => {
      const user = userEvent.setup();
      render(<Select label="Number" options={options} />);
      await user.click(screen.getByRole('combobox', { name: 'Number' }));
      expect(screen.getByRole('option', { name: 'Three' })).toHaveAttribute(
        'aria-disabled',
        'true',
      );
    });
    it('render dấu check cho option đang chọn và không in đậm', async () => {
      const user = userEvent.setup();
      render(<Select label="Number" options={options} defaultValue="2" />);
      await user.click(screen.getByRole('combobox', { name: 'Number' }));

      const selected = screen.getByRole('option', { name: 'Two' });
      expect(selected).toHaveAttribute('data-selected', 'true');
      expect(selected).not.toHaveClass('font-semibold');
      expect(selected.querySelector('svg')).toBeInTheDocument();

      const unselected = screen.getByRole('option', { name: 'One' });
      expect(unselected).not.toHaveAttribute('data-selected');
      expect(unselected.querySelector('svg')).toBeNull();
    });
    it('cho phép người dùng chọn một option', async () => {
      const user = userEvent.setup();
      const onChange = jest.fn();
      render(<Select label="Number" options={options} onChange={onChange} />);
      await user.click(screen.getByRole('combobox', { name: 'Number' }));
      await user.click(screen.getByRole('option', { name: 'Two' }));
      expect(onChange).toHaveBeenCalledWith('2');
      expect(screen.getByRole('combobox')).toHaveTextContent('Two');
    });
    it('bỏ qua thao tác click vào option bị disabled', async () => {
      const user = userEvent.setup();
      const onChange = jest.fn();
      render(<Select label="Number" options={options} onChange={onChange} />);
      await user.click(screen.getByRole('combobox', { name: 'Number' }));
      await user.click(screen.getByRole('option', { name: 'Three' }));
      expect(onChange).not.toHaveBeenCalled();
    });
    it('toggle listbox khi click lại vào trigger', async () => {
      const user = userEvent.setup();
      render(<Select label="Number" options={options} />);
      const trigger = screen.getByRole('combobox', { name: 'Number' });

      await user.click(trigger);
      expect(screen.getByRole('listbox')).toBeInTheDocument();

      await user.click(trigger);
      expect(screen.queryByRole('listbox')).not.toBeInTheDocument();
    });
  });

  describe('đóng listbox', () => {
    it('đóng listbox khi nhấn phím Escape', async () => {
      const user = userEvent.setup();
      render(<Select label="Number" options={options} />);
      await user.click(screen.getByRole('combobox', { name: 'Number' }));
      expect(screen.getByRole('listbox')).toBeInTheDocument();
      await user.keyboard('{Escape}');
      expect(screen.queryByRole('listbox')).not.toBeInTheDocument();
    });
    it('đóng listbox khi click ra ngoài', async () => {
      const user = userEvent.setup();
      render(
        <div>
          <Select label="Number" options={options} />
          <button type="button">Outside</button>
        </div>,
      );
      await user.click(screen.getByRole('combobox', { name: 'Number' }));
      await user.click(screen.getByRole('button', { name: 'Outside' }));
      expect(screen.queryByRole('listbox')).not.toBeInTheDocument();
    });
    it('mở listbox bằng phím Space và đóng lại bằng phím Escape', async () => {
      const user = userEvent.setup();
      render(<Select label="Number" options={options} />);
      const trigger = screen.getByRole('combobox', { name: 'Number' });
      trigger.focus();

      await user.keyboard(' ');

      expect(screen.getByRole('listbox')).toBeInTheDocument();

      await user.keyboard('{Escape}');

      expect(screen.queryByRole('listbox')).not.toBeInTheDocument();
    });
    it('đóng listbox khi nhấn phím Tab trên trigger', async () => {
      const user = userEvent.setup();
      render(<Select label="Number" options={options} />);
      const trigger = screen.getByRole('combobox', { name: 'Number' });
      trigger.focus();
      await user.keyboard('{ArrowDown}');
      expect(screen.getByRole('listbox')).toBeInTheDocument();

      trigger.focus();
      await user.keyboard('{Tab}');

      expect(screen.queryByRole('listbox')).not.toBeInTheDocument();
    });
    it('đóng listbox khi focus chuyển ra ngoài select', async () => {
      const user = userEvent.setup();
      render(
        <>
          <Select label="Number" options={options} />
          <button type="button">Outside</button>
        </>,
      );
      await user.click(screen.getByRole('combobox', { name: 'Number' }));

      fireEvent.focusOut(screen.getByRole('listbox'), {
        relatedTarget: screen.getByRole('button', { name: 'Outside' }),
      });

      expect(screen.queryByRole('listbox')).not.toBeInTheDocument();
    });
  });

  describe('điều khiển bằng bàn phím', () => {
    it('chọn option đang active bằng bàn phím', async () => {
      const user = userEvent.setup();
      const onChange = jest.fn();
      render(<Select label="Number" options={options} onChange={onChange} />);
      const trigger = screen.getByRole('combobox', { name: 'Number' });
      trigger.focus();
      await user.keyboard('{ArrowDown}{ArrowDown}{Enter}');
      expect(onChange).toHaveBeenCalledWith('2');
    });
    it('mở listbox bằng Enter và đặt option đầu tiên làm active khi chưa có giá trị', async () => {
      const user = userEvent.setup();
      render(<Select label="Number" options={options} value="missing" />);
      const trigger = screen.getByRole('combobox', { name: 'Number' });
      trigger.focus();

      await user.keyboard('{Enter}');

      expect(screen.getByRole('option', { name: 'One' })).toHaveAttribute('data-active', 'true');
    });
    it('mở listbox bằng ArrowUp và đặt option enabled cuối cùng làm active', async () => {
      const user = userEvent.setup();
      const onChange = jest.fn();
      render(<Select label="Number" options={options} onChange={onChange} />);
      const trigger = screen.getByRole('combobox', { name: 'Number' });
      trigger.focus();

      await user.keyboard('{ArrowUp}{Enter}');

      expect(onChange).toHaveBeenCalledWith('2');
    });
    it('di chuyển active option qua lại bằng ArrowDown và ArrowUp', async () => {
      const user = userEvent.setup();
      render(<Select label="Number" options={options} />);
      const trigger = screen.getByRole('combobox', { name: 'Number' });
      trigger.focus();
      await user.keyboard('{ArrowDown}');

      await user.keyboard('{ArrowUp}');

      expect(screen.getByRole('option', { name: 'Two' })).toHaveAttribute('data-active', 'true');
    });
    it('nhảy về option đầu và cuối bằng phím Home và End', async () => {
      const user = userEvent.setup();
      render(<Select label="Number" options={options} />);
      const trigger = screen.getByRole('combobox', { name: 'Number' });
      trigger.focus();
      await user.keyboard('{ArrowDown}');

      await user.keyboard('{End}');
      expect(screen.getByRole('option', { name: 'Two' })).toHaveAttribute('data-active', 'true');

      await user.keyboard('{Home}');
      expect(screen.getByRole('option', { name: 'One' })).toHaveAttribute('data-active', 'true');
    });
    it('chọn option active bằng phím Space trong listbox', async () => {
      const user = userEvent.setup();
      const onChange = jest.fn();
      render(<Select label="Number" options={options} defaultValue="2" onChange={onChange} />);
      await user.click(screen.getByRole('combobox', { name: 'Number' }));

      await user.keyboard(' ');

      expect(onChange).toHaveBeenCalledWith('2');
      expect(screen.queryByRole('listbox')).not.toBeInTheDocument();
    });
    it('giữ nguyên active index khi mọi option đều disabled', async () => {
      const user = userEvent.setup();
      const onChange = jest.fn();
      render(<Select label="Number" options={disabledOptions} onChange={onChange} />);
      const trigger = screen.getByRole('combobox', { name: 'Number' });
      trigger.focus();
      await user.keyboard('{ArrowDown}');

      await user.keyboard('{ArrowDown}{Enter}');

      expect(onChange).not.toHaveBeenCalled();
      expect(screen.getByRole('listbox')).toBeInTheDocument();
    });
    it('không có active option khi mở bằng ArrowUp và mọi option đều disabled', async () => {
      const user = userEvent.setup();
      render(<Select label="Number" options={disabledOptions} />);
      const trigger = screen.getByRole('combobox', { name: 'Number' });
      trigger.focus();

      await user.keyboard('{ArrowUp}');

      expect(screen.getByRole('listbox')).toBeInTheDocument();
      expect(trigger).not.toHaveAttribute('aria-activedescendant');
    });
    it('bỏ qua phím khác khi focus nằm trong listbox', async () => {
      const user = userEvent.setup();
      render(<Select label="Number" options={options} />);
      const trigger = screen.getByRole('combobox', { name: 'Number' });
      trigger.focus();
      await user.keyboard('{ArrowDown}');

      await user.keyboard('a');

      expect(screen.getByRole('listbox')).toBeInTheDocument();
    });
  });

  describe('vị trí và kích thước menu', () => {
    it('giữ menu nằm dưới và căn trái khi còn chỗ', async () => {
      const user = userEvent.setup();
      render(<Select label="Number" options={options} />);
      await user.click(screen.getByRole('combobox', { name: 'Number' }));
      expect(screen.getByRole('listbox')).toHaveClass('top-full', 'left-0');
    });
    it('lật menu lên trên và căn phải khi hết chỗ', async () => {
      const user = userEvent.setup();
      render(<Select label="Number" options={options} />);
      const trigger = screen.getByRole('combobox', { name: 'Number' });
      mockTriggerRect(trigger, {
        x: 950,
        y: 700,
        top: 700,
        right: 990,
        bottom: 732,
        left: 950,
        width: 40,
        height: 32,
      });
      setViewport(1000, 740);

      await user.click(trigger);

      expect(screen.getByRole('listbox')).toHaveClass('bottom-full', 'right-0');
    });
    it('căn phải khi menu không vừa bề ngang viewport', async () => {
      const user = userEvent.setup();
      render(<Select label="Number" options={options} />);
      const trigger = screen.getByRole('combobox', { name: 'Number' });
      mockTriggerRect(trigger, {
        top: 20,
        right: 340,
        bottom: 52,
        left: 320,
        width: 20,
        height: 32,
      });
      setViewport(360, 800);

      await user.click(trigger);

      expect(screen.getByRole('listbox')).toHaveClass('top-full', 'right-0');
    });
    it('căn trái khi trigger tràn sang mép phải viewport', async () => {
      const user = userEvent.setup();
      render(<Select label="Number" options={options} />);
      const trigger = screen.getByRole('combobox', { name: 'Number' });
      mockTriggerRect(trigger, {
        top: 20,
        right: 100,
        bottom: 52,
        left: 60,
        width: 40,
        height: 32,
      });
      setViewport(80, 800);

      await user.click(trigger);

      expect(screen.getByRole('listbox')).toHaveClass('top-full', 'left-0');
    });
    it('giới hạn maxHeight của menu theo khoảng trống phía trên', async () => {
      const user = userEvent.setup();
      render(<Select label="Number" options={options} />);
      const trigger = screen.getByRole('combobox', { name: 'Number' });
      mockTriggerRect(trigger, {
        top: 200,
        right: 340,
        bottom: 232,
        left: 20,
        width: 320,
        height: 32,
      });
      setViewport(1000, 300);

      await user.click(trigger);

      expect(screen.getByRole('listbox')).toHaveStyle({ maxHeight: '196px' });
    });
    it('giới hạn maxHeight của menu ở mức tối thiểu khi chỗ trống quá hẹp', async () => {
      const user = userEvent.setup();
      render(<Select label="Number" options={options} />);
      const trigger = screen.getByRole('combobox', { name: 'Number' });
      mockTriggerRect(trigger, {
        top: 60,
        right: 340,
        bottom: 92,
        left: 20,
        width: 320,
        height: 32,
      });
      setViewport(1000, 100);

      await user.click(trigger);

      expect(screen.getByRole('listbox')).toHaveStyle({ maxHeight: '80px' });
    });
    it('căn width của listbox theo width của trigger', async () => {
      const user = userEvent.setup();
      render(<Select label="Number" options={options} />);
      const trigger = screen.getByRole('combobox', { name: 'Number' });
      mockTriggerRect(trigger, {
        top: 20,
        right: 340,
        bottom: 52,
        left: 20,
        width: 320,
        height: 32,
      });

      await user.click(trigger);

      const listbox = screen.getByRole('listbox');
      expect(listbox).toHaveStyle({ width: '320px' });
      expect(listbox).toHaveClass('w-full');
    });
    it('giữ nội dung listbox tự co theo nội dung khi bật autoWidth', async () => {
      const user = userEvent.setup();
      render(<Select label="Number" options={options} autoWidth />);

      await user.click(screen.getByRole('combobox', { name: 'Number' }));

      const listbox = screen.getByRole('listbox');
      expect(listbox.style.width).toBe('');
      expect(listbox).toHaveClass('w-max');
    });
    it('đo lại placement khi window resize', async () => {
      const user = userEvent.setup();
      render(<Select label="Number" options={options} />);
      const trigger = screen.getByRole('combobox', { name: 'Number' });
      mockTriggerRect(trigger, {
        top: 20,
        right: 340,
        bottom: 52,
        left: 20,
        width: 320,
        height: 32,
      });
      setViewport(1000, 900);

      await user.click(trigger);
      expect(screen.getByRole('listbox')).toHaveClass('top-full', 'left-0');

      mockTriggerRect(trigger, {
        top: 700,
        right: 340,
        bottom: 732,
        left: 20,
        width: 320,
        height: 32,
      });
      setViewport(1000, 900);
      fireEvent(window, new Event('resize'));

      expect(screen.getByRole('listbox')).toHaveClass('bottom-full', 'left-0');
    });
    it('bỏ qua việc đo khi trigger đã bị tháo khỏi DOM', async () => {
      const user = userEvent.setup();
      const { unmount } = render(<Select label="Number" options={options} />);
      const trigger = screen.getByRole('combobox', { name: 'Number' });
      mockTriggerRect(trigger, {
        top: 20,
        right: 340,
        bottom: 52,
        left: 20,
        width: 320,
        height: 32,
      });
      const detached = trigger;
      await user.click(detached);
      unmount();

      expect(() => fireEvent(window, new Event('resize'))).not.toThrow();
    });
    it('bỏ qua việc đo placement khi listener resize chạy sau khi trigger đã bị tháo', async () => {
      const user = userEvent.setup();
      // Giữ đúng closure updatePlacement mà Select đăng ký, rồi gọi lại sau khi
      // component unmount — lúc đó triggerRef.current đã null.
      const resizeHandlers: EventListener[] = [];
      const addEventListenerSpy = jest
        .spyOn(window, 'addEventListener')
        .mockImplementation((type, handler) => {
          if (type === 'resize' && handler) {
            resizeHandlers.push(handler as EventListener);
          }
        });

      const { unmount } = render(<Select label="Number" options={options} />);
      await user.click(screen.getByRole('combobox', { name: 'Number' }));
      expect(resizeHandlers).toHaveLength(1);

      unmount();

      expect(() => resizeHandlers[0](new Event('resize'))).not.toThrow();
      addEventListenerSpy.mockRestore();
    });
  });

  describe('a11y và class', () => {
    it('render thông báo lỗi với role alert', () => {
      render(<Select label="Number" options={options} error="Required" />);
      expect(screen.getByRole('alert')).toHaveTextContent('Required');
    });
    it('render hint và nối hint, lỗi vào aria-describedby của trigger', () => {
      render(
        <Select
          label="Number"
          options={options}
          hint="Chọn một số"
          error="Required"
          aria-describedby="external-help"
        />,
      );
      const trigger = screen.getByRole('combobox', { name: 'Number' });
      const hint = screen.getByText('Chọn một số');
      const error = screen.getByRole('alert');
      expect(trigger.getAttribute('aria-describedby')?.split(' ')).toEqual([
        'external-help',
        hint.id,
        error.id,
      ]);
    });
    it('giữ id truyền vào để label trỏ đúng vào trigger', () => {
      render(<Select id="number" label="Number" options={options} />);
      expect(screen.getByLabelText('Number')).toHaveAttribute('id', 'number');
    });
    it('chuyển tiếp aria-label và aria-labelledby sang trigger', async () => {
      const user = userEvent.setup();
      render(
        <>
          <span id="external-label">Số lượng</span>
          <Select options={options} aria-label="Số lượng đơn vị" aria-labelledby="external-label" />
        </>,
      );
      const trigger = screen.getByRole('combobox', { name: 'Số lượng' });
      expect(trigger).toHaveAttribute('aria-label', 'Số lượng đơn vị');
      expect(trigger).toHaveAttribute('aria-labelledby', 'external-label');

      await user.click(trigger);

      expect(screen.getByRole('listbox')).toHaveAttribute('aria-labelledby', 'external-label');
    });
    it('giữ aria-invalid truyền vào khi không có error', () => {
      render(<Select label="Number" options={options} aria-invalid="true" />);
      expect(screen.getByRole('combobox', { name: 'Number' })).toHaveAttribute(
        'aria-invalid',
        'true',
      );
    });
    it('áp size, className và containerClassName theo prop', () => {
      const { container } = render(
        <Select
          label="Number"
          options={options}
          size="sm"
          className="custom-trigger"
          containerClassName="custom-container"
        />,
      );
      const trigger = screen.getByRole('combobox', { name: 'Number' });
      expect(trigger).toHaveClass('h-8', 'custom-trigger');
      expect(container.firstElementChild).toHaveClass('custom-container');
    });
    it('co trigger theo nội dung khi bật autoWidth', () => {
      render(<Select label="Number" options={options} autoWidth />);
      expect(screen.getByRole('combobox', { name: 'Number' })).toHaveClass('w-fit');
    });
  });

  describe('ring của trigger', () => {
    describe('không lỗi', () => {
      it('không có ring khi trigger đóng', () => {
        render(<Select label="Number" options={options} />);
        const trigger = screen.getByRole('combobox', { name: 'Number' });
        expect(trigger).toHaveClass('focus:ring-0');
        expect(trigger).not.toHaveClass('ring-primary/20');
      });
      it('không thêm ring khi listbox đang mở', async () => {
        const user = userEvent.setup();
        render(<Select label="Number" options={options} />);

        await user.click(screen.getByRole('combobox', { name: 'Number' }));

        const trigger = screen.getByRole('combobox', { name: 'Number' });
        expect(trigger).not.toHaveClass('ring-primary/20');
      });
    });
    describe('có error', () => {
      it('áp ring theo focus khi trigger đóng', () => {
        render(<Select label="Number" options={options} error="Required" />);
        const trigger = screen.getByRole('combobox', { name: 'Number' });
        expect(trigger).toHaveClass('focus:ring-error/20');
        expect(trigger).not.toHaveClass('ring-error/20');
      });
      it('giữ ring khi listbox đang mở dù focus đã chuyển sang listbox', async () => {
        const user = userEvent.setup();
        render(<Select label="Number" options={options} error="Required" />);

        await user.click(screen.getByRole('combobox', { name: 'Number' }));

        expect(screen.getByRole('combobox', { name: 'Number' })).toHaveClass('ring-error/20');
      });
      it('bỏ ring sau khi đóng listbox', async () => {
        const user = userEvent.setup();
        render(<Select label="Number" options={options} error="Required" />);
        const trigger = screen.getByRole('combobox', { name: 'Number' });

        await user.click(trigger);
        await user.keyboard('{Escape}');

        expect(trigger).not.toHaveClass('ring-error/20');
      });
    });
  });

  describe('ref', () => {
    it('đưa node trigger vào ref dạng object', () => {
      const ref = createRef<HTMLButtonElement>();
      render(<Select label="Number" options={options} ref={ref} />);
      expect(ref.current).toBe(screen.getByRole('combobox', { name: 'Number' }));
    });
    it('đưa node trigger vào ref dạng callback', () => {
      const nodes: (HTMLButtonElement | null)[] = [];
      render(
        <Select
          label="Number"
          options={options}
          ref={(node) => {
            nodes.push(node);
          }}
        />,
      );
      expect(nodes.at(-1)).toBe(screen.getByRole('combobox', { name: 'Number' }));
    });
  });
});
