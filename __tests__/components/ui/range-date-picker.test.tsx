import { render, screen, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { useState } from 'react';
import { RangeDatePicker } from '@/components/ui/range-date-picker';
import { datePickerText } from '@/constants/date-picker.constant';

const label = '対象期間';
const emptyRange = { from: '', to: '' };

function trigger(name = label) {
  return screen.getByRole('button', { name });
}

function dayNamePattern(key: string) {
  const [year, month, day] = key.split('-').map(Number);
  return new RegExp(`^${year}年${month}月${day}日`);
}

function monthGrid(dialog: HTMLElement, key: string) {
  const [year, month] = key.split('-').map(Number);
  return within(dialog).getByRole('grid', { name: `${year}年${month}月` });
}

function dayButton(dialog: HTMLElement, key: string) {
  return within(monthGrid(dialog, key)).getByRole('button', {
    name: dayNamePattern(key),
  });
}

function dayCell(dialog: HTMLElement, key: string) {
  const day = Number(key.split('-')[2]);
  return within(monthGrid(dialog, key)).getByRole('gridcell', {
    name: String(day),
  });
}

async function openCalendar(name = label) {
  await userEvent.click(trigger(name));
  return screen.findByRole('dialog', { name: datePickerText.calendarLabel });
}

async function closeCalendar() {
  await userEvent.click(trigger());
}

async function selectRange(from: string, to: string) {
  await userEvent.click(dayButton(await openCalendar(), from));
  await userEvent.click(dayButton(await screen.findByRole('dialog'), to));
}

describe('RangeDatePicker', () => {
  describe('trigger đóng', () => {
    it('render trigger với aria-haspopup dialog và chưa có calendar', () => {
      render(<RangeDatePicker label={label} />);

      expect(trigger()).toHaveAttribute('aria-haspopup', 'dialog');
      expect(trigger()).toHaveAttribute('aria-expanded', 'false');
      expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
    });

    it('hiện placeholder mặc định khi chưa chọn ngày nào', () => {
      render(<RangeDatePicker label={label} />);

      expect(trigger()).toHaveTextContent('yyyy/mm/dd - yyyy/mm/dd');
    });

    it('hiện placeholder truyền vào khi tự tuỳ chỉnh', () => {
      render(<RangeDatePicker label={label} fromPlaceholder="開始日" toPlaceholder="終了日" />);

      expect(trigger()).toHaveTextContent('開始日 - 終了日');
    });

    it('không render label khi không truyền label', () => {
      const { container } = render(<RangeDatePicker id="period" />);

      expect(screen.queryByText(label)).not.toBeInTheDocument();
      expect(container.querySelector('label')).toBeNull();
      expect(screen.getByRole('button')).toHaveAttribute('id', 'period');
    });
  });

  describe('khoảng ngày rỗng', () => {
    it('không có nút clear khi chưa chọn đủ hai mép', () => {
      render(<RangeDatePicker label={label} />);

      expect(screen.queryByRole('button', { name: datePickerText.clear })).not.toBeInTheDocument();
    });

    it('hiện placeholder khi chỉ có một mép', () => {
      render(<RangeDatePicker label={label} value={{ from: '2026-09-01', to: '' }} />);

      expect(trigger()).toHaveTextContent('yyyy/mm/dd - yyyy/mm/dd');
    });

    it('hiện placeholder khi ngày không tồn tại trong tháng', () => {
      render(<RangeDatePicker label={label} value={{ from: '2026-02-31', to: '2026-03-05' }} />);

      expect(trigger()).toHaveTextContent('yyyy/mm/dd - yyyy/mm/dd');
    });

    it('hiện placeholder khi ngày sai định dạng', () => {
      render(<RangeDatePicker label={label} value={{ from: '2026-9-5', to: '2026-13-01' }} />);

      expect(trigger()).toHaveTextContent('yyyy/mm/dd - yyyy/mm/dd');
    });
  });

  describe('khoảng ngày đã chọn', () => {
    it('hiện khoảng ngày dạng yyyy/mm/dd trên trigger', () => {
      render(
        <RangeDatePicker label={label} defaultValue={{ from: '2026-09-01', to: '2026-09-30' }} />,
      );

      expect(trigger()).toHaveTextContent('2026/09/01 - 2026/09/30');
    });

    it('render nút clear trong calendar', async () => {
      render(
        <RangeDatePicker label={label} defaultValue={{ from: '2026-09-01', to: '2026-09-30' }} />,
      );

      expect(
        within(await openCalendar()).getByRole('button', {
          name: datePickerText.clear,
        }),
      ).toBeInTheDocument();
    });

    it('xoá khoảng ngày và đóng calendar khi bấm clear', async () => {
      const onChange = jest.fn();
      render(
        <RangeDatePicker
          label={label}
          defaultValue={{ from: '2026-09-01', to: '2026-09-30' }}
          onChange={onChange}
        />,
      );

      const dialog = await openCalendar();
      await userEvent.click(within(dialog).getByRole('button', { name: datePickerText.clear }));

      expect(onChange).toHaveBeenCalledTimes(1);
      expect(onChange).toHaveBeenCalledWith(emptyRange);
      expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
      expect(trigger()).toHaveTextContent('yyyy/mm/dd - yyyy/mm/dd');
      expect(trigger()).toHaveFocus();
    });
  });

  describe('chọn khoảng ngày', () => {
    it('gọi onChange một lần với hai mép khi chọn tăng dần', async () => {
      const onChange = jest.fn();
      render(<RangeDatePicker label={label} onChange={onChange} />);

      await selectRange('2026-10-10', '2026-10-12');

      expect(onChange).toHaveBeenCalledTimes(1);
      expect(onChange).toHaveBeenCalledWith({
        from: '2026-10-10',
        to: '2026-10-12',
      });
      expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
    });

    it('sắp from trước to khi chọn ngày sau trước', async () => {
      const onChange = jest.fn();
      render(<RangeDatePicker label={label} onChange={onChange} />);

      await selectRange('2026-10-12', '2026-10-10');

      expect(onChange).toHaveBeenCalledWith({
        from: '2026-10-10',
        to: '2026-10-12',
      });
    });

    it('chấp nhận hai mép bằng nhau khi bấm cùng một ngày', async () => {
      const onChange = jest.fn();
      render(<RangeDatePicker label={label} onChange={onChange} />);

      await selectRange('2026-10-10', '2026-10-10');

      expect(onChange).toHaveBeenCalledWith({
        from: '2026-10-10',
        to: '2026-10-10',
      });
    });

    it('trả focus về trigger sau khi chọn xong', async () => {
      render(<RangeDatePicker label={label} />);

      await selectRange('2026-10-10', '2026-10-12');

      expect(trigger()).toHaveFocus();
    });

    it('cập nhật hiển thị khi không truyền value', async () => {
      render(<RangeDatePicker label={label} />);

      await selectRange('2026-10-10', '2026-10-12');

      expect(trigger()).toHaveTextContent('2026/10/10 - 2026/10/12');
    });

    it('giữ nguyên giá trị do cha điều khiển', async () => {
      const onChange = jest.fn();
      render(
        <RangeDatePicker
          label={label}
          value={{ from: '2026-09-01', to: '2026-09-05' }}
          onChange={onChange}
        />,
      );

      await selectRange('2026-09-10', '2026-09-12');

      expect(onChange).toHaveBeenCalledWith({
        from: '2026-09-10',
        to: '2026-09-12',
      });
      expect(trigger()).toHaveTextContent('2026/09/01 - 2026/09/05');
    });

    it('cập nhật state nội bộ dù không truyền onChange', async () => {
      render(<RangeDatePicker label={label} defaultValue={emptyRange} />);

      await selectRange('2026-10-10', '2026-10-12');

      expect(trigger()).toHaveTextContent('2026/10/10 - 2026/10/12');
    });
  });

  describe('chọn dở một ngày', () => {
    it('chỉ đánh dấu ngày vừa bấm và giữ calendar mở', async () => {
      const onChange = jest.fn();
      render(<RangeDatePicker label={label} onChange={onChange} />);

      const dialog = await openCalendar();
      await userEvent.click(dayButton(dialog, '2026-10-10'));

      expect(dayCell(dialog, '2026-10-10')).toHaveAttribute('aria-selected', 'true');
      expect(dayCell(dialog, '2026-10-11')).not.toHaveAttribute('aria-selected');
      expect(onChange).not.toHaveBeenCalled();
      expect(screen.getByRole('dialog')).toBeInTheDocument();
    });

    it('xoá lựa chọn dở khi đóng calendar bằng phím Escape', async () => {
      render(
        <RangeDatePicker label={label} defaultValue={{ from: '2026-10-01', to: '2026-10-03' }} />,
      );

      const dialog = await openCalendar();
      await userEvent.click(dayButton(dialog, '2026-10-10'));
      await userEvent.keyboard('{Escape}');

      const reopened = await openCalendar();
      expect(dayCell(reopened, '2026-10-10')).not.toHaveAttribute('aria-selected');
    });

    it('xoá lựa chọn dở khi bấm lại trigger để đóng', async () => {
      render(
        <RangeDatePicker label={label} defaultValue={{ from: '2026-10-01', to: '2026-10-03' }} />,
      );

      const dialog = await openCalendar();
      await userEvent.click(dayButton(dialog, '2026-10-10'));
      await closeCalendar();
      await openCalendar();

      const reopened = await screen.findByRole('dialog');
      expect(dayCell(reopened, '2026-10-10')).not.toHaveAttribute('aria-selected');
    });
  });

  describe('xem trước khi hover', () => {
    it('tô các ngày giữa khi hover về sau', async () => {
      render(<RangeDatePicker label={label} />);

      const dialog = await openCalendar();
      await userEvent.click(dayButton(dialog, '2026-10-10'));
      await userEvent.hover(dayButton(dialog, '2026-10-12'));

      expect(dayCell(dialog, '2026-10-11')).toHaveAttribute('aria-selected', 'true');
      expect(dayCell(dialog, '2026-10-12')).toHaveAttribute('aria-selected', 'true');
    });

    it('tô các ngày giữa khi hover về trước', async () => {
      render(<RangeDatePicker label={label} />);

      const dialog = await openCalendar();
      await userEvent.click(dayButton(dialog, '2026-10-12'));
      await userEvent.hover(dayButton(dialog, '2026-10-10'));

      expect(dayCell(dialog, '2026-10-11')).toHaveAttribute('aria-selected', 'true');
    });

    it('bỏ tô ngày giữa khi rời ngày đang hover', async () => {
      render(<RangeDatePicker label={label} />);

      const dialog = await openCalendar();
      await userEvent.click(dayButton(dialog, '2026-10-10'));
      await userEvent.hover(dayButton(dialog, '2026-10-12'));
      await userEvent.unhover(dayButton(dialog, '2026-10-12'));

      expect(dayCell(dialog, '2026-10-11')).not.toHaveAttribute('aria-selected');
    });

    it('giữ ngày đầu chọn được tô khi rời ngày đang hover', async () => {
      render(<RangeDatePicker label={label} />);

      const dialog = await openCalendar();
      await userEvent.click(dayButton(dialog, '2026-10-10'));
      await userEvent.hover(dayButton(dialog, '2026-10-15'));
      await userEvent.unhover(dayButton(dialog, '2026-10-15'));

      expect(dayCell(dialog, '2026-10-10')).toHaveAttribute('aria-selected', 'true');
    });
  });

  describe('điều hướng tháng', () => {
    it('mở calendar tại tháng của from', async () => {
      render(
        <RangeDatePicker label={label} defaultValue={{ from: '2026-09-01', to: '2026-09-30' }} />,
      );

      const dialog = await openCalendar();
      expect(within(dialog).getAllByRole('status')).toHaveLength(2);
      expect(within(dialog).getAllByRole('status')[0]).toHaveTextContent('2026年9月');
      expect(within(dialog).getAllByRole('status')[1]).toHaveTextContent('2026年10月');
    });

    it('chuyển tháng khi bấm nút tháng trước và tháng sau', async () => {
      render(
        <RangeDatePicker label={label} defaultValue={{ from: '2026-09-01', to: '2026-09-30' }} />,
      );

      let dialog = await openCalendar();
      await userEvent.click(within(dialog).getByRole('button', { name: '次の月へ' }));

      dialog = await screen.findByRole('dialog');
      expect(within(dialog).getAllByRole('status')[0]).toHaveTextContent('2026年10月');

      await userEvent.click(within(dialog).getByRole('button', { name: '前の月へ' }));

      expect(within(screen.getByRole('dialog')).getAllByRole('status')[0]).toHaveTextContent(
        '2026年9月',
      );
    });

    it('mở lại tại tháng của from sau khi đã điều hướng', async () => {
      render(
        <RangeDatePicker label={label} defaultValue={{ from: '2026-09-01', to: '2026-09-30' }} />,
      );

      const dialog = await openCalendar();
      await userEvent.click(within(dialog).getByRole('button', { name: '次の月へ' }));
      await closeCalendar();
      await openCalendar();

      expect(within(await screen.findByRole('dialog')).getAllByRole('status')[0]).toHaveTextContent(
        '2026年9月',
      );
    });
  });

  describe('giới hạn min và max', () => {
    it('disable ngày trước min và sau max', async () => {
      render(<RangeDatePicker label={label} min="2026-10-05" max="2026-10-20" />);

      const dialog = await openCalendar();
      expect(dayButton(dialog, '2026-10-04')).toBeDisabled();
      expect(dayButton(dialog, '2026-10-10')).toBeEnabled();
      expect(dayButton(dialog, '2026-10-22')).toBeDisabled();
    });

    it('chỉ disable ngày trước min khi không truyền max', async () => {
      render(<RangeDatePicker label={label} min="2026-10-05" />);

      const dialog = await openCalendar();
      expect(dayButton(dialog, '2026-10-04')).toBeDisabled();
      expect(dayButton(dialog, '2026-10-22')).toBeEnabled();
    });

    it('chỉ disable ngày sau max khi không truyền min', async () => {
      render(<RangeDatePicker label={label} max="2026-10-20" />);

      const dialog = await openCalendar();
      expect(dayButton(dialog, '2026-10-04')).toBeEnabled();
      expect(dayButton(dialog, '2026-10-22')).toBeDisabled();
    });

    it('không disable ngày nào khi min và max sai định dạng', async () => {
      render(<RangeDatePicker label={label} min="2026-10-99" max="bad" />);

      const dialog = await openCalendar();
      expect(dayButton(dialog, '2026-10-04')).toBeEnabled();
      expect(dayButton(dialog, '2026-10-22')).toBeEnabled();
    });
  });

  describe('disabled và required', () => {
    it('disable trigger và không mở calendar', async () => {
      render(<RangeDatePicker label={label} disabled />);

      expect(trigger()).toBeDisabled();
      await userEvent.click(trigger());
      expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
    });

    it('không disable trigger theo mặc định', () => {
      render(<RangeDatePicker label={label} />);

      expect(trigger()).toBeEnabled();
    });

    it('đánh dấu aria-required khi required', () => {
      render(<RangeDatePicker label={label} required />);

      expect(trigger()).toHaveAttribute('aria-required', 'true');
    });

    it('không đánh dấu aria-required theo mặc định', () => {
      render(<RangeDatePicker label={label} />);

      expect(trigger()).not.toHaveAttribute('aria-required');
    });

    it('đóng calendar khi bấm trigger sau khi disabled chuyển sang true', async () => {
      function ToggleDisabled() {
        const [disabled, setDisabled] = useState(false);
        return (
          <>
            <button type="button" onClick={() => setDisabled((current) => !current)}>
              Toggle disabled
            </button>
            <RangeDatePicker label={label} disabled={disabled} />
          </>
        );
      }

      render(<ToggleDisabled />);

      const dialog = await openCalendar();
      expect(dialog).toBeInTheDocument();

      await userEvent.click(screen.getByRole('button', { name: 'Toggle disabled' }));
      await userEvent.click(trigger());

      expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
    });
  });

  describe('hint và error', () => {
    it('mô tả trigger bằng hint', () => {
      render(<RangeDatePicker id="period" label={label} hint="任意" />);

      expect(trigger()).toHaveAttribute('aria-describedby', 'period-hint');
      expect(trigger()).toHaveAccessibleDescription('任意');
    });

    it('báo lỗi qua role alert và đánh dấu aria-invalid', () => {
      render(<RangeDatePicker id="period" label={label} error="必須項目です" />);

      expect(screen.getByRole('alert')).toHaveTextContent('必須項目です');
      expect(trigger()).toHaveAttribute('aria-invalid', 'true');
      expect(trigger()).toHaveAttribute('aria-describedby', 'period-error');
    });

    it('mô tả trigger bằng cả hint và error', () => {
      render(<RangeDatePicker id="period" label={label} hint="任意" error="必須項目です" />);

      expect(trigger()).toHaveAttribute('aria-describedby', 'period-hint period-error');
      expect(trigger()).toHaveAccessibleDescription('任意 必須項目です');
    });

    it('không gắn aria-describedby và aria-invalid khi không có hint và error', () => {
      render(<RangeDatePicker label={label} />);

      expect(trigger()).not.toHaveAttribute('aria-describedby');
      expect(trigger()).not.toHaveAttribute('aria-invalid');
    });
  });

  describe('nhãn và id', () => {
    it('nối label với trigger và dùng id truyền vào', () => {
      render(<RangeDatePicker id="period" label={label} />);

      expect(trigger()).toHaveAttribute('id', 'period');
      expect(screen.getByText(label)).toHaveAttribute('for', 'period');
    });

    it('sinh id khi không truyền id và nối aria-controls của calendar', async () => {
      render(<RangeDatePicker label={label} />);

      expect(trigger().getAttribute('id')).toEqual(expect.any(String));
      const dialog = await openCalendar();
      expect(trigger()).toHaveAttribute('aria-controls', dialog.getAttribute('id'));
    });
  });

  describe('submit trong form', () => {
    it('tạo hidden input tên From và To theo name truyền vào', () => {
      render(
        <RangeDatePicker
          label={label}
          name="period"
          defaultValue={{ from: '2026-09-01', to: '2026-09-30' }}
        />,
      );

      expect(document.querySelector('input[name="periodFrom"]')).toHaveValue('2026-09-01');
      expect(document.querySelector('input[name="periodTo"]')).toHaveValue('2026-09-30');
    });

    it('cập nhật hidden input sau khi chọn khoảng ngày', async () => {
      render(<RangeDatePicker label={label} name="period" defaultValue={emptyRange} />);

      await selectRange('2026-10-10', '2026-10-12');

      expect(document.querySelector('input[name="periodFrom"]')).toHaveValue('2026-10-10');
      expect(document.querySelector('input[name="periodTo"]')).toHaveValue('2026-10-12');
    });

    it('không render hidden input khi không truyền name', () => {
      const { container } = render(<RangeDatePicker label={label} />);

      expect(container.querySelector('input[type="hidden"]')).toBeNull();
    });
  });

  describe('className tuỳ chỉnh', () => {
    it('nối className vào trigger và containerClassName vào container', () => {
      const { container } = render(
        <RangeDatePicker
          label={label}
          className="custom-trigger"
          containerClassName="custom-container"
        />,
      );

      expect(trigger()).toHaveClass('custom-trigger');
      expect(container.firstChild).toHaveClass('custom-container');
    });
  });
});
