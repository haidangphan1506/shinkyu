import {
  coercePaginatedTableResult,
  excerpt,
  formatBytes,
  getContrastText,
  getFieldErrors,
  getPastedText,
  getUserActionError,
  getUserDetailRows,
  isEmptyHtml,
  isValidationError,
  matchesQuery,
  nextPrefixedId,
  slugify,
  stripHtml,
  toDisplayDate,
  toInputDate,
  truncate,
  withAlpha,
  buildFetchHeaders,
  getCookie,
  setCookie,
  removeCookie,
  normalizePastedText,
  handlePlainTextPaste,
} from '@/utils';
import type { AppUser } from '@/types';

describe('slash-date', () => {
  it('converts between input and display formats', () => {
    expect(toDisplayDate('2026-01-05')).toBe('2026/01/05');
    expect(toInputDate('2026/01/05')).toBe('2026-01-05');
    expect(toDisplayDate('')).toBe('');
  });
});

describe('nextPrefixedId', () => {
  it('increments the highest id', () => {
    expect(nextPrefixedId(['U-0001', 'U-0009', 'U-0003'])).toBe('U-0010');
    expect(nextPrefixedId([])).toBe('U-0001');
  });
});

describe('matchesQuery', () => {
  it('matches case-insensitively and treats blank as match-all', () => {
    expect(matchesQuery(' ALI ', ['alice', 'x'])).toBe(true);
    expect(matchesQuery('zzz', ['alice'])).toBe(false);
    expect(matchesQuery('  ', ['alice'])).toBe(true);
  });
});

describe('api-validation-error', () => {
  it('reads the supported error shapes', () => {
    expect(getFieldErrors({ message: 'x', data: { errors: { email: ['bad', 'worse'] } } })).toEqual(
      { email: 'bad' },
    );
    expect(
      getFieldErrors({ message: 'x', data: { errors: [{ field: 'a', message: 'm' }] } }),
    ).toEqual({ a: 'm' });
    expect(getFieldErrors(new Error('nope'))).toEqual({});
    expect(getFieldErrors('string')).toEqual({});
  });

  it('detects validation errors by status code', () => {
    expect(isValidationError({ message: 'x', code: 400 })).toBe(true);
    expect(isValidationError({ message: 'x', code: 422 })).toBe(true);
    expect(isValidationError({ message: 'x', code: 500 })).toBe(false);
    expect(isValidationError({ message: 'x' })).toBe(false);
    expect(isValidationError(new Error('x'))).toBe(false);
    expect(isValidationError('string')).toBe(false);
  });
});

describe('coercePaginatedTableResult', () => {
  it('normalizes shapes', () => {
    expect(coercePaginatedTableResult([1, 2])).toEqual({ rows: [1, 2], total: 2 });
    expect(coercePaginatedTableResult({ items: [1], meta: { total: 40 } })).toEqual({
      rows: [1],
      total: 40,
    });
    expect(coercePaginatedTableResult({ data: [1, 2, 3] })).toEqual({ rows: [1, 2, 3], total: 3 });
    expect(coercePaginatedTableResult(null)).toEqual({ rows: [], total: 0 });
  });

  it('falls back to empty array when no rows found', () => {
    expect(coercePaginatedTableResult({ total: 5 })).toEqual({ rows: [], total: 5 });
    expect(coercePaginatedTableResult({ unknown: 'field' })).toEqual({ rows: [], total: 0 });
  });
});

describe('colors', () => {
  it('handles hex, alpha, contrast', () => {
    expect(withAlpha('#fff', 0.5)).toBe('rgba(255, 255, 255, 0.5)');
    expect(withAlpha('nope', 0.5)).toBe('nope');
    expect(getContrastText('#ffffff')).toBe('#000000');
    expect(getContrastText('#000000')).toBe('#ffffff');
  });

  it('falls back to black for invalid hex in getContrastText', () => {
    expect(getContrastText('invalid')).toBe('#000000');
    expect(getContrastText('#ggg')).toBe('#000000');
  });
});

describe('content', () => {
  it('strips markup and detects empty html', () => {
    expect(stripHtml('<p>a&nbsp;b</p><p>c</p>')).toBe('a b\nc');
    expect(isEmptyHtml('<p><br></p>')).toBe(true);
    expect(isEmptyHtml('<img src="x">')).toBe(false);
    expect(excerpt('<p>hello world</p>', 5)).toBe('hello…');
  });

  it('replaces HTML entities in stripHtml', () => {
    expect(stripHtml('a&nbsp;b')).toBe('a b');
  });

  it('detects empty html with media', () => {
    expect(isEmptyHtml('<p><br></p>')).toBe(true);
    expect(isEmptyHtml('<video src="x">')).toBe(false);
    expect(isEmptyHtml('<iframe src="x"></iframe>')).toBe(false);
    expect(isEmptyHtml('<embed src="x">')).toBe(false);
    expect(isEmptyHtml('')).toBe(true);
    expect(isEmptyHtml(null)).toBe(true);
    expect(isEmptyHtml(undefined)).toBe(true);
  });

  it('excerpts correctly', () => {
    expect(excerpt('<p>hello world</p>', 5)).toBe('hello…');
    expect(excerpt('<p>short</p>', 100)).toBe('short');
    expect(excerpt('', 10)).toBe('');
  });
});

describe('cookie', () => {
  it('round-trips', () => {
    setCookie('k', 'v w', { days: 1 });
    expect(getCookie('k')).toBe('v w');
    removeCookie('k');
    expect(getCookie('k')).toBeNull();
  });

  it('handles SSR (document undefined)', () => {
    const originalDocument = global.document;
    // @ts-expect-error testing SSR
    delete global.document;
    expect(getCookie('k')).toBeNull();
    setCookie('k', 'v', { days: 1 });
    removeCookie('k');
    global.document = originalDocument;
  });
});

describe('editor-paste', () => {
  it('cleans clipboard text', () => {
    const event = { clipboardData: { getData: () => 'a\r\nb​' } };
    expect(getPastedText(event)).toBe('a\nb');
  });

  it('normalizes pasted text', () => {
    expect(normalizePastedText('a\r\nb\r\nc')).toBe('a\nb\nc');
    expect(normalizePastedText('a​b​c')).toBe('abc');
  });

  it('handles plain text paste', () => {
    const insert = jest.fn();
    const event = {
      clipboardData: { getData: () => 'hello' },
      preventDefault: jest.fn(),
    } as unknown as React.ClipboardEvent<Element>;
    handlePlainTextPaste(event, insert);
    expect(event.preventDefault).toHaveBeenCalled();
    expect(insert).toHaveBeenCalledWith('hello');
  });
});

describe('format and string', () => {
  it('formats bytes and strings', () => {
    expect(formatBytes(1536)).toBe('1.5 KB');
    expect(formatBytes(10)).toBe('10 B');
    expect(truncate('abcdef', 4)).toBe('abc…');
    expect(slugify('Đây là Tiêu đề!')).toBe('day-la-tieu-de');
  });
});

describe('http-fetch-headers', () => {
  it('adds auth only with a token', () => {
    expect(buildFetchHeaders('t').Authorization).toBe('Bearer t');
    expect(buildFetchHeaders().Authorization).toBeUndefined();
  });
});

describe('user-action-error', () => {
  it('prefers status then action fallback', () => {
    expect(getUserActionError({ message: 'x', code: 403 }, 'delete')).toContain('権限');
    expect(getUserActionError({ message: 'x', code: 503 }, 'load')).toContain('サーバー');
    expect(getUserActionError(new Error('x'), 'create')).toContain('作成');
  });
});

describe('user-detail-display', () => {
  it('builds rows with placeholders', () => {
    const user = {
      id: 'U-1',
      username: 'a',
      email: 'a@b.c',
      affiliation: 'X',
      trainingDays: 1200,
      visionCheckDays: 0,
      checkDays: 0,
      registeredAt: '2026/01/01',
      expiresAt: null,
      subscriptionStatus: '未契約',
    } as AppUser;
    const rows = getUserDetailRows(user);
    expect(rows.find((r) => r.label === '有効期限')?.value).toBe('-');
    expect(rows.find((r) => r.label === 'トレーニング')?.value).toBe('1,200日');
  });
});
