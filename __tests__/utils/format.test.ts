import {
  formatBytes,
  formatCurrency,
  formatDateTime,
  formatNumber,
  formatPercent,
} from '@/utils/format';

describe('formatNumber', () => {
  it('phân cách nhóm theo locale mặc định ja-JP', () => {
    expect(formatNumber(1234567)).toBe('1,234,567');
  });

  it('dùng locale truyền vào', () => {
    expect(formatNumber(1234567, 'de-DE')).toBe('1.234.567');
  });

  it('trả về "-" khi giá trị không hữu hạn', () => {
    expect(formatNumber(NaN)).toBe('-');
    expect(formatNumber(Infinity)).toBe('-');
  });
});

describe('formatCurrency', () => {
  it('dùng locale và currency truyền vào', () => {
    expect(formatCurrency(1200, 'USD', 'en-US')).toBe('$1,200.00');
  });

  it('mặc định JPY theo ja-JP', () => {
    expect(formatCurrency(1200)).toContain('1,200');
  });

  it('trả về "-" khi giá trị không hữu hạn', () => {
    expect(formatCurrency(NaN)).toBe('-');
  });
});

describe('formatPercent', () => {
  it('làm tròn về 0 chữ số thập phân theo mặc định', () => {
    expect(formatPercent(0.1234)).toBe('12%');
  });

  it('giữ số chữ số thập phân truyền vào', () => {
    expect(formatPercent(0.1234, 2)).toBe('12.34%');
  });

  it('trả về "-" khi giá trị không hữu hạn', () => {
    expect(formatPercent(NaN)).toBe('-');
  });
});

describe('formatDateTime', () => {
  it('chuẩn hóa chuỗi ISO về đúng ISO 8601', () => {
    expect(formatDateTime('2026-10-05T03:04:05.000Z')).toBe('2026-10-05T03:04:05.000Z');
  });

  it('chuyển Date và timestamp về ISO 8601', () => {
    const date = new Date('2026-10-05T03:04:05.000Z');
    expect(formatDateTime(date)).toBe('2026-10-05T03:04:05.000Z');
    expect(formatDateTime(date.getTime())).toBe('2026-10-05T03:04:05.000Z');
  });

  it('trả về "-" khi ngày không hợp lệ', () => {
    expect(formatDateTime('not-a-date')).toBe('-');
  });
});

describe('formatBytes', () => {
  it('chuyển sang đơn vị lớn nhất phù hợp', () => {
    expect(formatBytes(1536)).toBe('1.5 KB');
    expect(formatBytes(10)).toBe('10 B');
  });

  it('trả về "-" khi bytes không hữu hạn', () => {
    expect(formatBytes(NaN)).toBe('-');
    expect(formatBytes(Infinity)).toBe('-');
  });

  it('trả về "-" khi bytes âm', () => {
    expect(formatBytes(-1)).toBe('-');
  });
});
