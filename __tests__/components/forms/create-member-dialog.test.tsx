import { render, screen, waitFor, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { useState, type ComponentProps } from 'react';
import { CreateMemberDialog } from '@/components/forms/create-member-dialog';
import { datePickerText } from '@/constants/date-picker.constant';
import { memberFormText } from '@/constants/member-form.constant';

const { errors: messages } = memberFormText;

function today() {
  const now = new Date();
  const pad = (value: number) => String(value).padStart(2, '0');
  return {
    key: `${now.getFullYear()}-${pad(now.getMonth() + 1)}-${pad(now.getDate())}`,
    label: `${now.getFullYear()}年${now.getMonth() + 1}月${now.getDate()}日`,
  };
}

function currentMonthKey() {
  const now = new Date();
  return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`;
}

function displayDay(day: number) {
  const [year, month] = currentMonthKey().split('-');
  return `${year}/${month}/${String(day).padStart(2, '0')}`;
}

async function pickToday(label: string) {
  await userEvent.click(screen.getByLabelText(label));
  await userEvent.click(await screen.findByRole('gridcell', { name: today().label }));
}

async function pickTargetRange(fromDay: number, toDay: number) {
  const now = new Date();
  const monthLabel = `${now.getFullYear()}年${now.getMonth() + 1}月`;
  await userEvent.click(
    screen.getByRole('button', { name: memberFormText.demoTargetPeriod.label }),
  );

  for (const day of [fromDay, toDay]) {
    const dialog = await screen.findByRole('dialog', {
      name: datePickerText.calendarLabel,
    });
    const grid = within(dialog).getByRole('grid', { name: monthLabel });
    await userEvent.click(
      within(grid).getByRole('button', {
        name: new RegExp(`^${monthLabel}${day}日`),
      }),
    );
  }
}

function renderDialog(overrides: Partial<ComponentProps<typeof CreateMemberDialog>> = {}) {
  const onSubmit = jest.fn();
  const onClose = jest.fn();
  const view = render(
    <CreateMemberDialog open onClose={onClose} onSubmit={onSubmit} {...overrides} />,
  );

  return { ...view, onSubmit, onClose };
}

async function fillRequiredFields() {
  await userEvent.type(screen.getByLabelText(memberFormText.labels.username), ' yamada_taro ');
  await userEvent.type(screen.getByLabelText(memberFormText.labels.email), 'yamada@example.com');
  await pickToday(memberFormText.labels.registeredAt);
}

describe('CreateMemberDialog', () => {
  describe('hiển thị form', () => {
    it('render mọi field kèm label', () => {
      renderDialog();

      expect(screen.getByRole('dialog')).toHaveAccessibleName(memberFormText.title);
      for (const label of Object.values(memberFormText.labels)) {
        expect(screen.getByLabelText(label)).toBeInTheDocument();
      }
    });

    it('đánh dấu required cho user name và email', () => {
      renderDialog();

      for (const label of [memberFormText.labels.username, memberFormText.labels.email]) {
        const input = screen.getByLabelText(label);
        expect(input).toBeRequired();
        expect(input).toHaveAttribute('aria-required', 'true');
      }
      expect(screen.getByLabelText(memberFormText.labels.trainingDays)).not.toBeRequired();
    });
  });

  describe('validate khi submit', () => {
    it('hiển thị lỗi required và không submit form rỗng', async () => {
      const { onSubmit, onClose } = renderDialog();

      await userEvent.click(screen.getByRole('button', { name: memberFormText.submit }));

      expect(await screen.findByText(messages.usernameRequired)).toBeInTheDocument();
      expect(screen.getByText(messages.emailRequired)).toBeInTheDocument();
      expect(screen.getByText(messages.registeredAtRequired)).toBeInTheDocument();
      expect(onSubmit).not.toHaveBeenCalled();
      expect(onClose).not.toHaveBeenCalled();
    });

    it('từ chối email sai định dạng', async () => {
      const { onSubmit } = renderDialog();

      await userEvent.type(screen.getByLabelText(memberFormText.labels.username), 'yamada');
      await userEvent.type(screen.getByLabelText(memberFormText.labels.email), 'not-an-email');
      await pickToday(memberFormText.labels.registeredAt);
      await userEvent.click(screen.getByRole('button', { name: memberFormText.submit }));

      expect(await screen.findByText(messages.emailInvalid)).toBeInTheDocument();
      expect(onSubmit).not.toHaveBeenCalled();
    });
  });

  describe('validate khi blur', () => {
    it('báo lỗi required khi blur khỏi field rỗng, chưa cần submit', async () => {
      renderDialog();

      await userEvent.click(screen.getByLabelText(memberFormText.labels.username));
      await userEvent.tab();

      expect(await screen.findByText(messages.usernameRequired)).toBeInTheDocument();
    });

    it('báo lỗi định dạng email ngay khi blur, chưa cần submit', async () => {
      renderDialog();

      const emailInput = screen.getByLabelText(memberFormText.labels.email);
      await userEvent.type(emailInput, 'not-an-email');
      await userEvent.tab();

      expect(await screen.findByText(messages.emailInvalid)).toBeInTheDocument();
      expect(emailInput).toHaveAttribute('aria-invalid', 'true');
    });

    it('không báo lỗi email khi người dùng gõ xong mà chưa rời field', async () => {
      renderDialog();

      await userEvent.type(screen.getByLabelText(memberFormText.labels.email), 'not-an-email');

      expect(screen.queryByText(messages.emailInvalid)).not.toBeInTheDocument();
    });
  });

  describe('lỗi tự hết khi sửa field', () => {
    it('xoá lỗi field ngay khi field được chỉnh sửa', async () => {
      renderDialog();

      await userEvent.click(screen.getByRole('button', { name: memberFormText.submit }));
      expect(await screen.findByText(messages.usernameRequired)).toBeInTheDocument();

      await userEvent.type(screen.getByLabelText(memberFormText.labels.username), 'y');

      await waitFor(() =>
        expect(screen.queryByText(messages.usernameRequired)).not.toBeInTheDocument(),
      );
    });

    it('tự hết lỗi định dạng email khi sửa cho đúng', async () => {
      renderDialog();

      const emailInput = screen.getByLabelText(memberFormText.labels.email);
      await userEvent.type(emailInput, 'not-an-email');
      await userEvent.tab();
      expect(await screen.findByText(messages.emailInvalid)).toBeInTheDocument();

      await userEvent.clear(emailInput);
      await userEvent.type(emailInput, 'a@b.co');

      await waitFor(() =>
        expect(screen.queryByText(messages.emailInvalid)).not.toBeInTheDocument(),
      );
    });
  });

  describe('số ngày tập luyện', () => {
    it('chặn ký tự không phải số ở field số ngày tập luyện', async () => {
      renderDialog();

      const daysInput = screen.getByLabelText(memberFormText.labels.trainingDays);
      await userEvent.type(daysInput, '3日');
      await userEvent.tab();

      // `type="number"` đã chặn sẵn, nên rule numeric không cần bắn.
      expect(daysInput).toHaveValue(3);
      expect(screen.queryByText(messages.trainingDaysInvalid)).not.toBeInTheDocument();
    });

    it('không báo lỗi khi số ngày tập luyện bỏ trống', async () => {
      renderDialog();

      await userEvent.click(screen.getByLabelText(memberFormText.labels.trainingDays));
      await userEvent.tab();

      await waitFor(() =>
        expect(screen.queryByText(messages.trainingDaysInvalid)).not.toBeInTheDocument(),
      );
    });
  });

  describe('submit', () => {
    it('submit giá trị đã trim và đóng dialog', async () => {
      const { onSubmit, onClose } = renderDialog();

      await fillRequiredFields();
      await userEvent.type(screen.getByLabelText(memberFormText.labels.trainingDays), '3');
      await userEvent.click(screen.getByRole('button', { name: memberFormText.submit }));

      await waitFor(() => expect(onSubmit).toHaveBeenCalledTimes(1));
      expect(onSubmit).toHaveBeenCalledWith(
        expect.objectContaining({
          username: 'yamada_taro',
          email: 'yamada@example.com',
          affiliation: '個人申込',
          trainingDays: '3',
          registeredAt: today().key,
          expiresAt: '',
          subscriptionStatus: '未契約',
        }),
      );
      expect(onClose).toHaveBeenCalledTimes(1);
    });

    it('hiển thị trạng thái loading khi handler submit còn pending', async () => {
      let resolveSubmit: () => void = () => undefined;
      const onSubmit = jest.fn(
        () =>
          new Promise<void>((resolve) => {
            resolveSubmit = resolve;
          }),
      );
      render(<CreateMemberDialog open onClose={jest.fn()} onSubmit={onSubmit} />);

      await fillRequiredFields();
      const submitButton = screen.getByRole('button', {
        name: memberFormText.submit,
      });
      await userEvent.click(submitButton);

      await waitFor(() => expect(submitButton).toBeDisabled());
      expect(submitButton).toHaveAttribute('aria-busy', 'true');

      resolveSubmit();
      await waitFor(() => expect(submitButton).toBeEnabled());
    });
  });

  describe('demo field target period', () => {
    it('render trigger với placeholder riêng cho từng mép', () => {
      renderDialog();

      expect(
        screen.getByRole('button', {
          name: memberFormText.demoTargetPeriod.label,
        }),
      ).toHaveTextContent(
        `${memberFormText.rangePlaceholders.from} - ${memberFormText.rangePlaceholders.to}`,
      );
    });

    it('giữ cả hai đầu khi người dùng chọn khoảng', async () => {
      renderDialog();

      await pickTargetRange(10, 12);

      expect(
        screen.getByRole('button', {
          name: memberFormText.demoTargetPeriod.label,
        }),
      ).toHaveTextContent(`${displayDay(10)} - ${displayDay(12)}`);
    });

    it('không gửi khoảng ngày lên onSubmit', async () => {
      const { onSubmit } = renderDialog();
      await pickTargetRange(10, 12);
      await fillRequiredFields();
      await userEvent.click(screen.getByRole('button', { name: memberFormText.submit }));

      await waitFor(() => expect(onSubmit).toHaveBeenCalledTimes(1));
      expect(onSubmit.mock.calls[0]?.[0]).not.toHaveProperty('targetPeriod');
    });

    it('reset khoảng ngày khi hủy rồi mở lại', async () => {
      function Harness() {
        const [open, setOpen] = useState(true);
        return (
          <>
            <button type="button" onClick={() => setOpen(true)}>
              reopen
            </button>
            <CreateMemberDialog open={open} onClose={() => setOpen(false)} onSubmit={jest.fn()} />
          </>
        );
      }

      render(<Harness />);
      await pickTargetRange(10, 12);
      await userEvent.click(screen.getByRole('button', { name: memberFormText.cancel }));
      await userEvent.click(screen.getByRole('button', { name: 'reopen' }));

      expect(
        screen.getByRole('button', {
          name: memberFormText.demoTargetPeriod.label,
        }),
      ).toHaveTextContent(
        `${memberFormText.rangePlaceholders.from} - ${memberFormText.rangePlaceholders.to}`,
      );
    });
  });

  describe('hủy', () => {
    it('reset form khi hủy', async () => {
      function Harness() {
        const [open, setOpen] = useState(true);
        return (
          <>
            <button type="button" onClick={() => setOpen(true)}>
              reopen
            </button>
            <CreateMemberDialog open={open} onClose={() => setOpen(false)} onSubmit={jest.fn()} />
          </>
        );
      }

      render(<Harness />);
      const usernameInput = screen.getByLabelText(memberFormText.labels.username);
      await userEvent.type(usernameInput, 'draft');
      await userEvent.click(screen.getByRole('button', { name: memberFormText.cancel }));
      expect(screen.queryByRole('dialog')).not.toBeInTheDocument();

      await userEvent.click(screen.getByRole('button', { name: 'reopen' }));
      expect(screen.getByLabelText(memberFormText.labels.username)).toHaveValue('');
    });
  });
});
