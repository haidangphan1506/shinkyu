/**
 * @jest-environment node
 */
import { getCookie, removeCookie, setCookie } from '@/utils/cookie';

describe('không có document', () => {
  it('getCookie trả về null', () => {
    expect(typeof document).toBe('undefined');
    expect(getCookie('k')).toBeNull();
  });

  it('setCookie và removeCookie là no-op', () => {
    expect(() => setCookie('k', 'v')).not.toThrow();
    expect(() => removeCookie('k')).not.toThrow();
  });
});
