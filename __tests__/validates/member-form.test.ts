import { validateMemberForm } from '@/validates/member-form';
import { emptyMemberFormValues, memberFormText } from '@/constants/member-form.constant';
import type { MemberFormValues } from '@/types';

const { errors: messages } = memberFormText;

function values(overrides: Partial<MemberFormValues> = {}): MemberFormValues {
  return { ...emptyMemberFormValues, ...overrides };
}

const validValues = {
  username: 'yamada_taro',
  email: 'yamada@example.com',
  registeredAt: '2026-01-15',
};

describe('validateMemberForm', () => {
  describe('dữ liệu hợp lệ', () => {
    it('không báo lỗi khi mọi field hợp lệ', () => {
      expect(validateMemberForm(values(validValues))).toEqual({});
    });

    it('chấp nhận email có khoảng trắng thừa vì sẽ được trim khi submit', () => {
      const result = validateMemberForm(
        values({ ...validValues, email: '  yamada@example.com  ' }),
      );
      expect(result.email).toBeUndefined();
    });

    it('cho phép bỏ trống số ngày tập luyện', () => {
      const result = validateMemberForm(values({ ...validValues, trainingDays: '' }));
      expect(result.trainingDays).toBeUndefined();
    });
  });

  describe('thiếu dữ liệu', () => {
    it('báo lỗi khi thiếu username, email và ngày đăng ký', () => {
      expect(validateMemberForm(values())).toEqual({
        username: messages.usernameRequired,
        email: messages.emailRequired,
        registeredAt: messages.registeredAtRequired,
      });
    });

    it('coi khoảng trắng thuần là thiếu username', () => {
      const result = validateMemberForm(values({ ...validValues, username: '  ' }));
      expect(result.username).toBe(messages.usernameRequired);
    });

    it('gộp nhiều lỗi của các field khác nhau', () => {
      const result = validateMemberForm(
        values({ email: 'nope', trainingDays: 'x', note: 'あ'.repeat(201) }),
      );
      expect(result).toEqual({
        username: messages.usernameRequired,
        email: messages.emailInvalid,
        trainingDays: messages.trainingDaysInvalid,
        registeredAt: messages.registeredAtRequired,
        note: messages.noteTooLong,
      });
    });
  });

  describe('sai định dạng', () => {
    it('báo lỗi khi email sai định dạng', () => {
      const result = validateMemberForm(values({ ...validValues, email: 'not-an-email' }));
      expect(result.email).toBe(messages.emailInvalid);
    });

    it('báo lỗi khi số ngày tập luyện không phải số', () => {
      const result = validateMemberForm(values({ ...validValues, trainingDays: '3日' }));
      expect(result.trainingDays).toBe(messages.trainingDaysInvalid);
    });

    it('báo lỗi khi số ngày tập luyện âm', () => {
      const result = validateMemberForm(values({ ...validValues, trainingDays: '-1' }));
      expect(result.trainingDays).toBe(messages.trainingDaysMin);
    });

    it('báo lỗi khi số ngày tập luyện không phải số nguyên', () => {
      const result = validateMemberForm(values({ ...validValues, trainingDays: '1.5' }));
      expect(result.trainingDays).toBe(messages.trainingDaysInteger);
    });

    it('báo lỗi khi expiresAt trước registeredAt', () => {
      const result = validateMemberForm(values({ ...validValues, expiresAt: '2026-01-14' }));
      expect(result.expiresAt).toBe(messages.expiresAtAfterRegister);
    });

    it('chấp nhận expiresAt trùng registeredAt', () => {
      const result = validateMemberForm(values({ ...validValues, expiresAt: '2026-01-15' }));
      expect(result.expiresAt).toBeUndefined();
    });

    it('báo lỗi khi ghi chú dài hơn giới hạn', () => {
      const result = validateMemberForm(values({ ...validValues, note: 'あ'.repeat(201) }));
      expect(result.note).toBe(messages.noteTooLong);
    });
  });
});
