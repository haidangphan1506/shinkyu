import { isEmptyHtml, stripHtml } from '@/utils/content';

describe('stripHtml', () => {
  it('giữ nguyên entity không có trong bảng ánh xạ', () => {
    expect(stripHtml('a &AMP; b')).toBe('a &AMP; b');
  });

  it('thay entity thường và gộp xuống dòng', () => {
    expect(stripHtml('<p>a&nbsp;b</p><p>c</p>')).toBe('a b\nc');
  });
});

describe('isEmptyHtml', () => {
  it('coi markup không có nội dung là rỗng', () => {
    expect(isEmptyHtml('<p><br></p>')).toBe(true);
    expect(isEmptyHtml('<p>text</p>')).toBe(false);
  });

  it('coi media là có nội dung', () => {
    expect(isEmptyHtml('<img src="x">')).toBe(false);
  });
});
