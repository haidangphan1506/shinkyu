import { createRef, useState } from 'react';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { Input } from '@/components/ui/input';
import { inputText } from '@/constants';

describe('Input', () => {
  describe('mặc định', () => {
    it('render label và liên kết nó với input', () => {
      render(<Input label="Email" />);
      expect(screen.getByLabelText('Email')).toBeInTheDocument();
    });

    it('render label dạng node tùy chỉnh', () => {
      render(<Input label={<span>Email bắt buộc</span>} />);
      expect(screen.getByText('Email bắt buộc')).toBeInTheDocument();
    });

    it('vẫn render input khi không truyền label', () => {
      render(<Input />);
      expect(screen.getByRole('textbox')).toBeInTheDocument();
    });

    it('dùng id truyền vào cho cả input và label', () => {
      render(<Input id="email" label="Email" />);
      const input = screen.getByLabelText('Email');
      expect(input).toHaveAttribute('id', 'email');
    });

    it('tự sinh id khi không truyền id', () => {
      render(<Input label="Email" />);
      expect(screen.getByLabelText('Email')).toHaveAttribute('id');
    });

    it('nhận dữ liệu người dùng nhập vào', async () => {
      render(<Input label="Email" />);
      const input = screen.getByLabelText('Email');
      await userEvent.type(input, 'hello@example.com');
      expect(input).toHaveValue('hello@example.com');
    });

    it('hoạt động như input có kiểm soát', async () => {
      function ControlledInput() {
        const [value, setValue] = useState('');
        return (
          <Input label="Email" value={value} onChange={(event) => setValue(event.target.value)} />
        );
      }

      render(<ControlledInput />);
      const input = screen.getByLabelText('Email');
      await userEvent.type(input, 'ab');
      expect(input).toHaveValue('ab');
    });

    it('gọi onChange với giá trị mới', async () => {
      const onChange = jest.fn();
      render(<Input label="Email" onChange={onChange} />);
      await userEvent.type(screen.getByLabelText('Email'), 'a');
      expect(onChange).toHaveBeenCalledTimes(1);
    });

    it('chuyển tiếp thuộc tính native của input', () => {
      render(<Input label="Password" type="password" placeholder="••••" />);
      const input = screen.getByLabelText('Password');
      expect(input).toHaveAttribute('type', 'password');
      expect(input).toHaveAttribute('placeholder', '••••');
    });

    it('chuyển ref tới phần tử input', () => {
      const ref = createRef<HTMLInputElement>();
      render(<Input label="Email" ref={ref} />);
      expect(ref.current).toBe(screen.getByLabelText('Email'));
    });

    it('giữ onBlur của caller', async () => {
      const onBlur = jest.fn();
      render(<Input label="Email" onBlur={onBlur} />);
      await userEvent.click(screen.getByLabelText('Email'));
      await userEvent.tab();
      expect(onBlur).toHaveBeenCalledTimes(1);
    });
  });

  describe('disabled', () => {
    it('không nhận dữ liệu khi bị disabled', async () => {
      render(<Input label="Email" disabled />);
      const input = screen.getByLabelText('Email');
      expect(input).toBeDisabled();
      await userEvent.type(input, 'hello');
      expect(input).toHaveValue('');
    });
  });

  describe('hint và lỗi từ props', () => {
    it('render chữ hint', () => {
      render(<Input label="Email" hint="We never share your email" />);
      expect(screen.getByText('We never share your email')).toBeInTheDocument();
    });

    it('render thông báo error với role alert và aria-invalid', () => {
      render(<Input label="Email" error="Email is required" />);
      const alert = screen.getByRole('alert');
      expect(alert).toHaveTextContent('Email is required');
      expect(screen.getByLabelText('Email')).toHaveAttribute('aria-invalid', 'true');
    });

    it('hiện cả hint và error cùng lúc', () => {
      render(<Input label="Email" hint="We never share your email" error="Invalid" />);
      expect(screen.getByText('We never share your email')).toBeInTheDocument();
      expect(screen.getByRole('alert')).toHaveTextContent('Invalid');
    });

    it('nối aria-describedby tới cả hint và error', () => {
      render(
        <Input
          id="email"
          label="Email"
          hint="We never share your email"
          error="Email is required"
        />,
      );
      expect(screen.getByLabelText('Email')).toHaveAttribute(
        'aria-describedby',
        'email-hint email-error',
      );
      expect(screen.getByText('We never share your email')).toHaveAttribute('id', 'email-hint');
      expect(screen.getByRole('alert')).toHaveAttribute('id', 'email-error');
    });

    it('giữ aria-describedby truyền vào rồi nối thêm hint', () => {
      render(
        <Input
          id="email"
          label="Email"
          hint="We never share your email"
          aria-describedby="external-help"
        />,
      );
      expect(screen.getByLabelText('Email')).toHaveAttribute(
        'aria-describedby',
        'external-help email-hint',
      );
    });

    it('bỏ aria-describedby khi không có hint lẫn error', () => {
      render(<Input label="Email" />);
      expect(screen.getByLabelText('Email')).not.toHaveAttribute('aria-describedby');
    });

    it('giữ aria-invalid truyền vào khi không có error', () => {
      render(<Input label="Email" aria-invalid="true" />);
      expect(screen.getByLabelText('Email')).toHaveAttribute('aria-invalid', 'true');
    });

    it('đổi sang class lỗi khi có error', () => {
      const { rerender } = render(<Input label="Email" />);
      expect(screen.getByLabelText('Email')).toHaveClass('border-border');
      rerender(<Input label="Email" error="Email is required" />);
      expect(screen.getByLabelText('Email')).toHaveClass('border-error');
    });
  });

  describe('required', () => {
    it('đánh dấu required bằng dấu sao, thuộc tính required và aria-required', () => {
      render(<Input label="Email" required />);
      const input = screen.getByLabelText('Email');
      expect(input).toBeRequired();
      expect(input).toHaveAttribute('aria-required', 'true');
      expect(screen.getByText('*')).toBeInTheDocument();
    });

    it('không hiện dấu sao khi không required', () => {
      render(<Input label="Email" />);
      const input = screen.getByLabelText('Email');
      expect(input).not.toBeRequired();
      expect(input).not.toHaveAttribute('aria-required');
      expect(screen.queryByText('*')).not.toBeInTheDocument();
    });
  });

  describe('validate khi blur', () => {
    it('báo lỗi mặc định khi blur khỏi field required còn rỗng', async () => {
      render(<Input label="Email" required />);
      const input = screen.getByLabelText('Email');
      await userEvent.click(input);
      await userEvent.tab();
      expect(screen.getByRole('alert')).toHaveTextContent(inputText.required);
      expect(input).toHaveAttribute('aria-invalid', 'true');
    });

    it('dùng message của caller cho rule required', async () => {
      render(
        <Input
          label="Email"
          required
          rules={[{ label: 'required', message: 'Email là bắt buộc' }]}
        />,
      );
      await userEvent.click(screen.getByLabelText('Email'));
      await userEvent.tab();
      expect(screen.getByRole('alert')).toHaveTextContent('Email là bắt buộc');
    });

    it('không báo lỗi trước khi blur', async () => {
      render(<Input label="Email" required />);
      await userEvent.type(screen.getByLabelText('Email'), 'a');
      expect(screen.queryByRole('alert')).not.toBeInTheDocument();
    });

    it('báo lỗi rule theo sau khi blur rồi tự hết khi sửa cho đúng', async () => {
      render(<Input label="Email" rules={[{ label: 'email', message: 'メールが不正です' }]} />);
      const input = screen.getByLabelText('Email');
      await userEvent.type(input, 'nope');
      await userEvent.tab();
      expect(screen.getByRole('alert')).toHaveTextContent('メールが不正です');
      expect(input).toHaveClass('border-error');

      await userEvent.type(input, '@example.com');
      expect(screen.queryByRole('alert')).not.toBeInTheDocument();
      expect(input).toHaveClass('border-border');
    });

    it('không báo lỗi rule khi blur khi giá trị đã hợp lệ', async () => {
      render(<Input label="Email" rules={[{ label: 'email', message: 'メールが不正です' }]} />);
      await userEvent.type(screen.getByLabelText('Email'), 'a@b.co');
      await userEvent.tab();
      expect(screen.queryByRole('alert')).not.toBeInTheDocument();
    });

    it('bỏ qua rule khi field không bắt buộc và còn rỗng', async () => {
      render(<Input label="Email" rules={[{ label: 'email', message: 'メールが不正です' }]} />);
      await userEvent.click(screen.getByLabelText('Email'));
      await userEvent.tab();
      expect(screen.queryByRole('alert')).not.toBeInTheDocument();
    });

    it('báo lỗi theo rule đầu tiên fail khi có nhiều rule', async () => {
      render(
        <Input
          label="Code"
          rules={[
            { label: 'numeric', message: 'Chỉ số' },
            { label: 'minLength', minLength: 4, message: 'Ít nhất 4 ký tự' },
          ]}
        />,
      );
      await userEvent.type(screen.getByLabelText('Code'), 'ab');
      await userEvent.tab();
      expect(screen.getByRole('alert')).toHaveTextContent('Chỉ số');
    });

    it('nối aria-describedby tới lỗi sinh từ rules', async () => {
      render(<Input id="email" label="Email" required />);
      const input = screen.getByLabelText('Email');
      await userEvent.click(input);
      await userEvent.tab();
      expect(input).toHaveAttribute('aria-describedby', 'email-error');
    });
  });

  describe('giá trị và lỗi do parent kiểm soát', () => {
    it('validate theo value do parent kiểm soát', async () => {
      const { rerender } = render(
        <Input
          label="Email"
          value="nope"
          rules={[{ label: 'email', message: 'メールが不正です' }]}
        />,
      );
      await userEvent.click(screen.getByLabelText('Email'));
      await userEvent.tab();
      expect(screen.getByRole('alert')).toHaveTextContent('メールが不正です');

      rerender(
        <Input
          label="Email"
          value="a@b.co"
          rules={[{ label: 'email', message: 'メールが不正です' }]}
        />,
      );
      expect(screen.queryByRole('alert')).not.toBeInTheDocument();
    });

    it('cho error truyền vào thắng lỗi từ rules', async () => {
      render(
        <Input
          label="Email"
          required
          rules={[{ label: 'required', message: 'Từ rules' }]}
          error="Từ parent"
        />,
      );
      expect(screen.getByRole('alert')).toHaveTextContent('Từ parent');
    });

    it('bỏ qua lỗi rules khi parent truyền error rỗng', async () => {
      render(
        <Input
          label="Email"
          required
          rules={[{ label: 'required', message: 'Từ rules' }]}
          error={null}
        />,
      );
      await userEvent.click(screen.getByLabelText('Email'));
      await userEvent.tab();
      expect(screen.getByRole('alert')).toHaveTextContent('Từ rules');
    });
  });

  describe('className', () => {
    it('mặc định wrapper chiếm full width và cho phép ghi đè', () => {
      const { container, rerender } = render(<Input label="Email" />);
      expect(container.firstChild).toHaveClass('w-full');
      rerender(<Input label="Email" containerClassName="w-64" />);
      expect(container.firstChild).toHaveClass('w-64');
    });

    it('gộp className tùy chỉnh vào class mặc định', () => {
      render(<Input label="Email" className="rounded-full" />);
      const input = screen.getByLabelText('Email');
      expect(input).toHaveClass('h-10', 'rounded-full');
    });
  });
});
