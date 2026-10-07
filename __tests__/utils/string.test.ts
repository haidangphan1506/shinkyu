import { capitalize, isBlank, toHalfWidth, truncate } from '@/utils/string';

describe('isBlank', () => {
  it('coi null, undefined và chuỗi rỗng là blank', () => {
    expect(isBlank(null)).toBe(true);
    expect(isBlank(undefined)).toBe(true);
    expect(isBlank('')).toBe(true);
  });

  it('coi chuỗi toàn khoảng trắng là blank', () => {
    expect(isBlank('   ')).toBe(true);
  });

  it('không coi chuỗi có nội dung là blank', () => {
    expect(isBlank('a')).toBe(false);
    expect(isBlank(' a ')).toBe(false);
  });
});

describe('capitalize', () => {
  it('viết hoa ký tự đầu', () => {
    expect(capitalize('alice')).toBe('Alice');
  });

  it('giữ nguyên chuỗi đã viết hoa', () => {
    expect(capitalize('Alice')).toBe('Alice');
  });

  it('trả về chuỗi rỗng khi nhận chuỗi rỗng', () => {
    expect(capitalize('')).toBe('');
  });
});

describe('toHalfWidth', () => {
  it('chuyển chữ và số toàn dạng half-width', () => {
    expect(toHalfWidth('ＡＢＣ１２３')).toBe('ABC123');
  });

  it('chuyển ideographic space thành khoảng trắng thường', () => {
    expect(toHalfWidth('あ　い')).toBe('あ い');
  });

  it('giữ nguyên ký tự half-width và chữ thường khác', () => {
    expect(toHalfWidth('Abc 123')).toBe('Abc 123');
  });
});

describe('truncate', () => {
  it('giữ nguyên chuỗi khi đã nằm trong maxLength', () => {
    expect(truncate('abc', 4)).toBe('abc');
  });

  it('cắt chuỗi và nối ellipsis mặc định khi vượt maxLength', () => {
    expect(truncate('abcdef', 4)).toBe('abc…');
  });

  it('dùng ellipsis truyền vào khi cắt', () => {
    expect(truncate('abcdef', 5, '...')).toBe('ab...');
  });
});
