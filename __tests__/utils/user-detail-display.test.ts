import { displayValue, EMPTY_PLACEHOLDER } from '@/utils/user-detail-display';

describe('displayValue', () => {
  it('giữ nguyên giá trị chuỗi và số', () => {
    expect(displayValue('U-1')).toBe('U-1');
    expect(displayValue(1200)).toBe('1200');
  });

  it('cắt khoảng trắng hai đầu rồi trả về', () => {
    expect(displayValue('  Alice  ')).toBe('Alice');
  });

  it('trả về placeholder khi là null hoặc undefined', () => {
    expect(displayValue(null)).toBe(EMPTY_PLACEHOLDER);
    expect(displayValue(undefined)).toBe(EMPTY_PLACEHOLDER);
  });

  it('trả về placeholder khi chuỗi rỗng hoặc toàn khoảng trắng', () => {
    expect(displayValue('')).toBe(EMPTY_PLACEHOLDER);
    expect(displayValue('   ')).toBe(EMPTY_PLACEHOLDER);
  });
});
