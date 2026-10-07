import { createRef, useState } from 'react';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { TextArea } from '@/components/ui/textarea';

describe('TextArea', () => {
  describe('mặc định', () => {
    it('render label và liên kết label với textarea', () => {
      render(<TextArea label="Notes" />);
      expect(screen.getByLabelText('Notes')).toBeInTheDocument();
    });

    it('vẫn render textarea khi không truyền label', () => {
      render(<TextArea />);
      expect(screen.getByRole('textbox')).toBeInTheDocument();
    });

    it('dùng id truyền vào và tự sinh id khi thiếu', () => {
      const { rerender } = render(<TextArea id="notes" label="Notes" />);
      expect(screen.getByLabelText('Notes')).toHaveAttribute('id', 'notes');
      rerender(<TextArea label="Notes" />);
      expect(screen.getByLabelText('Notes')).toHaveAttribute('id');
    });

    it('mặc định 4 dòng và chuyển tiếp thuộc tính native', () => {
      render(<TextArea label="Notes" rows={8} placeholder="Nhập ghi chú" />);
      const textarea = screen.getByLabelText('Notes');
      expect(textarea).toHaveAttribute('rows', '8');
      expect(textarea).toHaveAttribute('placeholder', 'Nhập ghi chú');
    });

    it('chuyển ref tới phần tử textarea', () => {
      const ref = createRef<HTMLTextAreaElement>();
      render(<TextArea label="Notes" ref={ref} />);
      expect(ref.current).toBe(screen.getByLabelText('Notes'));
    });

    it('gộp containerClassName và className tùy chỉnh', () => {
      const { container } = render(
        <TextArea label="Notes" containerClassName="w-64" className="h-40" />,
      );
      expect(container.firstChild).toHaveClass('w-64');
      expect(screen.getByLabelText('Notes')).toHaveClass('h-40');
    });
  });

  describe('giá trị', () => {
    it('nhận input từ người dùng', async () => {
      render(<TextArea label="Notes" />);
      const textarea = screen.getByLabelText('Notes');
      await userEvent.type(textarea, 'hello world');
      expect(textarea).toHaveValue('hello world');
    });

    it('khởi tạo từ defaultValue', () => {
      render(<TextArea label="Notes" defaultValue="sẵn có" />);
      expect(screen.getByLabelText('Notes')).toHaveValue('sẵn có');
    });

    it('hoạt động như textarea có kiểm soát', async () => {
      function ControlledTextArea() {
        const [value, setValue] = useState('');
        return (
          <TextArea
            label="Notes"
            value={value}
            onChange={(event) => setValue(event.target.value)}
          />
        );
      }

      render(<ControlledTextArea />);
      const textarea = screen.getByLabelText('Notes');
      await userEvent.type(textarea, 'ab');
      expect(textarea).toHaveValue('ab');
    });

    it('gọi onChange mỗi lần người dùng nhập', async () => {
      const onChange = jest.fn();
      render(<TextArea label="Notes" onChange={onChange} />);
      await userEvent.type(screen.getByLabelText('Notes'), 'a');
      expect(onChange).toHaveBeenCalledTimes(1);
    });
  });

  describe('đếm ký tự', () => {
    it('hiện số ký tự khi truyền showCount và maxLength', async () => {
      render(<TextArea label="Notes" showCount maxLength={20} />);
      const textarea = screen.getByLabelText('Notes');
      await userEvent.type(textarea, 'hello');
      expect(screen.getByText('5/20')).toBeInTheDocument();
    });

    it('chỉ hiện số ký tự khi không có maxLength', async () => {
      render(<TextArea label="Notes" showCount />);
      const textarea = screen.getByLabelText('Notes');
      await userEvent.type(textarea, 'abc');
      expect(screen.getByText('3')).toBeInTheDocument();
    });

    it('giữ bộ đếm theo value do parent kiểm soát', () => {
      render(<TextArea label="Notes" showCount maxLength={10} value="abcd" />);
      expect(screen.getByText('4/10')).toBeInTheDocument();
    });

    it('không hiện bộ đếm khi không truyền showCount', () => {
      render(<TextArea label="Notes" maxLength={10} />);
      expect(screen.queryByText('0/10')).not.toBeInTheDocument();
    });
  });

  describe('hint và lỗi', () => {
    it('nối aria-describedby tới cả hint và error', () => {
      render(
        <TextArea id="notes" label="Notes" hint="Không quá 200 ký tự" error="Notes là bắt buộc" />,
      );
      const textarea = screen.getByLabelText('Notes');
      expect(textarea).toHaveAttribute('aria-describedby', 'notes-hint notes-error');
      expect(screen.getByText('Không quá 200 ký tự')).toHaveAttribute('id', 'notes-hint');
      expect(screen.getByRole('alert')).toHaveAttribute('id', 'notes-error');
    });

    it('giữ aria-describedby truyền vào rồi nối thêm hint', () => {
      render(
        <TextArea
          id="notes"
          label="Notes"
          hint="Không quá 200 ký tự"
          aria-describedby="external-help"
        />,
      );
      expect(screen.getByLabelText('Notes')).toHaveAttribute(
        'aria-describedby',
        'external-help notes-hint',
      );
    });

    it('bỏ aria-describedby khi không có hint lẫn error', () => {
      render(<TextArea label="Notes" />);
      expect(screen.getByLabelText('Notes')).not.toHaveAttribute('aria-describedby');
    });

    it('render thông báo lỗi với role alert', () => {
      render(<TextArea label="Notes" error="Notes are required" />);
      expect(screen.getByRole('alert')).toHaveTextContent('Notes are required');
    });

    it('giữ aria-invalid truyền vào khi không có error', () => {
      render(<TextArea label="Notes" aria-invalid="true" />);
      expect(screen.getByLabelText('Notes')).toHaveAttribute('aria-invalid', 'true');
    });

    it('đổi sang class lỗi khi có error', () => {
      const { rerender } = render(<TextArea label="Notes" />);
      expect(screen.getByLabelText('Notes')).toHaveClass('border-border');
      rerender(<TextArea label="Notes" error="Notes are required" />);
      expect(screen.getByLabelText('Notes')).toHaveClass('border-error');
    });

    it('hiện cả hint và bộ đếm cùng lúc', async () => {
      render(<TextArea label="Notes" hint="Không quá 200 ký tự" showCount maxLength={200} />);
      expect(screen.getByText('Không quá 200 ký tự')).toBeInTheDocument();
      expect(screen.getByText('0/200')).toBeInTheDocument();
    });

    it('giữ chỗ cho bộ đếm khi không có hint', () => {
      render(<TextArea label="Notes" showCount />);
      expect(screen.getByText('0')).toBeInTheDocument();
    });
  });

  describe('disabled', () => {
    it('không nhận dữ liệu khi bị disabled', async () => {
      render(<TextArea label="Notes" disabled />);
      const textarea = screen.getByLabelText('Notes');
      expect(textarea).toBeDisabled();
      await userEvent.type(textarea, 'hello');
      expect(textarea).toHaveValue('');
    });
  });
});
