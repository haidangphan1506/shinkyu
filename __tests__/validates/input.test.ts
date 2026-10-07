import { inputText } from '@/constants';
import { findInputRuleError, resolveInputRules } from '@/validates/input';
import type { InputRule } from '@/types';

const emailRule: InputRule = { label: 'email', message: 'メールが不正です' };
const requiredRule: InputRule = {
  label: 'required',
  message: '入力してください',
};

describe('resolveInputRules', () => {
  describe('không required', () => {
    it('trả về nguyên danh sách khi không required', () => {
      const rules = [emailRule];
      expect(resolveInputRules(rules, false)).toBe(rules);
    });

    it('trả về mảng rỗng khi không có rules lẫn required', () => {
      expect(resolveInputRules(undefined, false)).toEqual([]);
    });
  });

  describe('required', () => {
    it('chèn rule required mặc định khi required mà chưa có rule', () => {
      expect(resolveInputRules([emailRule], true)).toEqual([
        { label: 'required', message: inputText.required },
        emailRule,
      ]);
    });

    it('giữ message do caller truyền cho rule required', () => {
      expect(resolveInputRules([requiredRule], true)).toEqual([requiredRule]);
    });

    it('chèn rule required mặc định khi required mà không có rules', () => {
      expect(resolveInputRules(undefined, true)).toEqual([
        { label: 'required', message: inputText.required },
      ]);
    });
  });
});

describe('findInputRuleError', () => {
  describe('giá trị rỗng', () => {
    it('trả về message của rule required khi giá trị rỗng', () => {
      expect(findInputRuleError('', [requiredRule])).toBe('入力してください');
    });

    it('coi khoảng trắng thuần là giá trị rỗng', () => {
      expect(findInputRuleError('   ', [requiredRule])).toBe('入力してください');
    });

    it('bỏ qua rule required khi giá trị có dữ liệu', () => {
      expect(findInputRuleError('a', [requiredRule])).toBeUndefined();
    });

    it('bỏ qua mọi rule khác khi giá trị rỗng', () => {
      expect(findInputRuleError('', [emailRule])).toBeUndefined();
    });
  });

  describe('giá trị hợp lệ', () => {
    it('chấp nhận email đúng định dạng', () => {
      expect(findInputRuleError('a@b.co', [emailRule])).toBeUndefined();
    });

    it('bỏ khoảng trắng thừa trước khi kiểm tra định dạng', () => {
      expect(findInputRuleError('  a@b.co  ', [emailRule])).toBeUndefined();
    });
  });

  describe('giá trị sai định dạng', () => {
    it('báo lỗi khi email sai định dạng', () => {
      expect(findInputRuleError('nope', [emailRule])).toBe('メールが不正です');
    });

    it('báo lỗi khi ngắn hơn minLength', () => {
      const rule: InputRule = { label: 'minLength', minLength: 3, message: 'Ngắn' };
      expect(findInputRuleError('ab', [rule])).toBe('Ngắn');
      expect(findInputRuleError('abc', [rule])).toBeUndefined();
    });

    it('báo lỗi khi dài hơn maxLength', () => {
      const rule: InputRule = { label: 'maxLength', maxLength: 3, message: 'Dài' };
      expect(findInputRuleError('abcd', [rule])).toBe('Dài');
      expect(findInputRuleError('abc', [rule])).toBeUndefined();
    });

    it('báo lỗi khi không khớp pattern', () => {
      const rule: InputRule = { label: 'pattern', pattern: /^\d+$/, message: 'Số' };
      expect(findInputRuleError('ab', [rule])).toBe('Số');
      expect(findInputRuleError('12', [rule])).toBeUndefined();
    });

    it('báo lỗi khi không phải số', () => {
      const rule: InputRule = { label: 'numeric', message: 'Số' };
      expect(findInputRuleError('12a', [rule])).toBe('Số');
      expect(findInputRuleError('12', [rule])).toBeUndefined();
    });

    it('đo minLength trên giá trị đã bỏ khoảng trắng', () => {
      const rule: InputRule = { label: 'minLength', minLength: 3, message: 'Ngắn' };
      // 4 ký tự thô nhưng chỉ 2 sau trim, nên vẫn fail.
      expect(findInputRuleError(' ab ', [rule])).toBe('Ngắn');
    });
  });

  describe('nhiều rule', () => {
    it('lấy message của rule fail đầu tiên theo thứ tự truyền', () => {
      const rules: InputRule[] = [
        { label: 'numeric', message: 'Số trước' },
        { label: 'minLength', minLength: 5, message: 'Dài sau' },
      ];
      expect(findInputRuleError('ab', rules)).toBe('Số trước');
    });

    it('trả về undefined khi không có rule nào fail', () => {
      expect(findInputRuleError('ab', [])).toBeUndefined();
    });
  });
});
