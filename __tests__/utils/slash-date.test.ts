import { toDisplayDate, toInputDate } from '@/utils/slash-date';

describe('toDisplayDate', () => {
  it('đổi gạch nối thành gạch chéo để hiển thị', () => {
    expect(toDisplayDate('2026-01-05')).toBe('2026/01/05');
  });

  it('trả về chuỗi rỗng khi nhận chuỗi rỗng', () => {
    expect(toDisplayDate('')).toBe('');
  });
});

describe('toInputDate', () => {
  it('đổi gạch chéo thành gạch nối cho form control', () => {
    expect(toInputDate('2026/01/05')).toBe('2026-01-05');
  });

  it('trả về chuỗi rỗng khi nhận chuỗi rỗng', () => {
    expect(toInputDate('')).toBe('');
  });
});
