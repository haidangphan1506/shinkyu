import { getCookie, removeCookie, setCookie } from '@/utils/cookie';

describe('getCookie', () => {
  it('đọc lại giá trị đã ghi', () => {
    setCookie('token', 'a b');
    expect(getCookie('token')).toBe('a b');
  });

  it('trả về null khi cookie không tồn tại', () => {
    expect(getCookie('thieu')).toBeNull();
  });
});

describe('setCookie', () => {
  it('tạo session cookie khi không truyền days', () => {
    setCookie('session', 'v');
    expect(getCookie('session')).toBe('v');
  });

  it('ghi với expires khi truyền days', () => {
    setCookie('expiring', 'v', { days: 7 });
    expect(getCookie('expiring')).toBe('v');
  });

  it('thêm Secure khi secure=true', () => {
    expect(() => setCookie('secured', 'v', { secure: true })).not.toThrow();
  });

  it('thêm Secure khi sameSite=None dù secure=false', () => {
    expect(() => setCookie('third-party', 'v', { sameSite: 'None' })).not.toThrow();
  });
});

describe('removeCookie', () => {
  it('xoá cookie đã ghi', () => {
    setCookie('can-xoa', 'v');
    removeCookie('can-xoa');
    expect(getCookie('can-xoa')).toBeNull();
  });
});
