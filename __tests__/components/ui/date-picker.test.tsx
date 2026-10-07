import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { createRef, useState } from 'react';
import { DatePicker } from '@/components/ui/date-picker';
import { Modal } from '@/components/ui/modal';
import { datePickerText } from '@/constants/date-picker.constant';

function today() {
  const now = new Date();
  const pad = (value: number) => String(value).padStart(2, '0');
  return {
    key: `${now.getFullYear()}-${pad(now.getMonth() + 1)}-${pad(now.getDate())}`,
    label: `${now.getFullYear()}年${now.getMonth() + 1}月${now.getDate()}日`,
  };
}

function monthLabel(date: Date) {
  return `${date.getFullYear()}年${date.getMonth() + 1}月`;
}

function dayLabel(date: Date) {
  return `${date.getFullYear()}年${date.getMonth() + 1}月${date.getDate()}日`;
}

function mockTriggerRect(trigger: HTMLElement, rect: Partial<DOMRect>) {
  jest.spyOn(trigger, 'getBoundingClientRect').mockReturnValue({
    x: 0,
    y: 0,
    top: 0,
    right: 0,
    bottom: 0,
    left: 0,
    width: 0,
    height: 0,
    toJSON: () => ({}),
    ...rect,
  } as DOMRect);
}

async function openCalendar(name = '登録日') {
  await userEvent.click(screen.getByRole('combobox', { name }));
  return screen.findByRole('dialog', {
    name: datePickerText.calendarLabel,
  });
}

describe('DatePicker', () => {
  describe('trigger đóng', () => {
    it('render một trigger đang đóng và hiện placeholder', () => {
      render(<DatePicker label="登録日" />);

      const trigger = screen.getByRole('combobox', { name: '登録日' });
      expect(trigger).toHaveTextContent(datePickerText.placeholder);
      expect(trigger).toHaveAttribute('aria-expanded', 'false');
      expect(screen.queryByRole('grid')).not.toBeInTheDocument();
    });
    it('không render label khi không truyền label', () => {
      render(<DatePicker id="registeredAt" aria-label="登録日" />);

      expect(screen.getByRole('combobox', { name: '登録日' })).toBeInTheDocument();
      expect(screen.queryByText('登録日')).not.toBeInTheDocument();
    });
  });

  describe('ref của trigger', () => {
    it('gán DOM node vào ref object', () => {
      const ref = createRef<HTMLButtonElement>();
      render(<DatePicker label="登録日" ref={ref} />);

      expect(ref.current).toBe(screen.getByRole('combobox', { name: '登録日' }));
    });
    it('gọi ref dạng callback với DOM node', () => {
      const received: (HTMLButtonElement | null)[] = [];
      render(
        <DatePicker
          label="登録日"
          ref={(node) => {
            received.push(node);
          }}
        />,
      );

      expect(received[0]).toBe(screen.getByRole('combobox', { name: '登録日' }));
    });
  });

  describe('mở calendar', () => {
    it('mở calendar khi click và đóng lại khi click lần thứ hai', async () => {
      render(<DatePicker label="登録日" />);

      await openCalendar();
      expect(screen.getByRole('combobox', { name: '登録日' })).toHaveAttribute(
        'aria-expanded',
        'true',
      );

      await userEvent.click(screen.getByRole('combobox', { name: '登録日' }));
      expect(screen.queryByRole('grid')).not.toBeInTheDocument();
    });
    it('mở calendar khi nhấn Enter và khi nhấn ArrowDown', async () => {
      render(<DatePicker label="登録日" />);
      const trigger = screen.getByRole('combobox', { name: '登録日' });

      trigger.focus();
      await userEvent.keyboard('{Enter}');
      expect(screen.getByRole('grid')).toBeInTheDocument();

      await userEvent.keyboard('{Escape}');
      await userEvent.keyboard('{ArrowDown}');
      expect(screen.getByRole('grid')).toBeInTheDocument();
    });
    it('bỏ qua phím mở calendar khi onKeyDown đã chặn mặc định', async () => {
      render(<DatePicker label="登録日" onKeyDown={(event) => event.preventDefault()} />);

      screen.getByRole('combobox', { name: '登録日' }).focus();
      await userEvent.keyboard('{Enter}');

      expect(screen.queryByRole('grid')).not.toBeInTheDocument();
    });
    it('bỏ qua phím mở calendar khi calendar đã mở', async () => {
      render(<DatePicker label="登録日" value="invalid" />);

      await openCalendar();
      await userEvent.keyboard('{ArrowDown}');

      expect(screen.getByRole('grid')).toBeInTheDocument();
    });
    it('mở calendar ở tháng hiện tại khi giá trị không phải ngày hợp lệ', async () => {
      render(<DatePicker label="登録日" value="invalid" />);
      await openCalendar();

      expect(screen.getByRole('grid')).toHaveAccessibleName(monthLabel(new Date()));

      fireEvent.keyDown(screen.getByRole('grid'), { key: 'ArrowRight' });

      const tomorrow = new Date();
      tomorrow.setDate(tomorrow.getDate() + 1);
      expect(screen.getByRole('gridcell', { name: dayLabel(tomorrow) })).toHaveFocus();
    });
    it('mở calendar ở tháng hiện tại khi năm vượt quá giới hạn ngày', async () => {
      render(<DatePicker label="登録日" value="9999999-01-01" />);

      await openCalendar();

      expect(screen.getByRole('grid')).toHaveAccessibleName(monthLabel(new Date()));
    });
  });

  describe('đóng calendar', () => {
    it('đóng calendar khi nhấn Escape và trả focus về trigger', async () => {
      render(<DatePicker label="登録日" />);

      await openCalendar();
      await userEvent.keyboard('{Escape}');

      expect(screen.queryByRole('grid')).not.toBeInTheDocument();
      expect(screen.getByRole('combobox', { name: '登録日' })).toHaveFocus();
    });
    it('đóng calendar khi click ra ngoài', async () => {
      render(
        <div>
          <DatePicker label="登録日" />
          <button type="button">Outside</button>
        </div>,
      );

      await openCalendar();
      await userEvent.click(screen.getByRole('button', { name: 'Outside' }));

      expect(screen.queryByRole('grid')).not.toBeInTheDocument();
    });
    it('đóng calendar khi focus trigger chuyển ra ngoài widget', async () => {
      render(
        <div>
          <DatePicker label="登録日" />
          <button type="button">Outside</button>
        </div>,
      );

      await openCalendar();
      const trigger = screen.getByRole('combobox', { name: '登録日' });
      expect(screen.getByRole('grid')).toBeInTheDocument();

      fireEvent.blur(trigger, {
        relatedTarget: screen.getByRole('button', { name: 'Outside' }),
      });

      expect(screen.queryByRole('grid')).not.toBeInTheDocument();
      expect(trigger).toHaveAttribute('aria-expanded', 'false');
    });
    it('báo onBlur khi trigger mất focus lúc calendar đang đóng', () => {
      const onBlur = jest.fn();
      render(<DatePicker label="登録日" onBlur={onBlur} />);

      fireEvent.blur(screen.getByRole('combobox', { name: '登録日' }));

      expect(onBlur).toHaveBeenCalled();
    });
    it('đóng calendar nhưng giữ modal bao quanh mở khi nhấn Escape', async () => {
      function Harness() {
        const [open, setOpen] = useState(true);
        return (
          <Modal open={open} onClose={() => setOpen(false)} title="フォーム">
            <DatePicker label="登録日" />
          </Modal>
        );
      }

      render(<Harness />);
      await userEvent.click(screen.getByRole('combobox', { name: '登録日' }));
      expect(screen.getByRole('grid')).toBeInTheDocument();

      await userEvent.keyboard('{Escape}');

      expect(screen.queryByRole('grid')).not.toBeInTheDocument();
      expect(screen.getByRole('dialog', { name: 'フォーム' })).toBeInTheDocument();
    });
  });

  describe('giá trị đã chọn', () => {
    it('chọn một ngày, báo về dạng YYYY-MM-DD và hiển thị YYYY/MM/DD', async () => {
      const onChange = jest.fn();
      render(<DatePicker label="登録日" onChange={onChange} />);

      await openCalendar();
      await userEvent.click(screen.getByRole('gridcell', { name: today().label }));

      expect(onChange).toHaveBeenCalledWith(today().key);
      expect(screen.queryByRole('grid')).not.toBeInTheDocument();
      expect(screen.getByRole('combobox', { name: '登録日' })).toHaveTextContent(today().key.replaceAll('-', '/'));
    });
    it('đánh dấu cell đang chọn và cell hôm nay', async () => {
      render(<DatePicker label="登録日" value="2026-09-28" />);

      await openCalendar();

      expect(screen.getByRole('gridcell', { name: '2026年9月28日' })).toHaveAttribute(
        'aria-selected',
        'true',
      );
      expect(screen.getByRole('gridcell', { name: today().label })).toHaveAttribute(
        'aria-current',
        'date',
      );
      expect(screen.getByRole('gridcell', { name: today().label })).toHaveClass('text-primary');
      expect(screen.getByRole('gridcell', { name: today().label })).not.toHaveClass('bg-primary');
    });
    it('chọn hôm nay từ button trong footer', async () => {
      const onChange = jest.fn();
      render(<DatePicker label="登録日" onChange={onChange} />);

      await openCalendar();
      await userEvent.click(screen.getByRole('button', { name: datePickerText.today }));

      expect(onChange).toHaveBeenCalledWith(today().key);
    });
    it('xoá giá trị đang chọn', async () => {
      const onChange = jest.fn();
      render(<DatePicker label="登録日" value="2026-09-28" onChange={onChange} />);

      await openCalendar();
      await userEvent.click(screen.getByRole('button', { name: datePickerText.clear }));

      expect(onChange).toHaveBeenCalledWith('');
    });
    it('hỗ trợ trạng thái uncontrolled', async () => {
      function Harness() {
        const [value, setValue] = useState('2026-09-15');
        return (
          <DatePicker
            label="登録日"
            value={value}
            onChange={(next) => {
              setValue(next);
            }}
          />
        );
      }

      render(<Harness />);
      await openCalendar();
      await userEvent.click(screen.getByRole('button', { name: datePickerText.clear }));

      await waitFor(() =>
        expect(screen.getByRole('combobox', { name: '登録日' })).toHaveTextContent(
          datePickerText.placeholder,
        ),
      );
    });
    it('xoá giá trị mặc định khi không truyền value', async () => {
      const onChange = jest.fn();
      render(<DatePicker label="登録日" defaultValue="2026-09-15" onChange={onChange} />);
      const trigger = screen.getByRole('combobox', { name: '登録日' });
      expect(trigger).toHaveTextContent('2026/09/15');

      await openCalendar();
      await userEvent.click(screen.getByRole('button', { name: datePickerText.clear }));

      expect(onChange).toHaveBeenCalledWith('');
      expect(trigger).toHaveTextContent(datePickerText.placeholder);
    });
  });

  describe('khoảng ngày cho phép', () => {
    it('kẹp focus về min khi ngày đang chọn nhỏ hơn min', async () => {
      render(<DatePicker label="登録日" value="2026-09-15" min="2026-09-20" />);

      await openCalendar();

      expect(screen.getByRole('gridcell', { name: '2026年9月20日' })).toHaveFocus();
    });
    it('kẹp focus về max khi ngày đang chọn lớn hơn max', async () => {
      render(<DatePicker label="登録日" value="2026-09-15" max="2026-09-10" />);

      await openCalendar();

      expect(screen.getByRole('gridcell', { name: '2026年9月10日' })).toHaveFocus();
    });
    it('bỏ qua chọn ngày khi khoảng min và max mâu thuẫn', async () => {
      const onChange = jest.fn();
      render(
        <DatePicker
          label="登録日"
          value="2026-09-20"
          min="2026-09-20"
          max="2026-09-10"
          onChange={onChange}
        />,
      );

      await openCalendar();
      fireEvent.keyDown(screen.getByRole('grid'), { key: 'Enter' });

      expect(onChange).not.toHaveBeenCalled();
      expect(screen.getByRole('grid')).toBeInTheDocument();
    });
    it('bỏ qua điều hướng khi min không phải ngày hợp lệ', async () => {
      render(<DatePicker label="登録日" value="2026-09-15" min="zzz" />);

      await openCalendar();
      fireEvent.keyDown(screen.getByRole('grid'), { key: 'ArrowRight' });

      expect(screen.getByRole('gridcell', { name: '2026年9月15日' })).toHaveAttribute(
        'tabindex',
        '-1',
      );
    });
  });

  describe('điều hướng trong calendar', () => {
    it('duyệt qua các tháng bằng button ở header', async () => {
      render(<DatePicker label="登録日" />);
      const now = new Date();
      const next = new Date(now.getFullYear(), now.getMonth() + 1, 1);

      await openCalendar();
      await userEvent.click(screen.getByRole('button', { name: datePickerText.nextMonth }));

      expect(screen.getByRole('grid')).toHaveAccessibleName(monthLabel(next));
      await userEvent.click(screen.getByRole('button', { name: datePickerText.previousMonth }));
      await userEvent.click(screen.getByRole('button', { name: datePickerText.previousMonth }));
      const previous = new Date(now.getFullYear(), now.getMonth() - 1, 1);
      expect(screen.getByRole('grid')).toHaveAccessibleName(monthLabel(previous));
    });
    it('di chuyển ngày đang có focus bằng các arrow key', async () => {
      render(<DatePicker label="登録日" value="2026-09-15" />);

      await openCalendar();
      expect(screen.getByRole('gridcell', { name: '2026年9月15日' })).toHaveAttribute(
        'tabindex',
        '0',
      );

      await userEvent.keyboard('{ArrowRight}');
      expect(screen.getByRole('gridcell', { name: '2026年9月16日' })).toHaveFocus();
      expect(screen.getByRole('gridcell', { name: '2026年9月16日' })).toHaveAttribute(
        'tabindex',
        '0',
      );

      await userEvent.keyboard('{ArrowDown}');
      expect(screen.getByRole('gridcell', { name: '2026年9月23日' })).toHaveFocus();

      await userEvent.keyboard('{PageDown}');
      expect(screen.getByRole('grid')).toHaveAccessibleName('2026年10月');
    });
    it('lùi ngày và lùi tuần bằng ArrowLeft và ArrowUp', async () => {
      render(<DatePicker label="登録日" value="2026-09-15" />);

      await openCalendar();
      await userEvent.keyboard('{ArrowLeft}');
      expect(screen.getByRole('gridcell', { name: '2026年9月14日' })).toHaveFocus();

      await userEvent.keyboard('{ArrowUp}');
      expect(screen.getByRole('gridcell', { name: '2026年9月7日' })).toHaveFocus();
    });
    it('đưa focus về đầu và cuối tuần bằng Home và End', async () => {
      render(<DatePicker label="登録日" value="2026-09-16" />);

      await openCalendar();
      await userEvent.keyboard('{Home}');
      expect(screen.getByRole('gridcell', { name: '2026年9月13日' })).toHaveFocus();

      await userEvent.keyboard('{End}');
      expect(screen.getByRole('gridcell', { name: '2026年9月19日' })).toHaveFocus();
    });
    it('lùi một tháng bằng PageUp', async () => {
      render(<DatePicker label="登録日" value="2026-09-15" />);

      await openCalendar();
      await userEvent.keyboard('{PageUp}');

      expect(screen.getByRole('grid')).toHaveAccessibleName('2026年8月');
      expect(screen.getByRole('gridcell', { name: '2026年8月15日' })).toHaveFocus();
    });
    it('bỏ qua phím không thuộc bảng điều khiển', async () => {
      render(<DatePicker label="登録日" value="2026-09-15" />);

      await openCalendar();
      await userEvent.keyboard('a');

      expect(screen.getByRole('grid')).toBeInTheDocument();
      expect(screen.getByRole('gridcell', { name: '2026年9月15日' })).toHaveFocus();
    });
    it('chọn ngày đang có focus bằng phím Enter', async () => {
      const onChange = jest.fn();
      render(<DatePicker label="登録日" value="2026-09-15" onChange={onChange} />);

      await openCalendar();
      await userEvent.keyboard('{ArrowRight}{Enter}');

      expect(onChange).toHaveBeenCalledWith('2026-09-16');
    });
  });

  describe('vị trí calendar', () => {
    const initialViewport = {
      width: window.innerWidth,
      height: window.innerHeight,
    };

    afterEach(() => {
      Object.defineProperty(window, 'innerWidth', {
        value: initialViewport.width,
        configurable: true,
      });
      Object.defineProperty(window, 'innerHeight', {
        value: initialViewport.height,
        configurable: true,
      });
    });

    it('mở xuống và giới hạn chiều cao theo khoảng trống còn lại', async () => {
      render(<DatePicker label="登録日" />);
      mockTriggerRect(screen.getByRole('combobox', { name: '登録日' }), {
        top: 300,
        bottom: 460,
      });

      const calendar = await openCalendar();

      expect(calendar).toHaveClass('top-full', 'mt-1', 'left-0');
      expect(calendar).toHaveStyle({ maxHeight: '304px' });
    });
    it('mở lên khi khoảng trống phía dưới không đủ', async () => {
      render(<DatePicker label="登録日" />);
      mockTriggerRect(screen.getByRole('combobox', { name: '登録日' }), {
        top: 700,
        bottom: 760,
      });

      const calendar = await openCalendar();

      expect(calendar).toHaveClass('bottom-full', 'mb-1', 'left-0');
      expect(calendar).toHaveStyle({ maxHeight: '340px' });
    });
    it('căn sang phải khi sát mép phải viewport', async () => {
      render(<DatePicker label="登録日" />);
      mockTriggerRect(screen.getByRole('combobox', { name: '登録日' }), {
        top: 300,
        bottom: 460,
        left: 800,
        right: 900,
      });

      const calendar = await openCalendar();

      expect(calendar).toHaveClass('top-full', 'mt-1', 'right-0');
    });
    it('căn sang trái khi trigger tràn ra ngoài mép trái viewport', async () => {
      render(<DatePicker label="登録日" />);
      mockTriggerRect(screen.getByRole('combobox', { name: '登録日' }), {
        top: 300,
        bottom: 460,
        left: 800,
        right: 100,
      });

      const calendar = await openCalendar();

      expect(calendar).toHaveClass('top-full', 'mt-1', 'left-0');
    });
  });

  describe('disabled', () => {
    it('không mở calendar khi ở trạng thái disabled', async () => {
      render(<DatePicker label="登録日" disabled />);

      await userEvent.click(screen.getByRole('combobox', { name: '登録日' }));

      expect(screen.queryByRole('grid')).not.toBeInTheDocument();
    });
    it('disabled các ngày nằm ngoài khoảng min và max', async () => {
      const onChange = jest.fn();
      render(
        <DatePicker
          label="登録日"
          value="2026-09-15"
          min="2026-09-10"
          max="2026-09-20"
          onChange={onChange}
        />,
      );

      await openCalendar();

      expect(screen.getByRole('gridcell', { name: '2026年9月9日' })).toBeDisabled();
      expect(screen.getByRole('gridcell', { name: '2026年9月21日' })).toBeDisabled();
      expect(screen.getByRole('gridcell', { name: '2026年9月15日' })).not.toBeDisabled();

      await userEvent.click(screen.getByRole('gridcell', { name: '2026年9月21日' }));
      expect(onChange).not.toHaveBeenCalled();
    });
  });

  describe('trong form', () => {
    it('submit một hidden input khi name được đặt', () => {
      const { container } = render(
        <DatePicker label="登録日" name="registeredAt" value="2026-09-28" />,
      );

      const hidden = container.querySelector(
        'input[type="hidden"][name="registeredAt"]',
      ) as HTMLInputElement;
      expect(hidden).toHaveValue('2026-09-28');
    });
  });
});
