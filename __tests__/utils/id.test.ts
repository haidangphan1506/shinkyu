import { nextPrefixedId } from '@/utils/id';

describe('nextPrefixedId', () => {
  it('tăng từ id số cao nhất', () => {
    expect(nextPrefixedId(['U-0001', 'U-0009'])).toBe('U-0010');
  });

  it('bỏ qua id không chứa chữ số', () => {
    expect(nextPrefixedId(['abc', 'U-0003'])).toBe('U-0004');
  });

  it('bắt đầu từ 0001 khi danh sách rỗng', () => {
    expect(nextPrefixedId([])).toBe('U-0001');
  });

  it('dùng prefix và width truyền vào', () => {
    expect(nextPrefixedId(['M-007'], 'M', 3)).toBe('M-008');
  });
});
